import { customElement } from "lit/decorators.js";
import { HxPanelHeaderElement } from "../../hx-panel-header-element.js";

/**
 * @element hx-card-header
 * @slot - The `hx-card-title`, `hx-card-description` and `hx-card-action` elements, or a custom header.
 */
@customElement("hx-card-header")
export class HxCardHeader extends HxPanelHeaderElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-card-header": HxCardHeader;
    }
}
