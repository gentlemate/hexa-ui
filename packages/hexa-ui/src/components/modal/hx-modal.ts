import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
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
 * @slot trigger - The element that opens the modal on click (e.g. an `hx-button`). Optional: `show()` and
 * `open` also open it.
 * @slot - The modal sections: `hx-modal-header`, `hx-modal-content` and `hx-modal-footer`.
 * @fires hx-show - The modal is about to open. Cancelable.
 * @fires hx-after-show - The modal is open and its enter animation finished.
 * @fires hx-hide - The modal is about to close (Escape, backdrop, close button, `data-close`…). Cancelable.
 * @fires hx-after-hide - The modal is closed and its exit animation finished.
 * @fires hx-resize - The modal was resized, once a handle is released or from the keyboard. `detail.width` and
 * `detail.height` are the new size in pixels.
 * @cssprop [--hx-spacing-modal=var(--hx-spacing-panel)] - Padding.
 * @cssprop [--hx-radius-modal=var(--hx-radius-panel)] - Border radius.
 * @cssprop [--hx-width-modal=36rem] - Width.
 * @cssprop [--hx-min-width-modal=16rem] - Minimum width when resizing.
 * @cssprop [--hx-max-width-modal=calc(100% - 2rem)] - Maximum width.
 * @cssprop [--hx-height-modal=fit-content] - Height.
 * @cssprop [--hx-min-height-modal=10rem] - Minimum height when resizing.
 * @cssprop [--hx-max-height-modal=calc(100% - 2rem)] - Maximum height.
 * @csspart base - The `<dialog>` element (`::part(base)::backdrop` styles the backdrop).
 * @csspart close-button - The close button (not rendered with `without-close`).
 * @csspart handle - The resize handles and corners (rendered with `resizable`, `resizable-x` and `resizable-y`).
 */
@customElement("hx-modal")
export class HxModal extends HxDialogElement {
    @property({ reflect: true }) size?: HxModalSize;
    @property({ type: Boolean, reflect: true }) resizable = false;
    @property({ type: Boolean, reflect: true, attribute: "resizable-x" }) resizableX = false;
    @property({ type: Boolean, reflect: true, attribute: "resizable-y" }) resizableY = false;

    protected get dialogClass() {
        const size =
            this.size === "full"
                ? "h-full w-full max-h-none max-w-none border-0"
                : `${this.size ? sizes[this.size] : "w-modal"} h-modal max-h-modal max-w-modal rounded-modal border`;
        return `${size} ${this.resizable || this.resizableX ? "min-w-modal" : ""} ${
            this.resizable || this.resizableY ? "min-h-modal" : ""
        } m-auto fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 [--panel-spacing:var(--spacing-modal)]`;
    }

    protected override get resizeHandles() {
        return [
            ...(this.resizableX ? edges.width : []),
            ...(this.resizableY ? edges.height : []),
            ...(this.resizable ? corners : []),
        ];
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("size")) this.resetSize();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal": HxModal;
    }
}
