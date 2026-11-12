import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OuiElement } from "../../oui-element.js";

/**
 * @element oui-skeleton
 * @property circle - Fully rounded shape, e.g. for an avatar.
 * @cssprop [--oui-radius-skeleton=var(--oui-radius-panel)] - Border radius.
 * @csspart base - The pulsing block.
 */
@customElement("oui-skeleton")
export class OuiSkeleton extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: block;
                flex-shrink: 0;
                border-radius: var(--oui-radius-skeleton, var(--oui-radius-panel));
            }
            :host([circle]) {
                border-radius: 9999px;
            }
        `,
    ];

    @property({ type: Boolean, reflect: true }) circle = false;

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.ariaHidden = "true";
    }

    override render() {
        return html`<div
            part="base"
            class="bg-accent size-full animate-pulse rounded-[inherit] motion-reduce:animate-none"
        ></div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-skeleton": OuiSkeleton;
    }
}
