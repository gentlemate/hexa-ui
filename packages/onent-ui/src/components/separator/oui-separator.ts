import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OuiElement } from "../../oui-element.js";

export type OuiSeparatorDirection = "horizontal" | "vertical";

/**
 * @element oui-separator
 * @property direction - Orientation of the line.
 * @cssprop [--oui-spacing-separator=1rem] - Space on both sides of the line.
 * @csspart line - The line, with its spacing as margins.
 */
@customElement("oui-separator")
export class OuiSeparator extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
                height: var(--oui-border-width);
                margin-block: var(--oui-spacing-separator);
                background: var(--oui-border);
            }
            :host([direction="vertical"]) [part="line"] {
                height: 100%;
                width: var(--oui-border-width);
                margin-block: 0;
                margin-inline: var(--oui-spacing-separator);
            }
        `,
    ];

    @property({ reflect: true }) direction: OuiSeparatorDirection = "horizontal";

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
        "oui-separator": OuiSeparator;
    }
}
