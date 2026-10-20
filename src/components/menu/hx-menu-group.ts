import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

/**
 * @element hx-menu-group
 * @slot - The grouped `hx-menu-item` elements. Radio items are exclusive within their group.
 * @csspart label - The group heading, rendered when `label` is set.
 */
@customElement("hx-menu-group")
export class HxMenuGroup extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property() label = "";

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "group";
    }

    protected override updated() {
        this.internals.ariaLabel = this.label || null;
    }

    override render() {
        return html`${
                this.label
                    ? html`<div
                          part="label"
                          aria-hidden="true"
                          class="text-muted-foreground px-2 py-1.5 text-sm font-medium"
                      >
                          ${this.label}
                      </div>`
                    : nothing
            }<slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-menu-group": HxMenuGroup;
    }
}
