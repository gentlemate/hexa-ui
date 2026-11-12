import { customElement } from "lit/decorators.js";
import { OuiPanelFooterElement } from "../../oui-panel-footer-element.js";

/**
 * @element oui-modal-footer
 * @slot - The modal footer (actions…). Elements with `data-close` close the modal on click.
 */
@customElement("oui-modal-footer")
export class OuiModalFooter extends OuiPanelFooterElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-modal-footer": OuiModalFooter;
    }
}
