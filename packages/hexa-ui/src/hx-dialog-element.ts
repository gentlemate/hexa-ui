import { css, html, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { X } from "lucide";
import { focusTargetOf } from "./focus-target.js";
import { HxElement } from "./hx-element.js";
import { HxOverlayElement } from "./hx-overlay-element.js";
import "./components/icon/hx-icon.js";

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

    protected abstract get dialogClass(): string;

    private trigger?: HTMLElement;
    private triggerTarget?: HTMLElement;
    private pressedBackdrop = false;
    private scrollLocked = false;

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
                } bg-background text-foreground border-border animate-in data-[state=closed]:animate-out backdrop:animate-in backdrop:fade-in-0 data-[state=closed]:backdrop:animate-out data-[state=closed]:backdrop:fade-out-0 flex-col overflow-hidden p-0 shadow-lg outline-none [--panel-footer-justify:flex-end] [--panel-radius:0px] backdrop:bg-black/50 open:flex"
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
                              class="rounded-control-sm focus-visible:ring-ring/50 absolute top-[calc(var(--panel-spacing)-0.25rem)] right-[calc(var(--panel-spacing)-0.25rem)] inline-flex cursor-pointer p-1 opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px]"
                              @click=${this.hide}
                          >
                              <hx-icon .icon=${X}></hx-icon>
                          </button>`
                }
            </dialog>`;
    }
}
