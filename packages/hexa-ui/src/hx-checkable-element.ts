import { css, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { HxElement } from "./hx-element.js";

/**
 * Base class for controls that toggle a boolean `checked` state (checkbox, switch).
 *
 * The host itself is the control: it carries the ARIA role, the focus and the form value, so a
 * native `<label for>` or an `<hx-label for>` can target it and give it its accessible name.
 * Subclasses render a `part="control"` element, which receives the focus ring.
 */
export abstract class HxCheckableElement extends HxElement {
    static formAssociated = true;
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                user-select: none;
                outline: none;
            }
            :host([disabled]) {
                cursor: not-allowed;
                opacity: 0.5;
            }
            :host(:focus-visible) [part~="control"] {
                border-color: var(--hx-ring);
                box-shadow: 0 0 0 3px color-mix(in oklab, var(--hx-ring) 50%, transparent);
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property() value = "on";
    @property({ type: Boolean }) checked = false;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    protected internals = this.attachInternals();

    constructor(role: "checkbox" | "switch") {
        super();
        this.internals.role = role;
        this.addEventListener("click", (event) => {
            if (this.disabled) return event.stopImmediatePropagation();
            this.toggle();
        });
        this.addEventListener("keydown", (event) => {
            if (event.key !== " ") return;
            event.preventDefault();
            this.click();
        });
    }

    protected toggle() {
        this.checked = !this.checked;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    protected get checkedState(): "true" | "false" | "mixed" {
        return this.checked ? "true" : "false";
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("disabled")) this.tabIndex = this.disabled ? -1 : 0;
    }

    protected override updated() {
        this.internals.ariaChecked = this.checkedState;
        this.internals.ariaDisabled = String(this.disabled);
        this.internals.ariaRequired = String(this.required);
        if (this.checked) this.internals.states.add("checked");
        else this.internals.states.delete("checked");

        this.internals.setFormValue(this.checked ? this.value : null);
        if (this.required && !this.checked)
            this.internals.setValidity({ valueMissing: true }, "Please check this box to continue.");
        else this.internals.setValidity({});
    }

    formResetCallback() {
        this.checked = this.hasAttribute("checked");
    }
}
