import { customElement, property } from "lit/decorators.js";
import { HxDialogElement } from "../../hx-dialog-element.js";

export type HxDrawerPlacement = "top" | "right" | "bottom" | "left";

const placements: Record<HxDrawerPlacement, string> = {
    top: "inset-x-0 top-0 bottom-auto h-auto max-h-[calc(100%-3rem)] w-full max-w-none border-0 border-b slide-in-from-top data-[state=closed]:slide-out-to-top",
    right: "inset-y-0 right-0 left-auto h-full max-h-none w-md max-w-[calc(100%-3rem)] border-0 border-l slide-in-from-right data-[state=closed]:slide-out-to-right",
    bottom: "inset-x-0 top-auto bottom-0 h-auto max-h-[calc(100%-3rem)] w-full max-w-none border-0 border-t slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
    left: "inset-y-0 right-auto left-0 h-full max-h-none w-md max-w-[calc(100%-3rem)] border-0 border-r slide-in-from-left data-[state=closed]:slide-out-to-left",
};

/**
 * @element hx-drawer
 * @property placement - Edge of the screen the drawer slides in from.
 * @slot trigger - The element that opens the drawer on click (e.g. an `hx-button`). Optional: `show()` and
 * `open` also open it.
 * @slot - The drawer sections: `hx-drawer-header`, `hx-drawer-content` and `hx-drawer-footer`.
 * @fires hx-show - The drawer is about to open. Cancelable.
 * @fires hx-after-show - The drawer is open and its enter animation finished.
 * @fires hx-hide - The drawer is about to close (Escape, backdrop, close button, `data-close`…). Cancelable.
 * @fires hx-after-hide - The drawer is closed and its exit animation finished.
 * @csspart base - The `<dialog>` element (`::part(base)::backdrop` styles the backdrop).
 * @csspart close-button - The close button (not rendered with `without-close`).
 */
@customElement("hx-drawer")
export class HxDrawer extends HxDialogElement {
    @property({ reflect: true }) placement: HxDrawerPlacement = "right";

    protected get dialogClass() {
        return `${placements[this.placement]} m-0 duration-300 backdrop:duration-300 data-[state=closed]:duration-200 data-[state=closed]:backdrop:duration-200 [--panel-spacing:var(--spacing-drawer)]`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-drawer": HxDrawer;
    }
}
