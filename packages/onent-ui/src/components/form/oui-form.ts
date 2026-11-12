import { css, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OuiElement } from "../../oui-element.js";
import "../form-field/oui-form-field.js";
import type { OuiFormField } from "../form-field/oui-form-field.js";

export type OuiFormState = Record<string, unknown>;

export type OuiFormError = { name: string; message: string };

export type OuiFormValidator = (state: OuiFormState) => OuiFormError[] | Promise<OuiFormError[]>;

export type OuiFormValidateOn = "blur" | "change" | "input";

type OuiFormSchemaResult =
    | { value: unknown; issues?: undefined }
    | {
          issues: readonly {
              message: string;
              path?: readonly (PropertyKey | { key: PropertyKey })[];
          }[];
      };

export type OuiFormSchema = {
    readonly "~standard": {
        validate(value: unknown): OuiFormSchemaResult | Promise<OuiFormSchemaResult>;
    };
};

export type OuiFormSubmitDetail = {
    data: unknown;
    waitUntil(promise: Promise<unknown>): void;
};

type OuiFormControl = HTMLElement & {
    name?: string;
    type?: string;
    value?: unknown;
    checked?: boolean;
    disabled?: boolean;
    loading?: boolean;
    startName?: string;
    endName?: string;
    start?: unknown;
    end?: unknown;
};

type OuiFormKey = "value" | "checked" | "start" | "end";

function bindingsOf(control: OuiFormControl): [string, OuiFormKey][] {
    if ("startName" in control) {
        const bindings: [string, OuiFormKey][] = [
            [control.startName ?? "", "start"],
            [control.endName ?? "", "end"],
        ];
        return bindings.filter(([name]) => name);
    }
    if (!control.name) return [];
    return [[control.name, "checked" in control && control.type !== "radio" ? "checked" : "value"]];
}

function readPath(state: OuiFormState, name: string) {
    return name.split(".").reduce<unknown>((value, key) => (value as OuiFormState | undefined)?.[key], state);
}

function writePath(state: OuiFormState, name: string, value: unknown) {
    const keys = name.split(".");
    const last = keys.pop()!;
    const parent = keys.reduce((object, key) => (object[key] ??= {}) as OuiFormState, state);
    parent[last] = value;
}

function nameOf(path: readonly (PropertyKey | { key: PropertyKey })[] = []) {
    return path.map((segment) => String(typeof segment === "object" ? segment.key : segment)).join(".");
}

/**
 * Validates the `<form>` it wraps and displays the errors on its `oui-form-field` elements. The form is never submitted
 * by the browser: `oui-submit` hands over the validated data instead. A `<form>` written inside the element is required,
 * since a `<form>` of the Shadow DOM would not own the controls.
 *
 * @element oui-form
 * @property {OuiFormSchema} schema - Standard Schema (Valibot, Zod…) checking the state. Set as a JS property.
 * @property {OuiFormValidator} validator - Custom validation, combined with `schema`. Set as a JS property.
 * @property {OuiFormValidateOn[]} validateOn - Events of a field that validate it, as a space-separated list in the attribute. Validation on `input` waits for the first blur of the field, unless it has `eager-validation` or an error. Submitting always validates.
 * @property validateOnInputDelay - Delay in milliseconds before validating on `input`.
 * @property disabled - Disables all the controls of the form.
 * @property submitting - Whether a submission is running, from its validation to the end of its `waitUntil` promises (read-only).
 * @property dirty - Whether the user changed a control since the last reset or assignment of `state` (read-only).
 * @property {OuiFormState} state - Values of the named controls, typed and nested by the dots of their names. The attribute takes the initial values as JSON. The last assigned state is restored on reset.
 * @property {OuiFormError[]} errors - Current errors (read-only).
 * @method validate - Checks the state and displays the errors, of the whole form or only of the given name or names. Returns a promise of these errors.
 * @method setErrors - Replaces all the errors, or those of the given name or names.
 * @method clear - Removes all the errors, or those of the given name or names.
 * @slot - The `<form>`.
 * @fires oui-submit - The state is valid; `event.detail.data` is the output of the schema, or the state without schema. A promise given to `event.detail.waitUntil()` keeps the form submitting until it settles.
 * @fires oui-error - The state is invalid; `event.detail.errors` lists the errors.
 */
