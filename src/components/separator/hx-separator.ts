import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

export type HxSeparatorDirection = "horizontal" | "vertical";

/**
 * @element hx-separator
 * @csspart line - The line, with its spacing as margins.
 */
@customElement("hx-separator")
export class HxSeparator extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                flex-shrink: 0;
                width: 100%;
            }
            :host([direction="vertical"]) {
                align-self: stretch;
                width: auto;
            }
            [part="line"] {
                height: var(--hx-border-width);
                margin-block: var(--hx-spacing-separator);
                background: var(--hx-border);
            }
            :host([direction="vertical"]) [part="line"] {
                height: 100%;
                width: var(--hx-border-width);
                margin-block: 0;
                margin-inline: var(--hx-spacing-separator);
            }
        `,
    ];

    @property({ reflect: true }) direction: HxSeparatorDirection = "horizontal";

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "separator";
    }

    protected override updated() {
        this.internals.ariaOrientation = this.direction;
    }

    override render() {
        return html`<div part="line"></div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-separator": HxSeparator;
    }
}
