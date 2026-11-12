import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { OuiElement } from "../../oui-element.js";

/**
 * @element oui-card-action
 * @slot - An element aligned to the top right of the `oui-card-header` (button, badge…).
 */
@customElement("oui-card-action")
export class OuiCardAction extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
        "oui-card-action": OuiCardAction;
    }
}
