import { customElement } from "lit/decorators.js";
import { HxPanelFooterElement } from "../../hx-panel-footer-element.js";

/**
 * @element hx-drawer-footer
 * @slot - The drawer footer (actions…). Elements with `data-close` close the drawer on click.
 */
@customElement("hx-drawer-footer")
export class HxDrawerFooter extends HxPanelFooterElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-drawer-footer": HxDrawerFooter;
    }
}
