import { customElement } from "lit/decorators.js";
import { HxMenuGroupElement } from "../../hx-menu-group-element.js";

/**
 * @element hx-dropdown-menu-group
 * @slot - The grouped `hx-dropdown-menu-item` elements. Radio items are exclusive within their group.
 * @csspart label - The group heading, rendered when `label` is set.
 */
@customElement("hx-dropdown-menu-group")
export class HxDropdownMenuGroup extends HxMenuGroupElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-dropdown-menu-group": HxDropdownMenuGroup;
    }
}
