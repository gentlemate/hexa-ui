import type { PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { HxElement } from "./hx-element.js";

/**
 * Base class for components that show an overlay in the top layer (tooltip, dropdown menu…).
 *
 * `show()` and `hide()` fire the cancelable `hx-show` / `hx-hide` events, then toggle `open`. Setting
 * `open` directly skips them. The overlay renders `data-state="open|closed"` so the CSS can run
 * enter/exit animations: on close, the overlay stays in the top layer until its animations finish,
 * then `hx-after-hide` fires (`hx-after-show` once the enter animations finish).
 *
 * By default the overlay is a `[popover]`; subclasses override `present()` / `dismiss()` for other
 * mechanisms (e.g. `<dialog>`), or extend them to start and stop their own behavior.
 */
export abstract class HxOverlayElement extends HxElement {
    @property({ type: Boolean, reflect: true }) open = false;

    protected abstract readonly overlay: HTMLElement;

    private transition = 0;

    show() {
        if (!this.open && this.emit("hx-show")) this.open = true;
    }

    hide() {
        if (this.open && this.emit("hx-hide")) this.open = false;
    }

    protected emit(type: string, cancelable = true) {
        return this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, cancelable }));
    }

    protected present() {
        if (!this.overlay.matches(":popover-open")) this.overlay.showPopover();
    }

    protected dismiss() {
        if (this.overlay.matches(":popover-open")) this.overlay.hidePopover();
    }

    protected override firstUpdated() {
        this.overlay.addEventListener("toggle", (event) => {
            if ((event as ToggleEvent).newState === "closed" && this.open) this.open = false;
        });
    }

    protected override updated(changed: PropertyValues<this>) {
        if (changed.has("open") && (this.open || changed.get("open") !== undefined)) this.transitionTo(this.open);
    }

    private async transitionTo(open: boolean) {
        const transition = ++this.transition;
        if (open) this.present();
        await this.animationsFinished();
        if (transition !== this.transition) return;
        if (!open) this.dismiss();
        this.emit(open ? "hx-after-show" : "hx-after-hide", false);
    }

    private animationsFinished() {
        const animations = this.overlay
            .getAnimations({ subtree: true })
            .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);
        return Promise.allSettled(animations.map((animation) => animation.finished));
    }
}
