import { customElement } from "lit/decorators.js";
import { HxPanelDescriptionElement } from "../../hx-panel-description-element.js";

/**
 * @element hx-card-description
 * @slot - A short text under the title.
 */
@customElement("hx-card-description")
export class HxCardDescription extends HxPanelDescriptionElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-card-description": HxCardDescription;
    }
}
