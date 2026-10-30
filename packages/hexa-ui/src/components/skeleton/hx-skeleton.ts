import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-skeleton
 * @property circle - Fully rounded shape, e.g. for an avatar.
 * @cssprop [--hx-radius-skeleton=var(--hx-radius-panel)] - Border radius.
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
                border-radius: var(--hx-radius-skeleton, var(--hx-radius-panel));
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
