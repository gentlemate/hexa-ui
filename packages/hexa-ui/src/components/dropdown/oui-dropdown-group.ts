import { customElement } from "lit/decorators.js";
import { OuiMenuGroupElement } from "../../oui-menu-group-element.js";

/**
 * @element oui-dropdown-group
 * @slot - The grouped `oui-dropdown-item` elements. Radio items are exclusive within their group.
 * @csspart label - The group heading, rendered when `label` is set.
 */
@customElement("oui-dropdown-group")
export class OuiDropdownGroup extends OuiMenuGroupElement {}

declare global {
    interface HTMLElementTagNameMap {
        "oui-dropdown-group": OuiDropdownGroup;
    }
}
