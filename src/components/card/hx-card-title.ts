import { customElement } from "lit/decorators.js";
import { HxPanelTitleElement } from "../../hx-panel-title-element.js";

/**
 * @element hx-card-title
 * @slot - The card title.
 */
@customElement("hx-card-title")
export class HxCardTitle extends HxPanelTitleElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-card-title": HxCardTitle;
    }
}
