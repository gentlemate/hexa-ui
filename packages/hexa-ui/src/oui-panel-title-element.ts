import { css, html } from "lit";
import { OuiElement } from "./oui-element.js";

export abstract class OuiPanelTitleElement extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
                grid-column: 1;
            }
        `,
    ];

    override render() {
        return html`<div class="text-lg leading-none font-medium"><slot></slot></div>`;
    }
}
