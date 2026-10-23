import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

/**
 * Base class for the contents of a panel (card content, modal content…): fills the remaining height
 * of the panel and scrolls when it overflows. Its horizontal padding comes from `--panel-spacing`;
 * the space above and below is given by the header and footer, or by the panel when they are absent.
 */
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
