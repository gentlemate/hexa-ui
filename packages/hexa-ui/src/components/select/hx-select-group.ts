import { customElement } from "lit/decorators.js";
import { HxMenuGroupElement } from "../../hx-menu-group-element.js";

/**
 * @element hx-select-group
 * @slot - The grouped `hx-select-option` elements.
 * @csspart label - The group heading, rendered when `label` is set.
 */
@customElement("hx-select-group")
export class HxSelectGroup extends HxMenuGroupElement {}

declare global {
    interface HTMLElementTagNameMap {
        "hx-select-group": HxSelectGroup;
    }
}
