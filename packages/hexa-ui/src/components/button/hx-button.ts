import { css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { IconNode } from "lucide";
import { HxElement } from "../../hx-element.js";
import "../icon/hx-icon.js";

export type HxButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type HxButtonIconPlacement = "left" | "right";

const base =
    "inline-flex h-button cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<HxButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-white hover:bg-destructive/90",
};

/**
 * @element hx-button
 * @property variant - Visual style.
 * @property type - `submit` and `reset` act on the parent `<form>`.
 * @property disabled - Disables the button.
 * @property square - Square button without horizontal padding, for an icon alone.
 * @property icon - Lucide icon, set as a JS property.
 * @property iconPlacement - Side of the icon relative to the label.
 * @property focusTarget - The inner element that receives the focus (read-only).
 * @slot - The button label (text, icon…).
 * @csspart base - The inner `<button>` element.
 * @csspart icon - The `hx-icon` rendered from the `icon` property.
 */
@customElement("hx-button")
export class HxButton extends HxElement {
    static formAssociated = true;
    static override shadowRootOptions = { ...HxElement.shadowRootOptions, delegatesFocus: true };
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: inline-flex;
            }
        `,
    ];

    @property({ reflect: true }) variant: HxButtonVariant = "primary";
    @property() type: "button" | "submit" | "reset" = "button";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) square = false;
    @property({ attribute: false }) icon?: IconNode;
    @property({ attribute: "icon-placement", reflect: true }) iconPlacement: HxButtonIconPlacement = "left";

    @query("button") focusTarget!: HTMLButtonElement;

    private internals = this.attachInternals();

    constructor() {
        super();
        this.addEventListener("click", (event) => {
            if (this.disabled) return event.stopImmediatePropagation();
            if (this.type === "submit") this.internals.form?.requestSubmit();
            if (this.type === "reset") this.internals.form?.reset();
        });
    }

    override render() {
        const icon = this.icon ? html`<hx-icon part="icon" .icon=${this.icon}></hx-icon>` : nothing;
        return html`<button
            part="base"
            class="${base} ${variants[this.variant]} ${this.square ? "aspect-square" : "px-button"}"
            type="button"
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
        "hx-button": HxButton;
    }
}
