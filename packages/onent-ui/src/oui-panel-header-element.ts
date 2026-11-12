import { css, html } from "lit";
import { OuiElement } from "./oui-element.js";

export abstract class OuiPanelHeaderElement extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
