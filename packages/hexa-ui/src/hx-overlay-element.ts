import type { PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { HxElement } from "./hx-element.js";

/**
 * @property open - Whether it is open. Setting it directly skips `hx-show` / `hx-hide`.
 * @method show - Opens it (fires `hx-show`).
 * @method hide - Closes it (fires `hx-hide`).
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
