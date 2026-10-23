import { css, html } from "lit";
import { HxElement } from "./hx-element.js";

/**
 * Base class for the descriptions of a panel header (card description, modal description…): a short
 * muted text under the title.
 */
export abstract class HxPanelDescriptionElement extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                grid-column: 1;
            }
        `,
    ];

    override render() {
        return html`<div class="text-muted-foreground"><slot></slot></div>`;
    }
}
