import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

/**
 * Base class for the footers of a panel (card footer, modal footer…): a row of actions. Its padding,
 * its bottom rounding and the alignment of its items come from the `--panel-spacing`, `--panel-radius`
 * and `--panel-footer-justify` variables set by the panel.
 */
export abstract class HxPanelFooterElement extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                border-radius: 0 0 var(--panel-radius) var(--panel-radius);
            }
        `,
    ];

    override render() {
        return html`<div
            class="flex items-center [justify-content:var(--panel-footer-justify)] gap-2 p-(--panel-spacing)"
        >
            <slot></slot>
        </div>`;
    }
}
