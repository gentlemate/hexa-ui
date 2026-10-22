import { customElement } from "lit/decorators.js";
import { HxPanelHeaderElement } from "../../hx-panel-header-element.js";

/**
 * @element hx-modal-header
 * @slot - The `hx-modal-title` and `hx-modal-description` elements, or a custom header.
 */
@customElement("hx-modal-header")
export class HxModalHeader extends HxPanelHeaderElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal-header": HxModalHeader;
    }
}
