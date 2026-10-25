import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { focusTargetOf, hasFocus } from "../../focus-target.js";
import { HxDropdownMenuSubmenu, type HxDropdownMenuSubmenuPlacement } from "./hx-dropdown-menu-submenu.js";
import type { HxDropdownMenuItem } from "./hx-dropdown-menu-item.js";

export type HxDropdownMenuPlacement = HxDropdownMenuSubmenuPlacement;

/**
 * @element hx-dropdown-menu
 * @property placement - Position of the menu relative to the trigger.
 * @property disabled - Prevents the trigger from opening the menu.
 * @property distance - Gap in pixels between the trigger and the popup.
 * @slot trigger - The element that opens the menu (e.g. an `hx-button`).
 * @slot - The `hx-dropdown-menu-item`, `hx-dropdown-menu-group` and `hx-dropdown-menu-separator` elements.
 * @fires hx-show - The menu is about to open. Cancelable.
 * @fires hx-after-show - The menu is open and its enter animation finished.
 * @fires hx-hide - The menu is about to close. Cancelable.
 * @fires hx-after-hide - The menu is closed and its exit animation finished.
 * @fires hx-select - An item was activated (fired by the `hx-dropdown-menu-item`). Normal items close the menu,
 * checkbox and radio items keep it open. Cancelable: `preventDefault()` keeps the menu open.
 * @csspart popup - The menu panel.
 */
@customElement("hx-dropdown-menu")
export class HxDropdownMenu extends HxDropdownMenuSubmenu {
    @property({ reflect: true }) override placement: HxDropdownMenuPlacement = "bottom-start";
    @property({ type: Boolean, reflect: true }) disabled = false;

    protected override alignOffset = 0;

    private trigger?: HTMLElement;
    private triggerTarget?: HTMLElement;
    private openOnPointerDown = false;

    constructor() {
        super();
        this.addEventListener("pointerdown", (event) => {
            if (this.fromTrigger(event)) this.openOnPointerDown = this.open;
        });
        this.addEventListener("click", (event) => this.onTriggerClick(event));
        this.addEventListener("keydown", (event) => this.onTriggerKeyDown(event));
        this.addEventListener("hx-select", (event) =>
            queueMicrotask(() => {
                const { item } = (event as CustomEvent<{ item: HxDropdownMenuItem }>).detail;
                if (!event.defaultPrevented && item.type === "normal") this.hide();
            }),
        );
    }

    protected override get anchor() {
        return this.trigger ?? null;
    }

    override connectedCallback() {
        super.connectedCallback();
        if (this.hasUpdated) this.syncTrigger();
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        this.triggerTarget?.removeAttribute("aria-haspopup");
        this.triggerTarget?.removeAttribute("aria-expanded");
        this.triggerTarget = undefined;
    }

    protected override close() {
        this.hide();
    }

    private fromTrigger(event: Event) {
        return !!this.trigger && event.composedPath().includes(this.trigger);
    }

    private onTriggerClick(event: MouseEvent) {
        if (!this.fromTrigger(event) || this.disabled) return;
        const wasOpen = event.detail > 0 ? this.openOnPointerDown : this.open;
        if (wasOpen) return this.hide();
        this.initialFocus = event.detail === 0 ? "first" : "menu";
        this.show();
    }

    private onTriggerKeyDown(event: KeyboardEvent) {
        if (event.key === "Tab" && this.open && !this.fromTrigger(event)) return this.hide();
        if (!this.fromTrigger(event) || this.disabled) return;
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        const focus = event.key === "ArrowDown" ? "first" : "last";
        if (this.open) return this.focusInitial(focus);
        this.initialFocus = focus;
        this.show();
    }

    private onTriggerChange(event: Event) {
        this.trigger = (event.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
        this.syncTrigger();
    }

    private async syncTrigger() {
        const trigger = this.trigger;
        const target = trigger && (await focusTargetOf(trigger));
        if (trigger !== this.trigger) return;
        if (target !== this.triggerTarget) {
            this.triggerTarget?.removeAttribute("aria-haspopup");
            this.triggerTarget?.removeAttribute("aria-expanded");
        }
        this.triggerTarget = target;
        target?.setAttribute("aria-haspopup", "menu");
        target?.setAttribute("aria-expanded", String(this.open));
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (!changed.has("open")) return;
        this.syncTrigger();
        if (!this.open && changed.get("open") !== undefined && hasFocus(this)) this.trigger?.focus();
    }

    override render() {
        return html`<slot name="trigger" @slotchange=${this.onTriggerChange}></slot>${this.renderPopup()}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-dropdown-menu": HxDropdownMenu;
    }
}
