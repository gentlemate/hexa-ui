import { customElement } from "lit/decorators.js";
import { HxPanelFooterElement } from "../../hx-panel-footer-element.js";

/**
 * @element hx-modal-footer
 * @slot - The modal footer (actions…). Elements with `data-close` close the modal on click.
 */
@customElement("hx-modal-footer")
export class HxModalFooter extends HxPanelFooterElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal-footer": HxModalFooter;
    }
}
