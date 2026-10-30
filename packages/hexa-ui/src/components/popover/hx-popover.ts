import type { Placement } from "@floating-ui/dom";
import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FloatingController } from "../../controllers/floating-controller.js";
import { focusTargetOf, hasFocus } from "../../focus-target.js";
import { HxElement } from "../../hx-element.js";
import { HxOverlayElement } from "../../hx-overlay-element.js";

export type HxPopoverPlacement = Placement;
export type HxPopoverTrigger = "click" | "hover";

/**
 * @element hx-popover
 * @property placement - Position of the popover relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the popup.
 * @property trigger - Opens the popover on click or on hover.
 * @property openDelay - Delay in milliseconds before opening on hover (with `trigger="hover"`).
 * @property closeDelay - Delay in milliseconds before closing on pointer leave (with `trigger="hover"`).
 * @property withoutArrow - Hides the arrow.
 * @slot trigger - The element that opens the popover (e.g. an `hx-button`).
 * @slot - The popover content.
 * @fires hx-show - The popover is about to open. Cancelable.
 * @fires hx-after-show - The popover is open and its enter animation finished.
 * @fires hx-hide - The popover is about to close. Cancelable.
 * @fires hx-after-hide - The popover is closed and its exit animation finished.
 * @cssprop [--hx-spacing-popover=1.25rem] - Padding.
 * @cssprop [--hx-radius-popover=var(--hx-radius-popup)] - Border radius.
 * @csspart popup - The popover panel.
 * @csspart arrow - The arrow pointing to the trigger (not rendered with `without-arrow`).
 */
@customElement("hx-popover")
export class HxPopover extends HxOverlayElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: contents;
            }
        `,
    ];

    @property({ reflect: true }) placement: HxPopoverPlacement = "bottom";
    @property({ type: Number }) distance = 8;
    @property({ reflect: true }) trigger: HxPopoverTrigger = "click";
    @property({ type: Number, attribute: "open-delay" }) openDelay = 300;
    @property({ type: Number, attribute: "close-delay" }) closeDelay = 100;
    @property({ type: Boolean, reflect: true, attribute: "without-arrow" }) withoutArrow = false;

    @query("#popup") protected overlay!: HTMLElement;
    @query("#arrow") private arrow!: HTMLElement | null;

    private triggerElement?: HTMLElement;
    private triggerTarget?: HTMLElement;
    private openOnPointerDown = false;
    private openedOnHover = false;
    private timer?: ReturnType<typeof setTimeout>;

    private floating = new FloatingController(this, () =>
        this.triggerElement
            ? {
                  anchor: this.triggerElement,
                  floating: this.overlay,
                  arrow: this.arrow ?? undefined,
                  placement: this.placement,
                  distance: this.distance,
              }
            : undefined,
    );

    constructor() {
        super();
        this.addEventListener("pointerdown", (event) => {
            if (this.fromTrigger(event)) this.openOnPointerDown = this.open;
        });
        this.addEventListener("click", (event) => this.onTriggerClick(event));
        this.addEventListener("pointerenter", (event) => {
            if (this.trigger === "hover" && event.pointerType !== "touch") this.schedule(true);
        });
        this.addEventListener("pointerleave", () => {
            if (this.trigger === "hover") this.schedule(false);
        });
    }

    override connectedCallback() {
        super.connectedCallback();
        if (this.hasUpdated) this.syncTrigger();
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        clearTimeout(this.timer);
        this.triggerTarget?.removeAttribute("aria-haspopup");
        this.triggerTarget?.removeAttribute("aria-expanded");
        this.triggerTarget = undefined;
    }

    private fromTrigger(event: Event) {
        return !!this.triggerElement && event.composedPath().includes(this.triggerElement);
    }

    private onTriggerClick(event: MouseEvent) {
        if (!this.fromTrigger(event)) return;
        clearTimeout(this.timer);
        if (this.trigger === "hover") return this.show();
        const wasOpen = event.detail > 0 ? this.openOnPointerDown : this.open;
        if (wasOpen) this.hide();
        else this.show();
    }

    private schedule(open: boolean) {
        clearTimeout(this.timer);
        if (open === this.open) return;
        this.timer = setTimeout(
            () => {
                if (!open) return this.hide();
                this.openedOnHover = true;
                this.show();
            },
            open ? this.openDelay : this.closeDelay,
        );
    }

    private onPopupFocusOut(event: FocusEvent) {
        const next = event.relatedTarget as Node | null;
        if (!next || this.overlay.contains(next)) return;
        if (!this.contains(next) || this.triggerElement?.contains(next)) this.hide();
    }

    private onTriggerChange(event: Event) {
        this.triggerElement = (event.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
        this.syncTrigger();
    }

    private async syncTrigger() {
        const trigger = this.triggerElement;
        const target = trigger && (await focusTargetOf(trigger));
        if (trigger !== this.triggerElement) return;
        if (target !== this.triggerTarget) {
            this.triggerTarget?.removeAttribute("aria-haspopup");
            this.triggerTarget?.removeAttribute("aria-expanded");
        }
        this.triggerTarget = target;
        target?.setAttribute("aria-haspopup", "dialog");
        target?.setAttribute("aria-expanded", String(this.open));
    }

    protected override present() {
        if (!this.overlay.matches(":popover-open")) this.overlay.showPopover({ source: this.triggerElement });
        this.overlay.ariaLabelledByElements = this.triggerTarget ? [this.triggerTarget] : null;
        this.floating.start();
        if (!this.openedOnHover) this.overlay.focus();
        this.openedOnHover = false;
    }

    protected override dismiss() {
        super.dismiss();
        this.floating.stop();
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("withoutArrow") && changed.get("withoutArrow") !== undefined && this.open)
            this.floating.start();
        if (!changed.has("open")) return;
        this.syncTrigger();
        if (!this.open && changed.get("open") !== undefined && hasFocus(this)) this.triggerElement?.focus();
    }

    override render() {
        return html`<slot name="trigger" @slotchange=${this.onTriggerChange}></slot>
            <div
                part="popup"
                id="popup"
                popover="auto"
                role="dialog"
                tabindex="-1"
                data-state=${this.open ? "open" : "closed"}
                class="group bg-surface text-surface-foreground border-border animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-popover p-popover inset-auto m-0 overflow-visible border shadow-md outline-none"
                @focusout=${this.onPopupFocusOut}
            >
                <slot></slot>
                ${
                    this.withoutArrow
                        ? nothing
                        : html`<div
                              part="arrow"
                              id="arrow"
                              class="bg-surface border-border absolute size-2.5 rotate-45 rounded-[2px] group-data-[side=bottom]:border-t group-data-[side=bottom]:border-l group-data-[side=left]:border-t group-data-[side=left]:border-r group-data-[side=right]:border-b group-data-[side=right]:border-l group-data-[side=top]:border-r group-data-[side=top]:border-b"
                          ></div>`
                }
            </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-popover": HxPopover;
    }
}
