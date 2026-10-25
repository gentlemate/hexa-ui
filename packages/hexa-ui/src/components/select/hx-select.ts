import type { Placement } from "@floating-ui/dom";
import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ChevronDown } from "lucide";
import { FloatingController } from "../../controllers/floating-controller.js";
import { ListNavigation } from "../../controllers/list-navigation.js";
import { hasFocus } from "../../focus-target.js";
import { HxElement } from "../../hx-element.js";
import { HxOverlayElement } from "../../hx-overlay-element.js";
import "../icon/hx-icon.js";
import "./hx-select-group.js";
import "./hx-select-separator.js";
import { HxSelectOption } from "./hx-select-option.js";

export type HxSelectPlacement = Placement;

/**
 * @element hx-select
 * @property name - Name submitted with the form.
 * @property value - Value of the selected option.
 * @property label - Label displayed above the field.
 * @property placeholder - Text shown when no option is selected.
 * @property hint - Help text under the field, replaced by `error` when set.
 * @property error - Error message under the field; also marks the field as invalid.
 * @property placement - Position of the listbox relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the listbox.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @property focusTarget - The inner element that receives the focus (read-only).
 * @slot - The `hx-select-option`, `hx-select-group` and `hx-select-separator` elements.
 * @fires input - The user selected another option.
 * @fires change - The user selected another option.
 * @fires hx-show - The listbox is about to open. Cancelable.
 * @fires hx-after-show - The listbox is open and its enter animation finished.
 * @fires hx-hide - The listbox is about to close. Cancelable.
 * @fires hx-after-hide - The listbox is closed and its exit animation finished.
 * @csspart trigger - The button showing the selected option.
 * @csspart value - The selected option label, or the placeholder.
 * @csspart chevron - The chevron of the trigger.
 * @csspart popup - The listbox panel.
 */
@customElement("hx-select")
export class HxSelect extends HxOverlayElement {
    static formAssociated = true;
    static override shadowRootOptions = { ...HxElement.shadowRootOptions, delegatesFocus: true };
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property() value = "";
    @property() label = "";
    @property() placeholder = "";
    @property() hint = "";
    @property() error = "";
    @property({ reflect: true }) placement: HxSelectPlacement = "bottom-start";
    @property({ type: Number }) distance = 4;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    @query("#trigger") focusTarget!: HTMLButtonElement;
    @query("#popup") protected overlay!: HTMLElement;

    private internals = this.attachInternals();
    private navigation = new ListNavigation(
        () => this.options,
        (option) => option.label,
    );
    private observer = new MutationObserver(() => this.requestUpdate());
    private openOnPointerDown = false;

    private floating = new FloatingController(this, () => ({
        anchor: this.focusTarget,
        floating: this.overlay,
        placement: this.placement,
        distance: this.distance,
        fit: true,
        matchWidth: true,
    }));

    constructor() {
        super();
        this.addEventListener("pointerdown", (event) => {
            if (this.fromTrigger(event)) this.openOnPointerDown = this.open;
        });
        this.addEventListener("pointermove", (event) => this.onPointerMove(event));
        this.addEventListener("click", (event) => this.onClick(event));
        this.addEventListener("keydown", (event) => this.onKeyDown(event));
    }

    override connectedCallback() {
        super.connectedCallback();
        this.observer.observe(this, {
            subtree: true,
            childList: true,
            characterData: true,
            attributeFilter: ["value", "disabled"],
        });
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        this.observer.disconnect();
    }

    private get options() {
        return [...this.querySelectorAll("hx-select-option")];
    }

    private get selectedOption() {
        return this.options.find((option) => option.value === this.value);
    }

    private fromTrigger(event: Event) {
        return !!this.focusTarget && event.composedPath().includes(this.focusTarget);
    }

    private optionFrom(target: EventTarget | null) {
        return target instanceof Element ? (target.closest("hx-select-option") ?? undefined) : undefined;
    }

