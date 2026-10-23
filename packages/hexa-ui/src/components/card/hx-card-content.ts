import { customElement } from "lit/decorators.js";
import { HxPanelContentElement } from "../../hx-panel-content-element.js";

/**
 * @element hx-card-content
 * @slot - The card content.
 */
@customElement("hx-card-content")
export class HxCardContent extends HxPanelContentElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-card-content": HxCardContent;
    }
}
