import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

export abstract class HxMenuSeparatorElement extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
            [part="line"] {
                height: var(--hx-border-width);
                margin: var(--hx-spacing-popover) calc(var(--hx-spacing-popover) * -1);
                background: var(--hx-border);
            }
        `,
    ];

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "separator";
    }

    override render() {
        return html`<div part="line"></div>`;
    }
}
