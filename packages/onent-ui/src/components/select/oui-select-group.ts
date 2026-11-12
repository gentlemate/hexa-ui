import { customElement } from "lit/decorators.js";
import { OuiMenuGroupElement } from "../../oui-menu-group-element.js";

/**
 * @element oui-select-group
 * @slot - The grouped `oui-select-option` elements.
 * @csspart label - The group heading, rendered when `label` is set.
 */
@customElement("oui-select-group")
export class OuiSelectGroup extends OuiMenuGroupElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-select-group": OuiSelectGroup;
    }
}
