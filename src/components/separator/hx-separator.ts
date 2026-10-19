import { css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

export type HxSeparatorDirection = "horizontal" | "vertical";

/**
 * @element hx-separator
 */
@customElement("hx-separator")
export class HxSeparator extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                flex-shrink: 0;
                height: var(--hx-border-width);
                width: 100%;
                background: var(--hx-border);
            }
            :host([direction="vertical"]) {
                align-self: stretch;
                height: auto;
                width: var(--hx-border-width);
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
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-separator": HxSeparator;
    }
}
