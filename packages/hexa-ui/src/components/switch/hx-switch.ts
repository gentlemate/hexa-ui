import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxCheckableElement } from "../../hx-checkable-element.js";

/**
 * @element hx-switch
 * @property value - Value submitted with the form when on.
 * @property checked - Whether the switch is on (not reflected as an attribute).
 * @slot - The switch label.
 * @fires input - The checked state changed.
 * @fires change - The checked state changed.
 * @cssprop [--hx-size-switch=1.25rem] - Size of the thumb. The track is twice as wide.
 * @cssprop [--hx-spacing-switch=1px] - Space between the thumb and the edge of the track.
 * @csspart control - The track.
 * @csspart thumb - The sliding thumb.
 * @csspart label - The label wrapper.
 * @cssstate checked - The switch is on.
 */
@customElement("hx-switch")
export class HxSwitch extends HxCheckableElement {
    constructor() {
        super("switch");
    }

    override render() {
        return html`<span
                part="control"
                class="${
                    this.checked ? "bg-primary" : "bg-field"
                } h-switch w-switch p-switch box-content inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors"
            >
                <span
                    part="thumb"
                    class="${
                        this.checked ? "translate-x-full" : "translate-x-0"
                    } bg-background size-switch rounded-full shadow-sm transition-transform"
                ></span>
            </span>
            <span part="label" class="text-foreground leading-none"><slot></slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-switch": HxSwitch;
    }
}