@customElement("oui-form")
export class OuiForm extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ attribute: false }) schema?: OuiFormSchema;
    @property({ attribute: false }) validator?: OuiFormValidator;
    @property({
        attribute: "validate-on",
        converter: (value) => value?.split(/\s+/).filter(Boolean) ?? [],
    })
    validateOn: OuiFormValidateOn[] = ["blur", "change", "input"];
    @property({ type: Number, attribute: "validate-on-input-delay" }) validateOnInputDelay = 300;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) submitting = false;
    @property({ type: Boolean, reflect: true }) dirty = false;

    private initial?: OuiFormState;
    private currentErrors: OuiFormError[] = [];
    private disabledControls = new Set<OuiFormControl>();
    private blurred = new Set<OuiFormField>();
    private timers = new Map<OuiFormField, ReturnType<typeof setTimeout>>();
    private runs = new Map<string, number>();
    private run = 0;

    constructor() {
        super();
        this.addEventListener("submit", this.onSubmit);
        this.addEventListener("reset", this.onReset);
        this.addEventListener("input", this.onInput);
        this.addEventListener("change", this.onChange);
        this.addEventListener("focusout", this.onFocusOut);
        this.addEventListener("oui-field-connect", this.onFieldConnect);
    }

    private get form() {
        return this.querySelector("form");
    }

    private get controls() {
        return [...(this.form?.elements ?? [])] as OuiFormControl[];
    }

    private get fields() {
        return [...this.querySelectorAll("oui-form-field")];
    }

    @property({ type: Object })
    get state() {
        const state: OuiFormState = {};
        for (const control of this.controls) {
            if (control.type === "radio" && !control.checked) continue;
            for (const [name, key] of bindingsOf(control)) writePath(state, name, control[key]);
        }
        return state;
    }

    set state(state: OuiFormState) {
        this.initial = state;
        this.dirty = false;
        this.restore(this.controls);
    }

    get errors() {
        return [...this.currentErrors];
    }

    private restore(controls: OuiFormControl[]) {
        const state = this.initial;
        if (!state) return;
        for (const control of controls) {
            for (const [name, key] of bindingsOf(control)) {
                const value = readPath(state, name);
                if (value === undefined) continue;
                if (control.type === "radio") control.checked = control.value === value;
                else (control[key] as unknown) = value;
            }
        }
    }

    private syncDisabled() {
        for (const control of this.disabledControls) control.disabled = false;
        this.disabledControls.clear();
        if (!this.disabled) return;
        for (const control of this.controls) {
            if (!("disabled" in control) || control.disabled) continue;
            control.disabled = true;
            this.disabledControls.add(control);
        }
    }

    private sync() {
        const form = this.form;
        if (form && (this.schema || this.validator)) form.noValidate = true;
        this.syncDisabled();
    }

    private onSlotChange() {
        this.sync();
        this.restore(this.controls);
    }

    private onFieldConnect(event: Event) {
        const { control } = event.target as OuiFormField;
        if (control) this.restore([control]);
        this.syncDisabled();
    }

    private onReset(event: Event) {
        queueMicrotask(() => {
            if (event.defaultPrevented) return;
            this.cancelValidations();
            this.runs.clear();
            this.blurred.clear();
            this.dirty = false;
            this.clear();
            this.restore(this.controls);
        });
    }

    private fieldOf(event: Event) {
        const target = event.target as HTMLElement;
        const field = target.closest("oui-form-field");
        return field?.names.length && field.control?.contains(target) ? field : undefined;
    }

    private onInput(event: Event) {
        this.dirty = true;
        const field = this.fieldOf(event);
        if (!field || !this.validateOn.includes("input")) return;
        if (field.eagerValidation || field.error || this.blurred.has(field))
            this.schedule(field, this.validateOnInputDelay);
    }

    private onChange(event: Event) {
        this.dirty = true;
        const field = this.fieldOf(event);
        if (field && this.validateOn.includes("change")) this.schedule(field, 0);
    }

    private onFocusOut(event: FocusEvent) {
        const field = this.fieldOf(event);
        if (!field || field.control?.contains(event.relatedTarget as Node | null)) return;
        this.blurred.add(field);
        if (this.validateOn.includes("blur")) this.schedule(field, 0);
    }

    private schedule(field: OuiFormField, delay: number) {
        if (!this.schema && !this.validator) return;
        clearTimeout(this.timers.get(field));
        const timer = setTimeout(() => {
            this.timers.delete(field);
            this.validate(field.names);
        }, delay);
        this.timers.set(field, timer);
    }

    private cancelValidations() {
        for (const timer of this.timers.values()) clearTimeout(timer);
        this.timers.clear();
    }

    private async onSubmit(event: Event) {
        event.preventDefault();
        if (this.submitting || this.disabled) return;
        this.cancelValidations();
        this.submitting = true;
        try {
            const { errors, data } = await this.check();
            if (errors.length) {
                this.dispatchEvent(new CustomEvent("oui-error", { bubbles: true, composed: true, detail: { errors } }));
                this.fields.find((field) => field.error)?.focus();
                return;
            }
            const pending: Promise<unknown>[] = [];
            const detail: OuiFormSubmitDetail = { data, waitUntil: (promise) => pending.push(promise) };
            this.dispatchEvent(new CustomEvent("oui-submit", { bubbles: true, composed: true, detail }));
            await Promise.all(pending);
        } finally {
            this.submitting = false;
        }
    }

    private async check(names?: string[]) {
        const run = ++this.run;
        const scope = names?.join(" ") ?? "";
        this.runs.set(scope, run);
        const state = this.state;
        const [result, custom = []] = await Promise.all([
            this.schema?.["~standard"].validate(state),
            this.validator?.(state),
        ]);
        const issues = result?.issues ?? [];
        const all = [...issues.map((issue) => ({ name: nameOf(issue.path), message: issue.message })), ...custom];
        const errors = names ? all.filter(({ name }) => names.includes(name)) : all;
        const latest = this.runs.get(scope) === run && (!names || run > (this.runs.get("") ?? 0));
        if (latest) this.setErrors(errors, names);
        return { errors, data: result && !result.issues ? result.value : state };
    }

    async validate(name?: string | string[]) {
        return (await this.check(name === undefined ? undefined : [name].flat())).errors;
    }

    setErrors(errors: OuiFormError[], name?: string | string[]) {
        const names = name === undefined ? undefined : [name].flat();
        this.currentErrors = names
            ? [...this.currentErrors.filter((error) => !names.includes(error.name)), ...errors]
            : [...errors];
        for (const field of this.fields) {
            const error = this.currentErrors.find(({ name }) => field.names.includes(name));
            field.error = error?.message ?? "";
        }
    }

    clear(name?: string | string[]) {
        this.setErrors([], name);
    }

    protected override updated(changed: PropertyValues<this>) {
        this.sync();
        if (!changed.has("submitting")) return;
        for (const control of this.controls) {
            if (control.localName === "oui-button" && control.type === "submit") control.loading = this.submitting;
        }
    }

    override render() {
        return html`<slot @slotchange=${this.onSlotChange}></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-form": OuiForm;
    }
}
