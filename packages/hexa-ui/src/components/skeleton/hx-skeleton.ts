import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-skeleton
 * @csspart base - The pulsing block.
 */
@customElement("hx-skeleton")
export class HxSkeleton extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                flex-shrink: 0;
                border-radius: var(--hx-radius-card);
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
        "hx-skeleton": HxSkeleton;
    }
}
