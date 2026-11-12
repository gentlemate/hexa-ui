import { customElement } from "lit/decorators.js";
import { OuiPanelHeaderElement } from "../../oui-panel-header-element.js";

/**
 * @element oui-card-header
 * @slot - The `oui-card-title`, `oui-card-description` and `oui-card-action` elements, or a custom header.
 */
@customElement("oui-card-header")
export class OuiCardHeader extends OuiPanelHeaderElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-card-header": OuiCardHeader;
    }
}
