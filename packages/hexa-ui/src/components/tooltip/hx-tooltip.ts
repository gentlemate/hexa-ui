import type { Placement } from "@floating-ui/dom";
import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FloatingController } from "../../controllers/floating-controller.js";
import { focusTargetOf } from "../../focus-target.js";
import { HxElement } from "../../hx-element.js";
import { HxOverlayElement } from "../../hx-overlay-element.js";

export type HxTooltipPlacement = Placement;

const skipDelay = 300;
let lastClosed = 0;

/**
 * @element hx-tooltip
 * @property content - Tooltip text; use the `content` slot for rich content.
 * @property placement - Position of the tooltip relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the popup.
 * @property openDelay - Delay in milliseconds before opening on hover.
 * @property closeDelay - Delay in milliseconds before closing on pointer leave.
 * @property disabled - Prevents the tooltip from opening.
 * @property withoutArrow - Hides the arrow.
 * @slot - The trigger (the first element is the anchor).
 * @slot content - Rich tooltip content, instead of the `content` property.
 * @fires hx-show - The tooltip is about to open. Cancelable.
 * @fires hx-after-show - The tooltip is open and its enter animation finished.
 * @fires hx-hide - The tooltip is about to close. Cancelable.
 * @fires hx-after-hide - The tooltip is closed and its exit animation finished.
 * @cssprop [--hx-spacing-tooltip=0.75rem] - Horizontal padding. The vertical padding is half of it.
 * @cssprop [--hx-radius-tooltip=var(--hx-radius-popup)] - Border radius.
 * @csspart popup - The tooltip bubble.
 * @csspart arrow - The arrow pointing to the trigger (not rendered with `without-arrow`).
 */
@customElement("hx-tooltip")
export class HxTooltip extends HxOverlayElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: contents;
            }
        `,
    ];

    @property() content = "";
    @property({ reflect: true }) placement: HxTooltipPlacement = "top";
    @property({ type: Number }) distance = 8;
    @property({ type: Number, attribute: "open-delay" }) openDelay = 300;
    @property({ type: Number, attribute: "close-delay" }) closeDelay = 100;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true, attribute: "without-arrow" }) withoutArrow = false;

    @query("#popup") protected overlay!: HTMLElement;
    @query("#arrow") private arrow!: HTMLElement | null;
    @query('slot[name="content"]') private contentSlot!: HTMLSlotElement;

    private trigger?: HTMLElement;
    private described?: HTMLElement;
    private timer?: ReturnType<typeof setTimeout>;

    private floating = new FloatingController(this, () =>
        this.trigger
            ? {
                  anchor: this.trigger,
                  floating: this.overlay,
                  arrow: this.arrow ?? undefined,
                  placement: this.placement,
                  distance: this.distance,
              }
            : undefined,
    );

    constructor() {
        super();
        this.addEventListener("pointerenter", (event) => {
            if (event.pointerType !== "touch") this.schedule(true);
        });
        this.addEventListener("pointerleave", () => this.schedule(false));
        this.addEventListener("pointerdown", () => this.schedule(false, 0));
        this.addEventListener("focusin", (event) => {
            if ((event.composedPath()[0] as Element).matches(":focus-visible")) this.schedule(true, 0);
        });
        this.addEventListener("focusout", () => this.schedule(false, 0));
    }

    override connectedCallback() {
        super.connectedCallback();
        if (this.hasUpdated) this.describe();
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        clearTimeout(this.timer);
        document.removeEventListener("keydown", this.onKeyDown);
        this.described?.removeAttribute("aria-description");
        this.described = undefined;
    }

    private schedule(open: boolean, delay = open ? this.openDelay : this.closeDelay) {
        clearTimeout(this.timer);
        if (open === this.open || (open && this.disabled)) return;
        if (open && Date.now() - lastClosed < skipDelay) delay = 0;
        this.timer = setTimeout(() => (open ? this.show() : this.hide()), delay);
    }

    private onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") this.hide();
    };

    protected override present() {
        super.present();
        this.floating.start();
        document.addEventListener("keydown", this.onKeyDown);
    }

    protected override dismiss() {
        super.dismiss();
        this.floating.stop();
        document.removeEventListener("keydown", this.onKeyDown);
        lastClosed = Date.now();
    }

    private onTriggerChange(event: Event) {
        this.trigger = (event.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
        this.describe();
    }

    private async describe() {
        const trigger = this.trigger;
        const target = trigger && (await focusTargetOf(trigger));
        if (trigger !== this.trigger) return;
        if (target !== this.described) this.described?.removeAttribute("aria-description");
        this.described = target;

        const text = this.contentSlot
            .assignedNodes({ flatten: true })
            .map((node) => node.textContent)
            .join("")
            .trim();
        if (text && !this.disabled) target?.setAttribute("aria-description", text);
        else target?.removeAttribute("aria-description");
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("disabled") && this.disabled) this.hide();
        if (changed.has("content") || changed.has("disabled")) this.describe();
        if (changed.has("withoutArrow") && changed.get("withoutArrow") !== undefined && this.open)
            this.floating.start();
    }

    override render() {
        return html`<slot @slotchange=${this.onTriggerChange}></slot>
            <div
                part="popup"
                id="popup"
                popover="manual"
                role="tooltip"
                data-state=${this.open ? "open" : "closed"}
                class="bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-tooltip px-tooltip inset-auto m-0 w-fit max-w-xs overflow-visible border-0 py-[calc(var(--hx-spacing-tooltip)/2)] text-sm font-medium text-balance"
            >
                <slot name="content" @slotchange=${this.describe}>${this.content}</slot>
                ${
                    this.withoutArrow
                        ? nothing
                        : html`<div
                              part="arrow"
                              id="arrow"
                              class="bg-foreground absolute size-2.5 rotate-45 rounded-[2px]"
                          ></div>`
                }
            </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-tooltip": HxTooltip;
    }
}
