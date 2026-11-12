import { css, html } from "lit";
import { OuiElement } from "./oui-element.js";

export abstract class OuiPanelDescriptionElement extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
