import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

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
