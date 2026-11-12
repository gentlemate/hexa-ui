import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OuiElement } from "../../oui-element.js";

export type OuiCardVariant = "default" | "outline" | "ghost";

const variants: Record<OuiCardVariant, string> = {
    default: "bg-surface text-surface-foreground ring-(length:--oui-border-width) ring-foreground/10",
    outline: "bg-background text-foreground ring-(length:--oui-border-width) ring-foreground/10",
    ghost: "",
};

/**
 * @element oui-card
 * @property variant - Visual style.
 * @slot - The card sections: `oui-card-header`, `oui-card-content` and `oui-card-footer`.
 * @cssprop [--oui-spacing-card=var(--oui-spacing-panel)] - Padding.
 * @cssprop [--oui-radius-card=var(--oui-radius-panel)] - Border radius.
 * @csspart base - The card container.
 */
@customElement("oui-card")
export class OuiCard extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ reflect: true }) variant: OuiCardVariant = "default";

    @state() private hasHeader = false;
    @state() private hasFooter = false;

    private onSlotChange(event: Event) {
        const sections = (event.target as HTMLSlotElement).assignedElements().map((element) => element.localName);
        this.hasHeader = sections.includes("oui-card-header");
        this.hasFooter = sections.includes("oui-card-footer");
    }

    override render() {
        return html`<div
            part="base"
            class="${variants[this.variant]} ${this.hasHeader ? "" : "pt-card"} ${
                this.hasFooter ? "" : "pb-card"
            } rounded-card flex flex-col [--panel-footer-justify:flex-start] [--panel-header-end:0px] [--panel-radius:var(--radius-card)] [--panel-spacing:var(--spacing-card)]"
        >
            <slot @slotchange=${this.onSlotChange}></slot>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-card": OuiCard;
    }
}
