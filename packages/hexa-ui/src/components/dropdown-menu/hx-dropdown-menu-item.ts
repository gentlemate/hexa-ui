import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Check, ChevronRight, CircleDot, type IconNode } from "lucide";
import { HxMenuItemElement } from "../../hx-menu-item-element.js";
import "../icon/hx-icon.js";
import type { HxDropdownMenuSubmenu } from "./hx-dropdown-menu-submenu.js";

export type HxDropdownMenuItemType = "normal" | "checkbox" | "radio";
export type HxDropdownMenuItemVariant = "default" | "destructive";

const roles: Record<HxDropdownMenuItemType, string> = {
    normal: "menuitem",
    checkbox: "menuitemcheckbox",
    radio: "menuitemradio",
};

/**
 * @element hx-dropdown-menu-item
 * @slot - The item label, and an optional `hx-dropdown-menu-submenu` opened from this item.
 * @fires hx-select - The item was activated; `event.detail` is `{ item, value }`. Cancelable:
 * `preventDefault()` keeps the menu open (checkbox and radio items keep it open anyway). Checkbox and
 * radio items update `checked` before it fires.
 * @csspart base - The item wrapper.
 * @csspart indicator - The check mark or dot of checkbox and radio items.
 * @csspart icon - The `hx-icon` rendered from the `icon` property.
 * @csspart chevron - The chevron of an item with a submenu.
 */
@customElement("hx-dropdown-menu-item")
export class HxDropdownMenuItem extends HxMenuItemElement {
    static override styles = [
        HxMenuItemElement.styles,
        css`
            :host(:state(expanded)) [part="base"] {
                background: var(--hx-accent);
                color: var(--hx-accent-foreground);
            }
            :host(:focus) [part="icon"],
            :host(:state(expanded)) [part="icon"] {
                color: inherit;
            }
            :host([variant="destructive"]) [part="base"],
            :host([variant="destructive"]) [part="icon"] {
                color: var(--hx-destructive);
            }
            :host([variant="destructive"]:focus) [part="base"] {
                background: color-mix(in oklab, var(--hx-destructive) 10%, transparent);
            }
        `,
    ];

    @property({ reflect: true }) type: HxDropdownMenuItemType = "normal";
    @property({ type: Boolean, reflect: true }) checked = false;
    @property({ reflect: true }) variant: HxDropdownMenuItemVariant = "default";
    @property({ attribute: false }) icon?: IconNode;

    @state() private hasSubmenu = false;

    constructor() {
        super();
        this.addEventListener("click", (event) => this.onClick(event));
    }

    get submenu() {
        return this.querySelector<HxDropdownMenuSubmenu>(":scope > hx-dropdown-menu-submenu");
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
        if ((event.target as Element).closest("hx-dropdown-menu-item") !== this) return;
        if (this.submenu) return;
        if (this.type === "checkbox") this.checked = !this.checked;
        if (this.type === "radio") {
            for (const sibling of this.parentElement?.children ?? [])
                if (sibling instanceof HxDropdownMenuItem && sibling.type === "radio")
                    sibling.checked = sibling === this;
        }
        this.dispatchEvent(
            new CustomEvent("hx-select", {
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
        return (
            super.excludedFromLabel(node) || (node instanceof Element && node.localName === "hx-dropdown-menu-submenu")
        );
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
                        ? html`<hx-icon part="icon" .icon=${this.icon} class="text-muted-foreground"></hx-icon>`
                        : nothing
                }
                <slot @slotchange=${this.onSlotChange}></slot>
                ${this.hasSubmenu ? html`<hx-icon part="chevron" .icon=${ChevronRight} class="ml-auto"></hx-icon>` : nothing}`,
            checkable ? "px-menu-item pl-8" : "px-menu-item",
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-dropdown-menu-item": HxDropdownMenuItem;
    }
}
