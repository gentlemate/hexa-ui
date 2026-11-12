import { css, html } from "lit";
import { OuiElement } from "./oui-element.js";

export abstract class OuiPanelFooterElement extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
