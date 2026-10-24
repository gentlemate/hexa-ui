import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

export abstract class HxPanelContentElement extends HxElement {
    static override styles = [
        HxElement.styles,
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
