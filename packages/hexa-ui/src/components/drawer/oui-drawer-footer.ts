import { customElement } from "lit/decorators.js";
import { OuiPanelFooterElement } from "../../oui-panel-footer-element.js";

/**
 * @element oui-drawer-footer
 * @slot - The drawer footer (actions…). Elements with `data-close` close the drawer on click.
 */
@customElement("oui-drawer-footer")
export class OuiDrawerFooter extends OuiPanelFooterElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-drawer-footer": OuiDrawerFooter;
    }
}
