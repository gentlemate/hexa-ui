import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OuiDialogElement, type OuiResizeHandle } from "../../oui-dialog-element.js";

export type OuiDrawerVariant = "default" | "secondary";
export type OuiDrawerPlacement = "top" | "right" | "bottom" | "left";
export type OuiDrawerSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

const placements: Record<OuiDrawerPlacement, string> = {
    top: "top-0 bottom-auto max-w-none slide-in-from-top data-[state=closed]:slide-out-to-top",
    right: "right-0 left-auto max-h-none slide-in-from-right data-[state=closed]:slide-out-to-right",
    bottom: "top-auto bottom-0 max-w-none slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
    left: "right-auto left-0 max-h-none slide-in-from-left data-[state=closed]:slide-out-to-left",
};

const variants: Record<OuiDrawerVariant, Record<OuiDrawerPlacement, string>> = {
    default: {
        top: "inset-x-0 w-full border-0 border-b",
        right: "inset-y-0 h-full border-0 border-l",
        bottom: "inset-x-0 w-full border-0 border-t",
        left: "inset-y-0 h-full border-0 border-r",
    },
    secondary: {
        top: "inset-x-0 mx-auto w-fit min-w-[calc(100%-2*var(--inset-drawer))] rounded-b-drawer border border-t-0",
        right: "inset-y-0 my-auto h-fit min-h-[calc(100%-2*var(--inset-drawer))] rounded-l-drawer border border-r-0",
        bottom: "inset-x-0 mx-auto w-fit min-w-[calc(100%-2*var(--inset-drawer))] rounded-t-drawer border border-b-0",
        left: "inset-y-0 my-auto h-fit min-h-[calc(100%-2*var(--inset-drawer))] rounded-r-drawer border border-l-0",
    },
};

const dimensions = {
    width: { size: "w-drawer", min: "min-w-drawer", max: "max-w-drawer" },
    height: { size: "h-drawer", min: "min-h-drawer", max: "max-h-drawer" },
};

const sizes: Record<keyof typeof dimensions, Record<OuiDrawerSize, string>> = {
    width: {
        xs: "w-[16rem]",
        sm: "w-[24rem]",
        md: "w-[36rem]",
        lg: "w-[56rem]",
        xl: "w-[80rem]",
        full: "w-full max-w-none",
    },
    height: {
        xs: "h-[20%]",
        sm: "h-[35%]",
        md: "h-[50%]",
        lg: "h-[65%]",
        xl: "h-[80%]",
        full: "h-full max-h-none",
    },
};

const handles: Record<OuiDrawerPlacement, string> = {
    top: "inset-x-0 bottom-0 h-5 cursor-row-resize",
    right: "inset-y-0 left-0 w-5 cursor-col-resize",
    bottom: "inset-x-0 top-0 h-5 cursor-row-resize",
    left: "inset-y-0 right-0 w-5 cursor-col-resize",
};

/**
 * @element oui-drawer
 * @property variant - Visual style. `secondary` leaves a margin on both sides along the edge and rounds the
 * inner corners.
 * @property placement - Edge of the screen the drawer slides in from.
 * @property size - Width with `left` and `right` (`xs` 16rem to `xl` 80rem), height with `top` and `bottom`
 * (`xs` 20% to `xl` 80% of the screen). Without it, `--oui-width-drawer` and `--oui-height-drawer` apply.
 * @property resizable - Adds a handle on the inner edge to resize the drawer with the pointer or the arrow keys.
 * @slot trigger - The element that opens the drawer on click (e.g. an `oui-button`). Optional: `show()` and
 * `open` also open it.
 * @slot - The drawer sections: `oui-drawer-header`, `oui-drawer-content` and `oui-drawer-footer`.
 * @fires oui-show - The drawer is about to open. Cancelable.
 * @fires oui-after-show - The drawer is open and its enter animation finished.
 * @fires oui-hide - The drawer is about to close (Escape, backdrop, close button, `data-close`…). Cancelable.
 * @fires oui-after-hide - The drawer is closed and its exit animation finished.
 * @fires oui-resize - The drawer was resized, once the handle is released or from the keyboard. `detail.size` is
 * the new width (`left`, `right`) or height (`top`, `bottom`) in pixels.
 * @cssprop [--oui-spacing-drawer=var(--oui-spacing-panel)] - Padding.
 * @cssprop [--oui-radius-drawer=var(--oui-radius-panel)] - Border radius of the inner corners with `secondary`.
 * @cssprop [--oui-inset-drawer=1rem] - Margin on both sides along the edge with `secondary`. `auto` sizes the drawer
 * to its content and centers it along the edge.
 * @cssprop [--oui-width-drawer=36rem] - Width with `left` and `right`.
 * @cssprop [--oui-min-width-drawer=16rem] - Minimum width when resizing.
 * @cssprop [--oui-max-width-drawer=calc(100% - 3rem)] - Maximum width.
 * @cssprop [--oui-height-drawer=auto] - Height with `top` and `bottom`.
 * @cssprop [--oui-min-height-drawer=10rem] - Minimum height when resizing.
 * @cssprop [--oui-max-height-drawer=calc(100% - 3rem)] - Maximum height.
 * @csspart base - The `<dialog>` element (`::part(base)::backdrop` styles the backdrop).
 * @csspart close-button - The close button (not rendered with `without-close`).
 * @csspart handle - The resize handle (rendered with `resizable`).
 */
@customElement("oui-drawer")
export class OuiDrawer extends OuiDialogElement {
    @property({ reflect: true }) variant: OuiDrawerVariant = "default";
    @property({ reflect: true }) placement: OuiDrawerPlacement = "right";
    @property({ reflect: true }) size?: OuiDrawerSize;
    @property({ type: Boolean, reflect: true }) resizable = false;

    private get dimension(): keyof typeof dimensions {
        return this.placement === "left" || this.placement === "right" ? "width" : "height";
    }

    private get growth() {
        return this.placement === "right" || this.placement === "bottom" ? -1 : 1;
    }

    protected get dialogClass() {
        const dimension = dimensions[this.dimension];
        return `${placements[this.placement]} ${variants[this.variant][this.placement]} ${this.size ? sizes[this.dimension][this.size] : dimension.size} ${
            this.size === "full" ? "" : dimension.max
        } ${this.resizable ? `${dimension.min} transition-none` : ""} m-0 duration-300 backdrop:duration-300 data-[state=closed]:duration-200 data-[state=closed]:backdrop:duration-200 [--panel-spacing:var(--spacing-drawer)]`;
    }

    protected override get resizeHandles(): OuiResizeHandle[] {
        if (!this.resizable) return [];
        return [{ class: handles[this.placement], growth: { [this.dimension]: this.growth }, keyboard: true }];
    }

    protected override resizeDetail(rect: DOMRect) {
        return { size: Math.round(rect[this.dimension]) };
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("placement") || changed.has("size")) this.resetSize();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-drawer": OuiDrawer;
    }
}
