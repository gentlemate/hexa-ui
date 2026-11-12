import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { OuiCheckableElement } from "../../oui-checkable-element.js";

/**
 * @element oui-switch
 * @property value - Value submitted with the form when on.
 * @property checked - Whether the switch is on (not reflected as an attribute).
 * @slot - The switch label.
 * @fires input - The checked state changed.
 * @fires change - The checked state changed.
 * @cssprop [--oui-size-switch=1.25rem] - Size of the thumb. The track is twice as wide.
 * @cssprop [--oui-spacing-switch=1px] - Space between the thumb and the edge of the track.
 * @cssprop [--oui-radius-switch=var(--oui-radius-pill)] - Border radius of the track.
 * @cssprop [--oui-radius-switch-thumb=var(--oui-radius-switch)] - Border radius of the thumb.
 * @csspart control - The track.
 * @csspart thumb - The sliding thumb.
 * @csspart label - The label wrapper.
 * @cssstate checked - The switch is on.
 */
@customElement("oui-switch")
export class OuiSwitch extends OuiCheckableElement {
    constructor() {
        super("switch");
    }

    override render() {
        return html`<span
                part="control"
                class="${
                    this.checked ? "bg-primary" : "bg-foreground/15"
                } h-switch w-switch p-switch rounded-switch box-content inline-flex shrink-0 items-center border border-transparent shadow-xs transition-colors"
            >
                <span
                    part="thumb"
                    class="${
                        this.checked ? "translate-x-full" : "translate-x-0"
                    } bg-background size-switch rounded-switch-thumb shadow-sm transition-transform"
                ></span>
            </span>
            <span part="label" class="text-foreground leading-none"><slot></slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-switch": OuiSwitch;
    }
}
