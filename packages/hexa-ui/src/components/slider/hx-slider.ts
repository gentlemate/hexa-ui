import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { HxRangeElement } from "../../hx-range-element.js";

/**
 * @element hx-slider
 * @property name - Name submitted with the form.
 * @property step - Interval between two values, also added or removed by the arrow keys.
 * @property showSteps - Shows a dot on the track at each step.
 * @property disabled - Prevents user interaction.
 * @fires input - The value changed, while dragging or from the keyboard.
 * @fires change - The value changed, once the thumb is released or from the keyboard.
 * @cssprop [--hx-height-slider=0.5rem] - Height of the track.
 * @cssprop [--hx-size-slider-thumb=1.25rem] - Size of the thumb.
 * @cssprop [--hx-radius-slider=9999px] - Border radius of the track and the thumb.
 * @csspart label - The label.
 * @csspart value - The formatted value.
 * @csspart track - The track.
 * @csspart fill - The filled part of the track.
 * @csspart step - A dot on the track, shown with `show-steps`.
 * @csspart thumb - The draggable thumb.
 */
@customElement("hx-slider")
export class HxSlider extends HxRangeElement {
    static formAssociated = true;
    static override shadowRootOptions = { ...HxRangeElement.shadowRootOptions, delegatesFocus: true };
    static override styles = [
        HxRangeElement.styles,
        css`
            :host {
                display: block;
            }
            :host([disabled]) {
                cursor: not-allowed;
                opacity: 0.5;
            }
        `,
    ];

    @property({ reflect: true }) name = "";
    @property({ type: Number }) step = 1;
    @property({ type: Boolean, attribute: "show-steps" }) showSteps = false;
    @property({ type: Boolean, reflect: true }) disabled = false;

    @query("[part=track]") private track!: HTMLElement;
    @query("[part=thumb]") private thumb!: HTMLElement;

    private internals = this.attachInternals();
    private dragStart?: number;

    private snap(value: number) {
        const decimals = Math.max(...[this.min, this.step].map((n) => String(n).split(".")[1]?.length ?? 0));
        return this.clamp(
            Number((this.min + Math.round((value - this.min) / this.step) * this.step).toFixed(decimals)),
        );
    }

    private setValue(value: number, commit: boolean) {
        value = this.snap(value);
        if (value === this.value) return;
        this.value = value;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        if (commit) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private moveTo(event: PointerEvent) {
        const { left, width } = this.track.getBoundingClientRect();
        this.setValue(this.min + ((event.clientX - left) / width) * (this.max - this.min), false);
    }

    private onPointerDown(event: PointerEvent) {
        if (this.disabled || event.button !== 0) return;
        event.preventDefault();
        this.thumb.focus();
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        this.dragStart = this.value;
        this.moveTo(event);
    }

    private onPointerMove(event: PointerEvent) {
        if (this.dragStart !== undefined) this.moveTo(event);
    }

    private onPointerEnd() {
        if (this.dragStart !== undefined && this.dragStart !== this.value)
            this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        this.dragStart = undefined;
    }

    private onKeyDown(event: KeyboardEvent) {
        const page = Math.max(this.step, (this.max - this.min) / 10);
        switch (event.key) {
            case "ArrowRight":
            case "ArrowUp":
                this.setValue(this.value + this.step, true);
                break;
            case "ArrowLeft":
            case "ArrowDown":
                this.setValue(this.value - this.step, true);
                break;
            case "PageUp":
                this.setValue(this.value + page, true);
                break;
            case "PageDown":
                this.setValue(this.value - page, true);
                break;
            case "Home":
                this.setValue(this.min, true);
                break;
            case "End":
                this.setValue(this.max, true);
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("value") || changed.has("min") || changed.has("max") || changed.has("step"))
            this.value = this.snap(this.value);
    }

    protected override updated() {
        this.internals.setFormValue(String(this.value));
    }

    formResetCallback() {
        this.value = Number(this.getAttribute("value") ?? 0);
    }

    private renderSteps(percent: number) {
        const range = this.max - this.min;
        const count = Math.ceil(Number((range / this.step).toFixed(10))) - 1;
        return Array.from({ length: count }, (_, i) => ((i + 1) * this.step * 100) / range).map(
            (position) =>
                html`<span
                    part="step"
                    class="${
                        position <= percent ? "bg-primary-foreground/50" : "bg-foreground/20"
                    } absolute top-1/2 size-[calc(var(--hx-height-slider)/2)] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style="left: ${position}%"
                ></span>`,
        );
    }

    override render() {
        const percent = this.fraction * 100;
        return html`<div class="text-foreground flex flex-col gap-1.5">
            ${this.renderHeader(true)}
            <div
                class="${
                    this.disabled ? "pointer-events-none" : "cursor-pointer"
                } relative flex h-(--size-slider-thumb) touch-none items-center"
                @pointerdown=${this.onPointerDown}
                @pointermove=${this.onPointerMove}
                @lostpointercapture=${this.onPointerEnd}
            >
                <div part="track" class="bg-field h-slider rounded-slider relative w-full overflow-hidden">
                    <div part="fill" class="bg-primary h-full" style="width: ${percent}%"></div>
                    ${this.showSteps && this.max > this.min && this.step > 0 ? this.renderSteps(percent) : nothing}
                </div>
                <div
                    part="thumb"
                    role="slider"
                    tabindex=${this.disabled ? -1 : 0}
                    aria-labelledby=${ifDefined(this.label ? "label" : undefined)}
                    aria-valuemin=${this.min}
                    aria-valuemax=${this.max}
                    aria-valuenow=${this.value}
                    aria-valuetext=${this.valueText}
                    aria-disabled=${this.disabled ? "true" : "false"}
                    class="bg-background border-primary size-slider-thumb focus-visible:ring-ring/50 rounded-slider absolute top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 shadow-sm outline-none focus-visible:ring-[3px]"
                    style="left: ${percent}%"
                    @keydown=${this.onKeyDown}
                ></div>
            </div>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-slider": HxSlider;
    }
}
