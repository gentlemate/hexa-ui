import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-label
 * @slot - The label text.
 * @csspart base - The inner `<label>` element.
 */
@customElement("hx-label")
export class HxLabel extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: inline-flex;
            }
        `,
    ];

    @property({ attribute: "for" }) htmlFor = "";
    @property({ type: Boolean, reflect: true }) required = false;

    constructor() {
        super();
        this.addEventListener("click", () => {
            const control = this.control;
            if (!control) return;
            control.focus();
            control.click();
        });
    }

    get control(): HTMLElement | null {
        if (!this.htmlFor) return null;
        const root = this.getRootNode() as Document | ShadowRoot;
        return root.getElementById(this.htmlFor);
    }

    protected override updated() {
        const control = this.control;
        if (control) control.ariaLabelledByElements = [this];
    }

    override render() {
        return html`<label part="base" class="text-foreground leading-none select-none">
            <slot></slot>${
                this.required ? html`<span class="text-destructive ml-0.5" aria-hidden="true">*</span>` : nothing
            }
        </label>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-label": HxLabel;
    }
}
