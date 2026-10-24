import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

export abstract class HxPanelTitleElement extends HxElement {
    static override styles = [
        HxElement.styles,
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
