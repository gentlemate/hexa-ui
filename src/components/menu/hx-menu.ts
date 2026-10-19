import type { Placement } from "@floating-ui/dom";
import { css, html, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FloatingController } from "../../controllers/floating-controller.js";
import { ListNavigation } from "../../controllers/list-navigation.js";
import { HxElement } from "../../hx-element.js";
import { HxOverlayElement } from "../../hx-overlay-element.js";
import "./hx-menu-group.js";
import { HxMenuItem } from "./hx-menu-item.js";

export type HxMenuPlacement = Placement;

export type HxMenuFocus = "first" | "last" | "menu" | "none";

const submenuDelay = 100;

/**
 * @element hx-menu
 * @slot - The `hx-menu-item`, `hx-menu-group` and `hx-separator` elements.
 * @fires hx-after-show - The menu is open and its enter animation finished.
 * @fires hx-after-hide - The menu is closed and its exit animation finished.
 * @csspart popup - The menu panel.
 *
 * A submenu, placed in the `submenu` slot of an `hx-menu-item`. Also the base class of
 * `hx-dropdown-menu`, which adds the trigger.
 */
@customElement("hx-menu")
export class HxMenu extends HxOverlayElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: contents;
            }
        `,
    ];

    @property({ reflect: true }) placement: HxMenuPlacement = "right-start";
    @property({ type: Number }) distance = 4;

    @query("#popup") protected overlay!: HTMLElement;

    protected alignOffset = -5;
    protected initialFocus: HxMenuFocus = "menu";

    private navigation = new ListNavigation(
        () => this.items,
        (item) => item.label,
    );
    private hovered?: HxMenuItem;
    private submenuTimer?: ReturnType<typeof setTimeout>;

    private floating = new FloatingController(this, () => {
        const anchor = this.anchor;
        if (!anchor) return;
        return {
            anchor,
            floating: this.overlay,
            placement: this.placement,
            distance: this.distance,
            alignOffset: this.alignOffset,
            fit: true,
        };
    });

    constructor() {
        super();
        this.addEventListener("keydown", () => (this.hovered = undefined), { capture: true });
        this.addEventListener("keydown", (event) => this.onKeyDown(event));
        this.addEventListener("pointermove", (event) => this.onPointerMove(event));
        this.addEventListener("click", (event) => this.onClick(event));
    }

    protected get anchor(): HTMLElement | null {
        return this.parentElement;
    }

    private get items() {
        return [...this.querySelectorAll("hx-menu-item")].filter((item) => this.owns(item));
    }

    private owns(item: HxMenuItem) {
        return item.closest("hx-menu, hx-dropdown-menu") === this;
    }

    private itemFrom(target: EventTarget | null) {
        const element = target instanceof Element ? target.closest("hx-menu-item, hx-menu") : null;
        return element instanceof HxMenuItem && this.owns(element) ? element : undefined;
    }

    protected focusInitial(focus: HxMenuFocus) {
        const items = this.items.filter((item) => !item.disabled);
        if (focus === "first") items[0]?.focus();
        else if (focus === "last") items.at(-1)?.focus();
        else if (focus === "menu") this.overlay.focus();
    }

    protected close() {
        this.open = false;
        if (this.parentElement instanceof HxMenuItem) this.parentElement.focus();
    }

    private openSubmenu(item: HxMenuItem, focus: HxMenuFocus) {
        clearTimeout(this.submenuTimer);
        this.closeSubmenus(item);
        const submenu = item.submenu;
        if (!submenu || item.disabled) return;
        if (submenu.open) return submenu.focusInitial(focus);
        submenu.initialFocus = focus;
        submenu.open = true;
    }

    private closeSubmenus(except?: HxMenuItem) {
        for (const item of this.items) if (item !== except && item.submenu) item.submenu.open = false;
    }

    private onKeyDown(event: KeyboardEvent) {
        const item = this.itemFrom(event.target);
        if (!item && event.target !== this) return;
        if (!this.handleKey(event, item)) return;
        event.preventDefault();
        event.stopPropagation();
    }

    private handleKey(event: KeyboardEvent, item?: HxMenuItem) {
        switch (event.key) {
            case "Enter":
            case " ":
                if (item?.submenu) this.openSubmenu(item, "first");
                else item?.click();
                return true;
            case "ArrowRight":
                if (item?.submenu) this.openSubmenu(item, "first");
                return true;
            case "ArrowLeft":
                if (!(this.parentElement instanceof HxMenuItem)) return false;
                this.close();
                return true;
            case "Escape":
                this.close();
                return true;
        }
        const next = this.navigation.target(event, item);
        if (!next) return false;
        this.closeSubmenus();
        next.focus();
        return true;
    }

    private onPointerMove(event: PointerEvent) {
        const item = this.itemFrom(event.target);
        if (!item) {
            if (this.items.some((own) => own.submenu?.open && own.submenu.contains(event.target as Node)))
                clearTimeout(this.submenuTimer);
            return;
        }
        if (item === this.hovered || item.disabled) return;
        this.hovered = item;
        item.focus({ preventScroll: true });

        clearTimeout(this.submenuTimer);
        if (item.submenu?.open) return;
        this.submenuTimer = setTimeout(
            () => (item.submenu ? this.openSubmenu(item, "none") : this.closeSubmenus()),
            submenuDelay,
        );
    }

    private onPointerLeave() {
        const hovered = this.hovered;
        this.hovered = undefined;
        if (!hovered || this.items.some((item) => item.submenu?.open)) return;
        clearTimeout(this.submenuTimer);
        if (hovered.matches(":focus")) this.overlay.focus();
    }

    private onClick(event: MouseEvent) {
        const item = this.itemFrom(event.target);
        if (item?.submenu && !item.disabled) this.openSubmenu(item, event.detail === 0 ? "first" : "none");
    }

    protected override present() {
        const anchor = this.anchor;
        if (!this.overlay.matches(":popover-open")) this.overlay.showPopover({ source: anchor ?? undefined });
        this.overlay.ariaLabelledByElements = anchor ? [anchor] : null;
        this.floating.start();
        this.focusInitial(this.initialFocus);
        this.initialFocus = "menu";
    }

    protected override dismiss() {
        super.dismiss();
        this.floating.stop();
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (!changed.has("open")) return;
        if (this.parentElement instanceof HxMenuItem) this.parentElement.expanded = this.open;
        if (!this.open) {
            clearTimeout(this.submenuTimer);
            this.hovered = undefined;
            this.closeSubmenus();
        }
    }

    protected renderPopup() {
        return html`<div
            part="popup"
            id="popup"
            popover="auto"
            role="menu"
            tabindex="-1"
            data-state=${this.open ? "open" : "closed"}
            class="bg-popover text-popover-foreground border-border animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-popover p-popover inset-auto m-0 min-w-32 overflow-x-hidden overflow-y-auto border shadow-md outline-none"
            @pointerleave=${this.onPointerLeave}
        >
            <slot></slot>
        </div>`;
    }

    override render() {
        return this.renderPopup();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-menu": HxMenu;
    }
}
