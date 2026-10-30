import { customElement } from "lit/decorators.js";
import { HxMenuGroupElement } from "../../hx-menu-group-element.js";

/**
 * @element hx-dropdown-group
 * @slot - The grouped `hx-dropdown-item` elements. Radio items are exclusive within their group.
 * @csspart label - The group heading, rendered when `label` is set.
 */
@customElement("hx-dropdown-group")
export class HxDropdownGroup extends HxMenuGroupElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-dropdown-group": HxDropdownGroup;
    }
}
