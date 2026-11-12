import type { PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { OuiElement } from "./oui-element.js";

/**
 * @property open - Whether it is open. Setting it directly skips `oui-show` / `oui-hide`.
 * @method show - Opens it (fires `oui-show`).
 * @method hide - Closes it (fires `oui-hide`).
 */
export abstract class OuiOverlayElement extends OuiElement {
    @property({ type: Boolean, reflect: true }) open = false;

    protected abstract readonly overlay: HTMLElement;

    private transition = 0;

    show() {
        if (!this.open && this.emit("oui-show")) this.open = true;
    }

    hide() {
        if (this.open && this.emit("oui-hide")) this.open = false;
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
        this.emit(open ? "oui-after-show" : "oui-after-hide", false);
    }

    private animationsFinished() {
        const animations = this.overlay
            .getAnimations({ subtree: true })
            .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);
        return Promise.allSettled(animations.map((animation) => animation.finished));
    }
}
