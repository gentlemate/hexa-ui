import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Check, ChevronRight, CircleDot, type IconNode } from "lucide";
import { HxElement } from "../../hx-element.js";
import "../icon/hx-icon.js";
import type { HxMenu } from "./hx-menu.js";

export type HxMenuItemType = "normal" | "checkbox" | "radio";
export type HxMenuItemVariant = "default" | "destructive";

const roles: Record<HxMenuItemType, string> = {
    normal: "menuitem",
    checkbox: "menuitemcheckbox",
    radio: "menuitemradio",
};

/**
 * @element hx-menu-item
 * @slot - The item label.
 * @slot submenu - An `hx-menu` opened from this item.
 * @fires hx-select - The item was activated; `event.detail` is `{ item, value }`. Cancelable:
 * `preventDefault()` keeps the menu open (checkbox and radio items keep it open anyway). Checkbox and
 * radio items update `checked` before it fires.
 * @csspart base - The item wrapper.
 * @csspart indicator - The check mark or dot of checkbox and radio items.
 * @csspart icon - The `hx-icon` rendered from the `icon` property.
 * @csspart chevron - The chevron of an item with a submenu.
 */
@customElement("hx-menu-item")
export class HxMenuItem extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                outline: none;
            }
            :host(:focus) [part="base"],
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
            :host([disabled]) [part="base"] {
                opacity: 0.5;
                pointer-events: none;
            }
        `,
    ];

    @property({ reflect: true }) value = "";
    @property({ reflect: true }) type: HxMenuItemType = "normal";
    @property({ type: Boolean, reflect: true }) checked = false;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ reflect: true }) variant: HxMenuItemVariant = "default";
    @property({ attribute: false }) icon?: IconNode;

    @state() private hasSubmenu = false;

    private internals = this.attachInternals();

    constructor() {
        super();
        this.addEventListener("click", (event) => this.onClick(event));
    }

    override connectedCallback() {
        super.connectedCallback();
        this.tabIndex = -1;
    }

    get submenu() {
        return this.querySelector<HxMenu>(':scope > hx-menu[slot="submenu"]');
    }

    get label() {
        return [...this.childNodes]
            .filter((node) => !(node instanceof Element && node.slot))
            .map((node) => node.textContent)
            .join("")
            .trim();
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
        if ((event.target as Element).closest("hx-menu-item") !== this) return;
        if (this.disabled) return event.stopImmediatePropagation();
        if (this.submenu) return;
        if (this.type === "checkbox") this.checked = !this.checked;
        if (this.type === "radio") {
            for (const sibling of this.parentElement?.children ?? [])
                if (sibling instanceof HxMenuItem && sibling.type === "radio") sibling.checked = sibling === this;
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

    private onSubmenuChange(event: Event) {
        this.hasSubmenu = (event.target as HTMLSlotElement).assignedElements().length > 0;
    }

    protected override updated() {
        this.internals.role = roles[this.type];
        this.internals.ariaChecked = this.type === "normal" ? null : String(this.checked);
        this.internals.ariaDisabled = String(this.disabled);
        this.internals.ariaHasPopup = this.hasSubmenu ? "menu" : null;
        this.internals.ariaExpanded = this.hasSubmenu ? String(this.expanded) : null;
    }

    private renderIndicator() {
        if (this.type === "normal") return nothing;
        return html`<span
            part="indicator"
            class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"
            >${this.checked ? html`<hx-icon .icon=${this.type === "checkbox" ? Check : CircleDot}></hx-icon>` : nothing}</span
        >`;
    }

    override render() {
        return html`<div
            part="base"
            class="${
                this.type === "normal" ? "" : "pl-8"
            } rounded-popover-sm min-h-menu-item px-menu-item relative flex cursor-default items-center gap-2 select-none"
        >
            ${this.renderIndicator()}
            ${
                this.icon
                    ? html`<hx-icon part="icon" .icon=${this.icon} class="text-muted-foreground"></hx-icon>`
                    : nothing
            }
            <slot></slot>
            ${this.hasSubmenu ? html`<hx-icon part="chevron" .icon=${ChevronRight} class="ml-auto"></hx-icon>` : nothing}
            <slot name="submenu" @slotchange=${this.onSubmenuChange}></slot>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-menu-item": HxMenuItem;
    }
}
