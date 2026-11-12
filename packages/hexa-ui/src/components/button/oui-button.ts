import { css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LoaderCircle, type IconNode } from "lucide";
import { OuiElement } from "../../oui-element.js";
import "../icon/oui-icon.js";

export type OuiButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type OuiButtonIconPlacement = "left" | "right";

const base =
    "inline-flex h-button cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-button outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none";

const variants: Record<OuiButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-white hover:bg-destructive/90",
};

/**
 * @element oui-button
 * @property variant - Visual style.
 * @property type - `submit` and `reset` act on the parent `<form>`.
 * @property disabled - Disables the button.
 * @property loading - Shows a spinner in place of the icon and ignores clicks.
 * @property square - Square button without horizontal padding, for an icon alone.
 * @property icon - Lucide icon, set as a JS property.
 * @property iconPlacement - Side of the icon relative to the label.
 * @property focusTarget - The inner element that receives the focus (read-only).
 * @slot - The button label (text, icon…).
 * @cssprop [--oui-height-button=var(--oui-height-control)] - Height.
 * @cssprop [--oui-spacing-button=var(--oui-spacing-control)] - Horizontal padding.
 * @cssprop [--oui-radius-button=var(--oui-radius-control)] - Border radius.
 * @csspart base - The inner `<button>` element.
 * @csspart icon - The `oui-icon` rendered from the `icon` property.
 */
@customElement("oui-button")
export class OuiButton extends OuiElement {
    static formAssociated = true;
    static override shadowRootOptions = { ...OuiElement.shadowRootOptions, delegatesFocus: true };
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: inline-flex;
            }
        `,
    ];

    @property({ reflect: true }) variant: OuiButtonVariant = "primary";
    @property() type: "button" | "submit" | "reset" = "button";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) loading = false;
    @property({ type: Boolean, reflect: true }) square = false;
    @property({ attribute: false }) icon?: IconNode;
    @property({ attribute: "icon-placement", reflect: true }) iconPlacement: OuiButtonIconPlacement = "left";

    @query("button") focusTarget!: HTMLButtonElement;

    private internals = this.attachInternals();

    constructor() {
        super();
        this.addEventListener("click", (event) => {
            if (this.disabled || this.loading) return event.stopImmediatePropagation();
            if (this.type === "submit") this.internals.form?.requestSubmit();
            if (this.type === "reset") this.internals.form?.reset();
        });
    }

    override render() {
        const icon = this.loading
            ? html`<oui-icon part="icon" class="animate-spin" .icon=${LoaderCircle}></oui-icon>`
            : this.icon
              ? html`<oui-icon part="icon" .icon=${this.icon}></oui-icon>`
              : nothing;
        return html`<button
            part="base"
            class="${base} ${variants[this.variant]} ${this.square ? "aspect-square" : "px-button"}"
            type="button"
            aria-busy=${this.loading ? "true" : "false"}
            ?disabled=${this.disabled}
        >
            ${this.iconPlacement === "left" ? icon : nothing}<slot></slot>${
                this.iconPlacement === "right" ? icon : nothing
            }
        </button>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-button": OuiButton;
    }
}
