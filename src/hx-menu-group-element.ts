import { css, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { HxElement } from "./hx-element.js";

/**
 * Base class for the groups of a popup list (menu group, option group): an ARIA `group` named by
 * `label`, which is also rendered as a heading.
 */
export abstract class HxMenuGroupElement extends HxElement {
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
                          class="text-muted-foreground px-menu-item py-1.5 text-sm font-medium"
                      >
                          ${this.label}
                      </div>`
                    : nothing
            }<slot></slot>`;
    }
}