    private select(option: HxSelectOption) {
        if (option.disabled) return;
        const changed = option.value !== this.value;
        this.value = option.value;
        this.hide();
        if (!changed) return;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private onClick(event: MouseEvent) {
        if (this.fromTrigger(event)) {
            const wasOpen = event.detail > 0 ? this.openOnPointerDown : this.open;
            return wasOpen ? this.hide() : this.show();
        }
        const option = this.optionFrom(event.target);
        if (option) this.select(option);
    }

    private onKeyDown(event: KeyboardEvent) {
        if (this.fromTrigger(event)) return this.onTriggerKeyDown(event);
        const option = this.optionFrom(event.target);
        if (option || event.composedPath()[0] === this.overlay) this.onListKeyDown(event, option);
    }

    private onTriggerKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            return this.show();
        }
        if (event.key === " " || event.key === "Enter") return;
        const option = this.navigation.target(event, this.selectedOption);
        if (!option) return;
        event.preventDefault();
        this.select(option);
    }

    private onListKeyDown(event: KeyboardEvent, option?: HxSelectOption) {
        switch (event.key) {
            case "Enter":
            case " ":
                if (option) this.select(option);
                break;
            case "Escape":
            case "Tab":
                this.hide();
                break;
            default: {
                const next = this.navigation.target(event, option);
                if (!next) return;
                next.focus();
            }
        }
        event.preventDefault();
        event.stopPropagation();
    }

    private onPointerMove(event: PointerEvent) {
        const option = this.optionFrom(event.target);
        if (option && !option.disabled && !option.matches(":focus")) option.focus({ preventScroll: true });
    }

    private onPointerLeave() {
        if (this.optionFrom(document.activeElement)) this.overlay.focus();
    }

    private onLabelClick(event: MouseEvent) {
        event.preventDefault();
        this.focusTarget.focus();
    }

    override show() {
        if (!this.disabled) super.show();
    }

    protected override present() {
        if (!this.overlay.matches(":popover-open")) this.overlay.showPopover({ source: this.focusTarget });
        this.floating.start();
        const selected = this.selectedOption;
        const option = selected && !selected.disabled ? selected : this.options.find((option) => !option.disabled);
        if (!option) return this.overlay.focus();
        option.focus({ preventScroll: true });
        requestAnimationFrame(() => option.scrollIntoView({ block: "nearest" }));
    }

    protected override dismiss() {
        super.dismiss();
        this.floating.stop();
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        const selected = this.selectedOption;
        for (const option of this.options) option.selected = option === selected;

        this.internals.setFormValue(this.value);
        if (this.required && !this.value)
            this.internals.setValidity({ valueMissing: true }, "Please select an item in the list.", this.focusTarget);
        else this.internals.setValidity({});

        if (changed.has("disabled") && this.disabled) this.hide();
        if (changed.has("open") && !this.open && changed.get("open") !== undefined && hasFocus(this))
            this.focusTarget.focus();
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    override render() {
        const selected = this.selectedOption;
        return html`
            <div class="text-foreground flex flex-col gap-1.5">
                ${
                    this.label
                        ? html`<label id="label" for="trigger" @click=${this.onLabelClick}
                              >${this.label}${
                                  this.required
                                      ? html`<span class="text-destructive ml-0.5" aria-hidden="true">*</span>`
                                      : nothing
                              }</label
                          >`
                        : nothing
                }
                <button
                    id="trigger"
                    part="trigger"
                    type="button"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-controls="popup"
                    aria-expanded=${this.open ? "true" : "false"}
                    aria-labelledby=${ifDefined(this.label ? "label" : undefined)}
                    aria-required=${this.required ? "true" : "false"}
                    aria-invalid=${this.error ? "true" : "false"}
                    class="border-input bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 rounded-control h-input px-input flex w-full cursor-pointer items-center justify-between gap-2 border text-left shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                    ?disabled=${this.disabled}
                >
                    <span part="value" class="${selected ? "" : "text-muted-foreground"} truncate"
                        >${selected ? selected.label : this.placeholder}</span
                    >
                    <hx-icon part="chevron" .icon=${ChevronDown} class="text-muted-foreground"></hx-icon>
                </button>
                ${
                    this.error
                        ? html`<p class="text-destructive text-sm" role="alert">${this.error}</p>`
                        : this.hint
                          ? html`<p class="text-muted-foreground text-sm">${this.hint}</p>`
                          : nothing
                }
            </div>
            <div
                part="popup"
                id="popup"
                popover="auto"
                role="listbox"
                tabindex="-1"
                aria-labelledby=${ifDefined(this.label ? "label" : undefined)}
                data-state=${this.open ? "open" : "closed"}
                class="bg-popover text-popover-foreground border-border animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-popover p-popover inset-auto m-0 overflow-x-hidden overflow-y-auto border shadow-md outline-none"
                @pointerleave=${this.onPointerLeave}
            >
                <slot @slotchange=${() => this.requestUpdate()}></slot>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-select": HxSelect;
    }
}
