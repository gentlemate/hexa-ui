import { css, html } from "lit";
import { OuiElement } from "./oui-element.js";

export abstract class OuiPanelContentElement extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
                flex: 1;
                min-height: 0;
                overflow-y: auto;
            }
        `,
    ];

    override render() {
        return html`<div class="px-(--panel-spacing)"><slot></slot></div>`;
    }
}
