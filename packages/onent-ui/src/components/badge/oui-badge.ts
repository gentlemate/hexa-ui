import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IconNode } from "lucide";
import { OuiElement } from "../../oui-element.js";
import "../icon/oui-icon.js";

export type OuiBadgeVariant = "primary" | "secondary" | "outline" | "destructive";
export type OuiBadgeIconPlacement = "left" | "right";

const variants: Record<OuiBadgeVariant, string> = {
    primary: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    outline: "border-border text-foreground",
    destructive: "border-transparent bg-destructive text-white",
};

/**
 * @element oui-badge
 * @property variant - Visual style.
 * @property icon - Lucide icon, set as a JS property.
 * @property iconPlacement - Side of the icon relative to the label.
 * @slot - The badge content (text, icon…).
 * @cssprop [--oui-height-badge=1.5rem] - Height.
 * @cssprop [--oui-spacing-badge=0.5rem] - Horizontal padding.
 * @cssprop [--oui-radius-badge=var(--oui-radius-pill)] - Border radius.
 * @csspart base - The inner wrapper.
 * @csspart icon - The `oui-icon` rendered from the `icon` property.
 */
@customElement("oui-badge")
export class OuiBadge extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: inline-flex;
            }
        `,
    ];

    @property({ reflect: true }) variant: OuiBadgeVariant = "primary";
    @property({ attribute: false }) icon?: IconNode;
    @property({ attribute: "icon-placement", reflect: true }) iconPlacement: OuiBadgeIconPlacement = "left";

    override render() {
        const icon = this.icon ? html`<oui-icon part="icon" .icon=${this.icon} size="12"></oui-icon>` : nothing;
        return html`<span
            part="base"
            class="${variants[this.variant]} h-badge px-badge rounded-badge inline-flex shrink-0 items-center justify-center gap-1 border text-sm whitespace-nowrap"
        >
            ${this.iconPlacement === "left" ? icon : nothing}<slot></slot>${
                this.iconPlacement === "right" ? icon : nothing
            }
        </span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-badge": OuiBadge;
    }
}
