import { css, html, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { X } from "lucide";
import { focusTargetOf } from "./focus-target.js";
import { HxElement } from "./hx-element.js";
import { HxOverlayElement } from "./hx-overlay-element.js";
import "./components/icon/hx-icon.js";

export type HxResizeAxis = "width" | "height";

export interface HxResizeHandle {
    class: string;
    growth: Partial<Record<HxResizeAxis, number>>;
    keyboard?: boolean;
}

const resizeStep = 16;

const resizeKeys: Record<HxResizeAxis, [string, string]> = {
    width: ["ArrowLeft", "ArrowRight"],
    height: ["ArrowUp", "ArrowDown"],
};

const resizeBars: Record<HxResizeAxis, string> = {
    width: "h-10 w-1.5",
    height: "h-1.5 w-10",
};

function axesOf(handle: HxResizeHandle) {
    return Object.keys(handle.growth) as HxResizeAxis[];
}

let scrollLocks = 0;
let restoreScroll = { overflow: "", paddingRight: "" };

function acquireScrollLock() {
    if (scrollLocks++) return;
    const root = document.documentElement;
    const body = document.body;
    const scrollbar = innerWidth - root.clientWidth;
    restoreScroll = { overflow: root.style.overflow, paddingRight: body.style.paddingRight };
    if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    root.style.overflow = "hidden";
}

function releaseScrollLock() {
    if (--scrollLocks) return;
    document.documentElement.style.overflow = restoreScroll.overflow;
    document.body.style.paddingRight = restoreScroll.paddingRight;
}

/**
 * @property label - Accessible name of the dialog when there is no title.
 * @property persistent - Ignores backdrop clicks.
 * @property withoutClose - Hides the close button.
 */
export abstract class HxDialogElement extends HxOverlayElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: contents;
            }
        `,
    ];

    @property() label = "";
    @property({ type: Boolean, reflect: true }) persistent = false;
    @property({ type: Boolean, reflect: true, attribute: "without-close" }) withoutClose = false;

    @query("dialog") protected overlay!: HTMLDialogElement;

    @state() private hasHeader = false;
    @state() private hasFooter = false;
    @state() private resizeBounds: Record<HxResizeAxis, { size: number; min: number; max: number }> = {
        width: { size: 0, min: 0, max: 0 },
        height: { size: 0, min: 0, max: 0 },
    };

    protected abstract get dialogClass(): string;

    protected get resizeHandles(): HxResizeHandle[] {
        return [];
    }

    protected resizeDetail(rect: DOMRect): unknown {
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
    }

    private trigger?: HTMLElement;
    private triggerTarget?: HTMLElement;
    private pressedBackdrop = false;
    private scrollLocked = false;
    private dragStart?: { x: number; y: number; width: number; height: number };

    constructor() {
        super();
        this.addEventListener("click", (event) => {
            if (this.fromTrigger(event)) this.show();
            else if (this.fromCloser(event)) this.hide();
        });
    }

    override connectedCallback() {
        super.connectedCallback();
        if (this.hasUpdated) this.syncTrigger();
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        this.lockScroll(false);
        this.triggerTarget?.removeAttribute("aria-haspopup");
        this.triggerTarget?.removeAttribute("aria-expanded");
        this.triggerTarget = undefined;
    }

    private fromTrigger(event: Event) {
        return !!this.trigger && event.composedPath().includes(this.trigger);
    }

    private fromCloser(event: Event) {
        const closer = (event.target as Element).closest?.("[data-close]");
        let owner = closer?.parentElement;
        while (owner && !(owner instanceof HxDialogElement)) owner = owner.parentElement;
        return !!closer && owner === this;
    }

    private onBackdrop(event: MouseEvent) {
        if (event.target !== this.overlay) return false;
        const rect = this.overlay.getBoundingClientRect();
        return (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
        );
    }

    private onPointerDown(event: PointerEvent) {
        this.pressedBackdrop = this.onBackdrop(event);
    }

    private onDialogClick(event: MouseEvent) {
        if (this.pressedBackdrop && this.onBackdrop(event) && !this.persistent) this.hide();
        this.pressedBackdrop = false;
    }

    private onCancel(event: Event) {
        event.preventDefault();
        this.hide();
    }

    private onTriggerChange(event: Event) {
        this.trigger = (event.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
        this.syncTrigger();
    }

    private onSlotChange(event: Event) {
        const sections = (event.target as HTMLSlotElement).assignedElements().map((element) => element.localName);
        this.hasHeader = sections.includes(`${this.localName}-header`);
        this.hasFooter = sections.includes(`${this.localName}-footer`);
    }

    private syncLabels() {
        const header = `:scope > ${this.localName}-header`;
        const title = this.querySelector(`${header} ${this.localName}-title`);
        const description = this.querySelector(`${header} ${this.localName}-description`);
        this.overlay.ariaLabelledByElements = title ? [title] : null;
        this.overlay.ariaDescribedByElements = description ? [description] : null;
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
        target?.setAttribute("aria-haspopup", "dialog");
        target?.setAttribute("aria-expanded", String(this.open));
    }

    private lockScroll(lock: boolean) {
        if (lock === this.scrollLocked) return;
        this.scrollLocked = lock;
        if (lock) acquireScrollLock();
        else releaseScrollLock();
    }

    protected resetSize() {
        this.overlay.style.width = "";
        this.overlay.style.height = "";
    }

    private measure(axis: HxResizeAxis, size: string) {
        this.overlay.style[axis] = size;
        return Math.round(this.overlay.getBoundingClientRect()[axis]);
    }

    private syncBounds(handle: HxResizeHandle) {
        const bounds = { ...this.resizeBounds };
        for (const axis of axesOf(handle)) {
            const size = this.overlay.style[axis];
            bounds[axis] = {
                min: this.measure(axis, "0px"),
                max: this.measure(axis, axis === "width" ? "100vw" : "100vh"),
                size: this.measure(axis, size),
            };
        }
        this.resizeBounds = bounds;
    }

    private resize(sizes: Partial<Record<HxResizeAxis, number>>, commit: boolean) {
        const bounds = { ...this.resizeBounds };
        let changed = false;
        for (const [axis, value] of Object.entries(sizes) as [HxResizeAxis, number][]) {
            const { size, min, max } = bounds[axis];
            const next = Math.min(Math.max(Math.round(value), min), max);
            if (next === size) continue;
            bounds[axis] = { size: next, min, max };
            this.overlay.style[axis] = `${next}px`;
            changed = true;
        }
        if (!changed) return;
        this.resizeBounds = bounds;
        if (commit) this.emitResize();
    }

    private emitResize() {
        this.dispatchEvent(
            new CustomEvent("hx-resize", {
                detail: this.resizeDetail(this.overlay.getBoundingClientRect()),
                bubbles: true,
                composed: true,
            }),
        );
    }

    private onHandlePointerDown(event: PointerEvent, handle: HxResizeHandle) {
        if (event.button !== 0) return;
        event.preventDefault();
        const target = event.currentTarget as HTMLElement;
        target.focus();
        target.setPointerCapture(event.pointerId);
        this.syncBounds(handle);
        const { width, height } = this.resizeBounds;
        this.dragStart = { x: event.clientX, y: event.clientY, width: width.size, height: height.size };
    }

    private onHandlePointerMove(event: PointerEvent, handle: HxResizeHandle) {
        const start = this.dragStart;
        if (!start) return;
        const delta = { width: event.clientX - start.x, height: event.clientY - start.y };
        const sizes: Partial<Record<HxResizeAxis, number>> = {};
        for (const axis of axesOf(handle)) sizes[axis] = start[axis] + handle.growth[axis]! * delta[axis];
        this.resize(sizes, false);
    }

    private onHandlePointerEnd() {
        const start = this.dragStart;
        this.dragStart = undefined;
        const { width, height } = this.resizeBounds;
        if (start && (start.width !== width.size || start.height !== height.size)) this.emitResize();
    }

    private onHandleKeyDown(event: KeyboardEvent, handle: HxResizeHandle) {
        const sizes: Partial<Record<HxResizeAxis, number>> = {};
        for (const axis of axesOf(handle)) {
            const { size, min, max } = this.resizeBounds[axis];
            const step = Math.sign(handle.growth[axis]!) * resizeStep;
            const [backward, forward] = resizeKeys[axis];
            if (event.key === backward) sizes[axis] = size - step;
            else if (event.key === forward) sizes[axis] = size + step;
            else if (event.key === "Home") sizes[axis] = min;
            else if (event.key === "End") sizes[axis] = max;
        }
        if (!Object.keys(sizes).length) return;
        event.preventDefault();
        this.resize(sizes, true);
    }

    protected override present() {
        this.syncLabels();
        if (!this.overlay.open) this.overlay.showModal();
        this.lockScroll(true);
    }

    protected override dismiss() {
        if (this.overlay.open) this.overlay.close();
        this.lockScroll(false);
    }

    protected override firstUpdated() {
        super.firstUpdated();
        this.overlay.addEventListener("close", () => {
            if (this.open) this.open = false;
            this.lockScroll(false);
        });
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("open")) this.syncTrigger();
        const axes = this.resizeHandles.flatMap(axesOf);
        if (!axes.includes("width")) this.overlay.style.width = "";
        if (!axes.includes("height")) this.overlay.style.height = "";
    }

    private renderResizeHandle(handle: HxResizeHandle) {
        const axes = axesOf(handle);
        const { size, min, max } = this.resizeBounds[axes[0]];
        return html`<div
            part="handle"
            role="separator"
            tabindex=${handle.keyboard ? 0 : nothing}
            aria-hidden=${handle.keyboard ? nothing : "true"}
            aria-label="Resize"
            aria-orientation=${axes[0] === "width" ? "vertical" : "horizontal"}
            aria-valuemin=${min}
            aria-valuemax=${max}
            aria-valuenow=${size}
            class="${handle.class} ${
                axes.length === 1 ? "" : "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-inset"
            } group absolute flex touch-none items-center justify-center outline-none"
            @focus=${() => this.syncBounds(handle)}
            @keydown=${(event: KeyboardEvent) => this.onHandleKeyDown(event, handle)}
            @pointerdown=${(event: PointerEvent) => this.onHandlePointerDown(event, handle)}
            @pointermove=${(event: PointerEvent) => this.onHandlePointerMove(event, handle)}
            @lostpointercapture=${this.onHandlePointerEnd}
        >
            ${
                axes.length === 1
                    ? html`<span
                          class="${
                              resizeBars[axes[0]]
                          } bg-border group-hover:bg-muted-foreground group-focus-visible:ring-ring/50 rounded-full transition-colors group-focus-visible:ring-[3px]"
                      ></span>`
                    : nothing
            }
        </div>`;
    }

    override render() {
        const top = this.hasHeader
            ? ""
            : this.withoutClose
              ? "pt-(--panel-spacing)"
              : "pt-[calc(var(--panel-spacing)*2)]";
        return html`<slot name="trigger" @slotchange=${this.onTriggerChange}></slot>
            <dialog
                part="base"
                data-state=${this.open ? "open" : "closed"}
                aria-label=${this.label || nothing}
                class="${this.dialogClass} ${top} ${this.hasFooter ? "" : "pb-(--panel-spacing)"} ${
                    this.withoutClose ? "[--panel-header-end:0px]" : "[--panel-header-end:1.75rem]"
                } bg-surface text-surface-foreground border-border animate-in data-[state=closed]:animate-out backdrop:animate-in backdrop:fade-in-0 data-[state=closed]:backdrop:animate-out data-[state=closed]:backdrop:fade-out-0 flex-col overflow-hidden p-0 shadow-lg outline-none [--panel-footer-justify:flex-end] [--panel-radius:0px] backdrop:bg-black/50 open:flex"
                @pointerdown=${this.onPointerDown}
                @click=${this.onDialogClick}
                @cancel=${this.onCancel}
            >
                <slot @slotchange=${this.onSlotChange}></slot>
                ${
                    this.withoutClose
                        ? nothing
                        : html`<button
                              part="close-button"
                              type="button"
                              aria-label="Close"
                              class="focus-visible:ring-ring/50 bg-accent absolute top-[calc(var(--panel-spacing)-0.25rem)] right-[calc(var(--panel-spacing)-0.25rem)] z-10 inline-flex cursor-pointer rounded-[calc(var(--hx-radius-control)-0.125rem)] p-1 opacity-80 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px]"
                              @click=${this.hide}
                          >
                              <hx-icon .icon=${X}></hx-icon>
                          </button>`
                }
                ${this.resizeHandles.map((handle) => this.renderResizeHandle(handle))}
            </dialog>`;
    }
}
