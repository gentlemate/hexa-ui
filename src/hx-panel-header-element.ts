import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

/**
 * Base class for the headers of a panel (card header, modal header…): a grid with the title and the
 * description in the first column, and an optional action spanning both rows in the second one. Its
 * padding, its top rounding and the extra space on its right (e.g. for a close button) come from the
 * `--panel-spacing`, `--panel-radius` and `--panel-header-end` variables set by the panel.
 */
export abstract class HxPanelHeaderElement extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                border-radius: var(--panel-radius) var(--panel-radius) 0 0;
            }
        `,
    ];

    override render() {
        return html`<div
            class="grid grid-cols-[1fr_auto] items-start gap-y-1.5 p-(--panel-spacing) pr-[calc(var(--panel-spacing)+var(--panel-header-end))]"
        >
            <slot></slot>
        </div>`;
    }
}
