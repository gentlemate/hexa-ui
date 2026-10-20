import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-menu-separator
 * @csspart line - The separator line.
 */
@customElement("hx-menu-separator")
export class HxMenuSeparator extends HxElement {
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

declare global {
    interface HTMLElementTagNameMap {
        "hx-menu-separator": HxMenuSeparator;
    }
}
