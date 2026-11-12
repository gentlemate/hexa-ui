import { css, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { OuiElement } from "./oui-element.js";

/**
 * @property label - Heading of the group, also its accessible name.
 */
export abstract class OuiMenuGroupElement extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
                          class="text-muted-foreground px-option py-1.5 text-sm font-medium"
                      >
                          ${this.label}
                      </div>`
                    : nothing
            }<slot></slot>`;
    }
}
