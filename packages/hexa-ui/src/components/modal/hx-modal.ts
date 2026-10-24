import { customElement } from "lit/decorators.js";
import { HxDialogElement } from "../../hx-dialog-element.js";

/**
 * @element hx-modal
 * @slot trigger - The element that opens the modal on click (e.g. an `hx-button`). Optional: `show()` and
 * `open` also open it.
 * @slot - The modal sections: `hx-modal-header`, `hx-modal-content` and `hx-modal-footer`.
 * @fires hx-show - The modal is about to open. Cancelable.
 * @fires hx-after-show - The modal is open and its enter animation finished.
 * @fires hx-hide - The modal is about to close (Escape, backdrop, close button, `data-close`…). Cancelable.
 * @fires hx-after-hide - The modal is closed and its exit animation finished.
 * @csspart base - The `<dialog>` element (`::part(base)::backdrop` styles the backdrop).
 * @csspart close-button - The close button (not rendered with `without-close`).
 */
@customElement("hx-modal")
export class HxModal extends HxDialogElement {
    protected get dialogClass() {
        return "w-md rounded-card m-auto fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 max-h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] border [--panel-spacing:var(--spacing-modal)]";
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-modal": HxModal;
    }
}
