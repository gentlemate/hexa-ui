import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IconNode } from "lucide";
import { HxElement } from "../../hx-element.js";
import "../icon/hx-icon.js";

export type HxBadgeVariant = "primary" | "secondary" | "outline" | "destructive";
export type HxBadgeIconPlacement = "left" | "right";

const variants: Record<HxBadgeVariant, string> = {
    primary: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    outline: "border-border text-foreground",
    destructive: "border-transparent bg-destructive text-white",
};

/**
 * @element hx-badge
 * @property variant - Visual style.
 * @property icon - Lucide icon, set as a JS property.
 * @property iconPlacement - Side of the icon relative to the label.
 * @slot - The badge content (text, icon…).
 * @cssprop [--hx-height-badge=1.5rem] - Height.
 * @cssprop [--hx-spacing-badge=0.5rem] - Horizontal padding.
 * @csspart base - The inner wrapper.
 * @csspart icon - The `hx-icon` rendered from the `icon` property.
 */
@customElement("hx-badge")
export class HxBadge extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: inline-flex;
            }
        `,
    ];

    @property({ reflect: true }) variant: HxBadgeVariant = "primary";
    @property({ attribute: false }) icon?: IconNode;
    @property({ attribute: "icon-placement", reflect: true }) iconPlacement: HxBadgeIconPlacement = "left";

    override render() {
        const icon = this.icon ? html`<hx-icon part="icon" .icon=${this.icon} size="12"></hx-icon>` : nothing;
        return html`<span
            part="base"
            class="${variants[this.variant]} h-badge px-badge inline-flex shrink-0 items-center justify-center gap-1 rounded-full border text-sm whitespace-nowrap"
        >
            ${this.iconPlacement === "left" ? icon : nothing}<slot></slot>${
                this.iconPlacement === "right" ? icon : nothing
            }
        </span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-badge": HxBadge;
    }
}
