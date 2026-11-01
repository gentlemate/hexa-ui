import { css, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HxDialogElement, type HxResizeAxis, type HxResizeHandle } from "../../hx-dialog-element.js";

export type HxModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

const sizes: Record<Exclude<HxModalSize, "full">, string> = {
    xs: "w-[16rem]",
    sm: "w-[24rem]",
    md: "w-[36rem]",
    lg: "w-[56rem]",
    xl: "w-[80rem]",
};

const edges: Record<HxResizeAxis, HxResizeHandle[]> = {
    width: [
        { class: "inset-y-0 left-0 w-5 cursor-col-resize", growth: { width: -2 } },
        { class: "inset-y-0 right-0 w-5 cursor-col-resize", growth: { width: 2 }, keyboard: true },
    ],
    height: [
        { class: "inset-x-0 top-0 h-5 cursor-row-resize", growth: { height: -2 } },
        { class: "inset-x-0 bottom-0 h-5 cursor-row-resize", growth: { height: 2 }, keyboard: true },
    ],
};

const corners: HxResizeHandle[] = [
    { class: "top-0 left-0 size-5 cursor-nwse-resize", growth: { width: -2, height: -2 } },
    { class: "top-0 right-0 size-5 cursor-nesw-resize", growth: { width: 2, height: -2 } },
    { class: "bottom-0 left-0 size-5 cursor-nesw-resize", growth: { width: -2, height: 2 } },
    { class: "right-0 bottom-0 size-5 cursor-nwse-resize", growth: { width: 2, height: 2 }, keyboard: true },
];

const grabZones = ["header", "footer", "title", "description"];

/**
 * @element hx-modal
 * @property size - Width, from `xs` 16rem to `xl` 80rem. `full` covers the whole screen. Without it,
 * `--hx-width-modal` applies.
 * @property resizable - Makes the corners resize the width and the height with the pointer, or the arrow keys
 * from the bottom right corner.
 * @property resizableX - Adds handles on the left and right edges to resize the width with the pointer or the
 * arrow keys.
 * @property resizableY - Adds handles on the top and bottom edges to resize the height with the pointer or the
 * arrow keys.
 * @property movable - Lets the modal be dragged by its empty areas: around the sections, the header (title and
 * description included) and the footer, not the content. It stays within the screen and keeps its position
 * when reopened.
 * @slot trigger - The element that opens the modal on click (e.g. an `hx-button`). Optional: `show()` and
 * `open` also open it.
 * @slot - The modal sections: `hx-modal-header`, `hx-modal-content` and `hx-modal-footer`.
 * @fires hx-show - The modal is about to open. Cancelable.
 * @fires hx-after-show - The modal is open and its enter animation finished.
 * @fires hx-hide - The modal is about to close (Escape, backdrop, close button, `data-close`…). Cancelable.
 * @fires hx-after-hide - The modal is closed and its exit animation finished.
 * @fires hx-resize - The modal was resized, once a handle is released or from the keyboard. `detail.width` and
 * `detail.height` are the new size in pixels.
 * @fires hx-move - The modal was moved, once released. `detail.x` and `detail.y` are its offset from the center
 * in pixels.
 * @cssprop [--hx-spacing-modal=var(--hx-spacing-panel)] - Padding.
 * @cssprop [--hx-radius-modal=var(--hx-radius-panel)] - Border radius.
 * @cssprop [--hx-width-modal=36rem] - Width.
 * @cssprop [--hx-min-width-modal=16rem] - Minimum width when resizing.
 * @cssprop [--hx-height-modal=fit-content] - Height.
 * @cssprop [--hx-min-height-modal=10rem] - Minimum height when resizing.
 * @csspart base - The `<dialog>` element (`::part(base)::backdrop` styles the backdrop).
 * @csspart close-button - The close button (not rendered with `without-close`).
 * @csspart handle - The resize handles and corners (rendered with `resizable`, `resizable-x` and `resizable-y`).
 */
@customElement("hx-modal")
export class HxModal extends HxDialogElement {
    static override styles = [
        HxDialogElement.styles,
        css`
            ::slotted(hx-modal-content) {
                cursor: auto;
            }
        `,
    ];

