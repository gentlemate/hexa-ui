import { customElement } from "lit/decorators.js";
import { HxPanelTitleElement } from "../../hx-panel-title-element.js";

/**
 * @element hx-drawer-title
 * @slot - The drawer title. It labels the dialog.
 */
@customElement("hx-drawer-title")
export class HxDrawerTitle extends HxPanelTitleElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-drawer-title": HxDrawerTitle;
    }
}
