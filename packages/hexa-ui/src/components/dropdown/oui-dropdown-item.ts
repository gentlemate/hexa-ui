import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Check, ChevronRight, CircleDot, type IconNode } from "lucide";
import { OuiMenuItemElement } from "../../oui-menu-item-element.js";
import "../icon/oui-icon.js";
import type { OuiDropdownSubmenu } from "./oui-dropdown-submenu.js";

export type OuiDropdownItemType = "normal" | "checkbox" | "radio";
export type OuiDropdownItemVariant = "default" | "destructive";

const roles: Record<OuiDropdownItemType, string> = {
    normal: "menuitem",
    checkbox: "menuitemcheckbox",
    radio: "menuitemradio",
};

/**
 * @element oui-dropdown-item
 * @property value - Sent as `event.detail.value` in `oui-select`.
 * @property disabled - Prevents activating the item.
 * @property type - `checkbox` and `radio` items toggle `checked` and keep the menu open.
 * @property checked - Whether a checkbox or radio item is checked.
 * @property variant - `destructive` shows the item in the destructive color.
 * @property icon - Lucide icon, set as a JS property.
 * @slot - The item label, and an optional `oui-dropdown-submenu` opened from this item.
 * @fires oui-select - The item was activated; `event.detail` is `{ item, value }`. Cancelable:
 * `preventDefault()` keeps the menu open (checkbox and radio items keep it open anyway). Checkbox and
 * radio items update `checked` before it fires.
 * @csspart base - The item wrapper.
 * @csspart indicator - The check mark or dot of checkbox and radio items.
 * @csspart icon - The `oui-icon` rendered from the `icon` property.
 * @csspart chevron - The chevron of an item with a submenu.
 * @cssstate expanded - The submenu of the item is open.
 */
@customElement("oui-dropdown-item")
export class OuiDropdownItem extends OuiMenuItemElement {
    static override styles = [
        OuiMenuItemElement.styles,
        css`
            :host(:state(expanded)) [part="base"] {
                background: var(--oui-accent);
                color: var(--oui-accent-foreground);
            }
            :host(:focus) [part="icon"],
            :host(:state(expanded)) [part="icon"] {
                color: inherit;
            }
            :host([variant="destructive"]) [part="base"],
            :host([variant="destructive"]) [part="icon"] {
                color: var(--oui-destructive);
            }
            :host([variant="destructive"]:focus) [part="base"] {
                background: color-mix(in oklab, var(--oui-destructive) 10%, transparent);
            }
        `,
    ];

    @property({ reflect: true }) type: OuiDropdownItemType = "normal";
    @property({ type: Boolean, reflect: true }) checked = false;
    @property({ reflect: true }) variant: OuiDropdownItemVariant = "default";
    @property({ attribute: false }) icon?: IconNode;

    @state() private hasSubmenu = false;

    constructor() {
        super();
        this.addEventListener("click", (event) => this.onClick(event));
    }

    get submenu() {
        return this.querySelector<OuiDropdownSubmenu>(":scope > oui-dropdown-submenu");
    }

    get expanded() {
        return this.internals.states.has("expanded");
    }

    set expanded(expanded: boolean) {
        if (expanded) this.internals.states.add("expanded");
        else this.internals.states.delete("expanded");
        this.internals.ariaExpanded = this.hasSubmenu ? String(expanded) : null;
    }

    private onClick(event: MouseEvent) {
        if ((event.target as Element).closest("oui-dropdown-item") !== this) return;
        if (this.submenu) return;
        if (this.type === "checkbox") this.checked = !this.checked;
        if (this.type === "radio") {
            for (const sibling of this.parentElement?.children ?? [])
                if (sibling instanceof OuiDropdownItem && sibling.type === "radio") sibling.checked = sibling === this;
        }
        this.dispatchEvent(
            new CustomEvent("oui-select", {
                detail: { item: this, value: this.value },
                bubbles: true,
                composed: true,
                cancelable: true,
            }),
        );
    }

    private onSlotChange() {
        this.hasSubmenu = !!this.submenu;
    }

    protected override excludedFromLabel(node: Node) {
        return super.excludedFromLabel(node) || (node instanceof Element && node.localName === "oui-dropdown-submenu");
    }

    protected override updated() {
        super.updated();
        this.internals.role = roles[this.type];
        this.internals.ariaChecked = this.type === "normal" ? null : String(this.checked);
        this.internals.ariaHasPopup = this.hasSubmenu ? "menu" : null;
        this.internals.ariaExpanded = this.hasSubmenu ? String(this.expanded) : null;
    }

    override render() {
        const checkable = this.type !== "normal";
        return this.renderBase(
            html`${
                    checkable
                        ? this.renderIndicator(
                              this.checked ? (this.type === "checkbox" ? Check : CircleDot) : undefined,
                              "left",
                          )
                        : nothing
                }
                ${
                    this.icon
                        ? html`<oui-icon part="icon" .icon=${this.icon} class="text-muted-foreground"></oui-icon>`
                        : nothing
                }
                <slot @slotchange=${this.onSlotChange}></slot>
                ${this.hasSubmenu ? html`<oui-icon part="chevron" .icon=${ChevronRight} class="ml-auto"></oui-icon>` : nothing}`,
            checkable ? "px-option pl-8" : "px-option",
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-dropdown-item": OuiDropdownItem;
    }
}