    @property({ reflect: true }) size?: HxModalSize;
    @property({ type: Boolean, reflect: true }) resizable = false;
    @property({ type: Boolean, reflect: true, attribute: "resizable-x" }) resizableX = false;
    @property({ type: Boolean, reflect: true, attribute: "resizable-y" }) resizableY = false;
    @property({ type: Boolean, reflect: true }) movable = false;

    @state() private moving = false;

    private offset = { x: 0, y: 0 };
    private moveStart?: { x: number; y: number; offset: { x: number; y: number } };

    private reposition = () => {
        if (this.offset.x || this.offset.y) this.moveTo(this.offset.x, this.offset.y);
    };

    private resizeObserver = new ResizeObserver(this.reposition);

    protected get dialogClass() {
        const size =
            this.size === "full"
                ? "h-full w-full border-0"
                : `${this.size ? sizes[this.size] : "w-modal"} h-modal rounded-modal border`;
        return `${size} ${this.resizable || this.resizableX ? "min-w-modal" : ""} ${
            this.resizable || this.resizableY ? "min-h-modal" : ""
        } ${this.movable ? `${this.moving ? "cursor-grabbing" : "cursor-grab"} touch-none` : ""} max-h-full max-w-full m-auto fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 [--panel-spacing:var(--spacing-modal)]`;
    }

    protected override get resizeHandles() {
        return [
            ...(this.resizableX ? edges.width : []),
            ...(this.resizableY ? edges.height : []),
            ...(this.resizable ? corners : []),
        ];
    }

    private isGrabZone(event: PointerEvent) {
        const target = event.target as Element;
        if (target === this.overlay) return !this.onBackdrop(event);
        return (
            grabZones.some((zone) => target.localName === `${this.localName}-${zone}`) &&
            target.closest(this.localName) === this
        );
    }

    private moveTo(x: number, y: number) {
        const rect = this.overlay.getBoundingClientRect();
        const left = rect.left - this.offset.x;
        const top = rect.top - this.offset.y;
        this.offset = {
            x: Math.round(Math.min(Math.max(x, -left), innerWidth - left - rect.width)),
            y: Math.round(Math.min(Math.max(y, -top), innerHeight - top - rect.height)),
        };
        this.overlay.style.translate = `${this.offset.x}px ${this.offset.y}px`;
    }

    private resetPosition() {
        this.offset = { x: 0, y: 0 };
        this.overlay.style.translate = "";
    }

    private onMoveStart(event: PointerEvent) {
        if (!this.movable || event.button !== 0 || !this.isGrabZone(event)) return;
        event.preventDefault();
        this.overlay.setPointerCapture(event.pointerId);
        this.moveStart = { x: event.clientX - this.offset.x, y: event.clientY - this.offset.y, offset: this.offset };
        this.moving = true;
    }

    private onMove(event: PointerEvent) {
        if (this.moveStart) this.moveTo(event.clientX - this.moveStart.x, event.clientY - this.moveStart.y);
    }

    private onMoveEnd() {
        const start = this.moveStart?.offset;
        this.moveStart = undefined;
        this.moving = false;
        if (!start || (start.x === this.offset.x && start.y === this.offset.y)) return;
        this.dispatchEvent(new CustomEvent("hx-move", { detail: { ...this.offset }, bubbles: true, composed: true }));
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        removeEventListener("resize", this.reposition);
        this.resizeObserver.disconnect();
    }

    protected override present() {
        super.present();
        addEventListener("resize", this.reposition);
        this.resizeObserver.observe(this.overlay);
    }

    protected override dismiss() {
        super.dismiss();
        removeEventListener("resize", this.reposition);
        this.resizeObserver.disconnect();
    }

    protected override firstUpdated() {
        super.firstUpdated();
        this.overlay.addEventListener("pointerdown", (event) => this.onMoveStart(event));
        this.overlay.addEventListener("pointermove", (event) => this.onMove(event));
        this.overlay.addEventListener("lostpointercapture", () => this.onMoveEnd());
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("size")) this.resetSize();
        if (!this.movable) this.resetPosition();
        else if (this.offset.x || this.offset.y) this.moveTo(this.offset.x, this.offset.y);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal": HxModal;
    }
}
