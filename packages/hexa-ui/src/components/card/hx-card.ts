import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

export type HxCardVariant = "default" | "outline" | "ghost";

const variants: Record<HxCardVariant, string> = {
    default: "bg-surface text-surface-foreground ring-(length:--hx-border-width) ring-foreground/10",
    outline: "bg-background text-foreground ring-(length:--hx-border-width) ring-foreground/10",
    ghost: "",
};

/**
 * @element hx-card
 * @property variant - Visual style.
 * @slot - The card sections: `hx-card-header`, `hx-card-content` and `hx-card-footer`.
 * @cssprop [--hx-spacing-card=var(--hx-spacing-panel)] - Padding.
 * @cssprop [--hx-radius-card=var(--hx-radius-panel)] - Border radius.
 * @csspart base - The card container.
 */
@customElement("hx-card")
export class HxCard extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ reflect: true }) variant: HxCardVariant = "default";

    @state() private hasHeader = false;
    @state() private hasFooter = false;

    private onSlotChange(event: Event) {
        const sections = (event.target as HTMLSlotElement).assignedElements().map((element) => element.localName);
        this.hasHeader = sections.includes("hx-card-header");
        this.hasFooter = sections.includes("hx-card-footer");
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
        "hx-card": HxCard;
    }
}
