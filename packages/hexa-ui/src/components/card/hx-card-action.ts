import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-card-action
 * @slot - An element aligned to the top right of the `hx-card-header` (button, badge…).
 */
@customElement("hx-card-action")
export class HxCardAction extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                grid-column: 2;
                grid-row: 1 / span 2;
            }
        `,
    ];

    override render() {
        return html`<div class="pl-4"><slot></slot></div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-card-action": HxCardAction;
    }
}
