import type { Placement } from "@floating-ui/dom";
import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { clamp, formatColor, parseColor, type HsvaColor, type OuiColorFormat } from "../../color.js";
import { renderSwatch } from "../../color-swatch.js";
import { OuiPickerElement } from "../../oui-picker-element.js";
import "../color-field/oui-color-field.js";
import type { OuiColorField } from "../color-field/oui-color-field.js";
import "../color-swatch-picker/oui-color-swatch-picker.js";
import type { OuiColorSwatchPicker, OuiColorSwatchPickerSize } from "../color-swatch-picker/oui-color-swatch-picker.js";
import "../select/oui-select.js";
import type { OuiSelect } from "../select/oui-select.js";

export type OuiColorPickerFormat = OuiColorFormat;
export type OuiColorPickerPlacement = Placement;
export type OuiColorPickerSwatchSize = OuiColorSwatchPickerSize;

type ColorControl = "area" | "hue" | "alpha";

interface ColorSliderOptions {
    label: string;
    fraction: number;
    max: number;
    unit: string;
    fill: string;
    thumb: string;
}

const defaultColor: HsvaColor = { h: 0, s: 1, v: 1, a: 1 };

const formats: OuiColorFormat[] = ["hex", "rgb", "hsl", "oklch"];

const keySteps: Record<string, number> = {
    ArrowRight: 0.01,
    ArrowUp: 0.01,
    ArrowLeft: -0.01,
    ArrowDown: -0.01,
    PageUp: 0.1,
    PageDown: -0.1,
    Home: -Infinity,
    End: Infinity,
};

const thumbClass =
    "size-color-thumb rounded-color-thumb focus-visible:ring-ring/50 absolute -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-md outline-none focus-visible:ring-[3px]";

const stop = (event: Event) => event.stopPropagation();

function channelOf(control: ColorControl, key: string) {
    if (control === "area") return /Up|Down/.test(key) ? "v" : "s";
    return control === "hue" ? "h" : "a";
}

/**
 * @element oui-color-picker
 * @property name - Name submitted with the form.
 * @property value - Selected color, as a hex, `rgb()`, `hsl()` or `oklch()` string; kept as is until the user edits it.
 * @property format - Format of the value once the user edits it.
 * @property alpha - Shows the transparency slider and keeps the transparency of the color.
 * @property swatches - Colors offered in the popup, as JSON in the attribute.
 * @property swatchSize - Size of the swatches in the popup.
 * @property formatSelect - Shows a select in the popup to display the color in another format; `value` stays in `format`.
 * @property placement - Position of the popup relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the popup.
 * @fires input - The color changed, while dragging or from the keyboard.
 * @fires change - The color changed, once the pointer is released or from the keyboard.
 * @fires oui-show - The popup is about to open. Cancelable.
 * @fires oui-after-show - The popup is open and its enter animation finished.
 * @fires oui-hide - The popup is about to close. Cancelable.
 * @fires oui-after-hide - The popup is closed and its exit animation finished.
 * @cssprop [--oui-height-color-picker=var(--oui-height-field)] - Height of the trigger.
 * @cssprop [--oui-spacing-color-picker=var(--oui-spacing-field)] - Horizontal padding of the trigger.
 * @cssprop [--oui-radius-color-picker=var(--oui-radius-field)] - Border radius of the trigger.
 * @cssprop [--oui-width-color-popup=16rem] - Width of the popup.
 * @cssprop [--oui-spacing-color-popup=0.75rem] - Padding of the popup.
 * @cssprop [--oui-height-color-area=10rem] - Height of the saturation and brightness area.
 * @cssprop [--oui-radius-color-area=min(var(--oui-radius-panel), 0.5rem)] - Border radius of the saturation and brightness area.
 * @cssprop [--oui-height-color-slider=0.75rem] - Height of the hue and transparency sliders.
 * @cssprop [--oui-radius-color-slider=var(--oui-radius-pill)] - Border radius of the hue and transparency sliders.
 * @cssprop [--oui-size-color-thumb=1.25rem] - Size of the thumbs.
 * @cssprop [--oui-radius-color-thumb=var(--oui-radius-pill)] - Border radius of the thumbs.
 * @cssprop [--oui-size-color-swatch=1.25rem] - Size of the preview in the trigger and the field.
 * @cssprop [--oui-radius-color-swatch=var(--oui-radius-pill)] - Border radius of the preview and the swatches.
 * @csspart trigger - The button showing the selected color.
 * @csspart swatch - The preview of the color in the trigger.
 * @csspart value - The selected color, or the placeholder.
 * @csspart popup - The panel holding the controls.
 * @csspart area - The saturation and brightness area.
 * @csspart area-thumb - The thumb of the area.
 * @csspart hue - The hue slider.
 * @csspart hue-thumb - The thumb of the hue slider.
 * @csspart alpha - The transparency slider, shown with `alpha`.
 * @csspart alpha-thumb - The thumb of the transparency slider.
 * @csspart swatches - The `oui-color-swatch-picker`, shown with `swatches`.
 * @csspart preset - An `oui-color-swatch` of the list.
 * @csspart formats - The `oui-select` choosing the format of the field, shown with `format-select`.
 * @csspart field - The `oui-color-field`.
 */
@customElement("oui-color-picker")
export class OuiColorPicker extends OuiPickerElement {
    @property({ reflect: true }) name = "";
    @property() value = "";
    @property({ reflect: true }) format: OuiColorFormat = "hex";
    @property({ type: Boolean, reflect: true }) alpha = false;
    @property({ type: Array }) swatches: string[] = [];
    @property({ attribute: "swatch-size" }) swatchSize: OuiColorSwatchPickerSize = "sm";
    @property({ type: Boolean, attribute: "format-select" }) formatSelect = false;

    @query("[part=area-thumb]") private areaThumb!: HTMLElement;

    @state() private color = defaultColor;
    @state() private displayFormat?: OuiColorFormat;

    private dragStart?: string;

    protected get triggerClass() {
        return "rounded-color-picker h-color-picker px-color-picker";
    }

    protected get popupClass() {
        return "p-color-popup w-color-popup";
    }

    protected get displayText() {
        return this.value;
    }

    private get fieldFormat() {
        return this.displayFormat ?? this.format;
    }

    private get fieldValue() {
        if (!this.value || this.fieldFormat === this.format) return this.value;
        return formatColor(this.color, this.fieldFormat, this.alpha);
    }

    private notify(commit: boolean) {
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        if (commit) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private setColor(channels: Partial<HsvaColor>, commit: boolean) {
        this.color = { ...this.color, ...channels };
        const value = formatColor(this.color, this.format, this.alpha);
        if (value === this.value) return;
        this.value = value;
        this.notify(commit);
    }

    private moveTo(event: PointerEvent) {
        const element = event.currentTarget as HTMLElement;
        const { left, top, width, height } = element.getBoundingClientRect();
        const x = clamp((event.clientX - left) / width);
        const y = clamp(1 - (event.clientY - top) / height);
        const control = element.dataset.control as ColorControl;
        if (control === "area") this.setColor({ s: x, v: y }, false);
        else this.setColor(control === "hue" ? { h: x * 360 } : { a: x }, false);
    }

    private onPointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        event.preventDefault();
        const element = event.currentTarget as HTMLElement;
        element.querySelector<HTMLElement>("[role=slider]")!.focus();
        element.setPointerCapture(event.pointerId);
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
        const step = keySteps[event.key];
        if (!step) return;
        event.preventDefault();
        const control = (event.currentTarget as HTMLElement).dataset.control as ColorControl;
        const channel = channelOf(control, event.key);
        const range = channel === "h" ? 360 : 1;
        this.setColor({ [channel]: clamp(this.color[channel] / range + step) * range }, true);
    }

    private onFieldChange(event: Event) {
        event.stopPropagation();
        const color = parseColor((event.target as OuiColorField).value);
        if (color) return this.setColor(color, true);
        this.value = "";
        this.notify(true);
    }

    private onSwatchChange(event: Event) {
        event.stopPropagation();
        const color = parseColor((event.target as OuiColorSwatchPicker).value);
        if (color) this.setColor(color, true);
    }

    private onFormatChange(event: Event) {
        event.stopPropagation();
        this.displayFormat = (event.target as OuiSelect).value as OuiColorFormat;
    }

    protected focusPopup() {
        this.areaThumb.focus({ preventScroll: true });
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("value") && this.value !== formatColor(this.color, this.format, this.alpha))
            this.color = parseColor(this.value) ?? defaultColor;
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        this.internals.setFormValue(this.value);
        if (this.required && !this.value)
            this.internals.setValidity({ valueMissing: true }, "Please select a color.", this.focusTarget);
        else this.internals.setValidity({});
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    protected renderTrigger() {
        return html`${renderSwatch(this.value)}${this.renderValue()}`;
    }

    private renderArea(opaque: string) {
        const { h, s, v } = this.color;
        const saturation = Math.round(s * 100);
        const brightness = Math.round(v * 100);
        return html`<div
            part="area"
            data-control="area"
            class="rounded-color-area h-color-area relative cursor-crosshair touch-none"
            style=${styleMap({
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${h} 100% 50%)`,
            })}
            @pointerdown=${this.onPointerDown}
            @pointermove=${this.onPointerMove}
            @lostpointercapture=${this.onPointerEnd}
            @keydown=${this.onKeyDown}
        >
            <div
                part="area-thumb"
                role="slider"
                tabindex="0"
                aria-label="Saturation and brightness"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow=${saturation}
                aria-valuetext="Saturation ${saturation}%, brightness ${brightness}%"
                class=${thumbClass}
                style=${styleMap({ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: opaque })}
            ></div>
        </div>`;
    }

    private renderSlider(control: "hue" | "alpha", { label, fraction, max, unit, fill, thumb }: ColorSliderOptions) {
        const now = Math.round(fraction * max);
        return html`<div
            part=${control}
            data-control=${control}
            class="${
                control === "alpha" ? "bg-checkerboard" : ""
            } rounded-color-slider h-color-slider relative cursor-pointer touch-none"
            @pointerdown=${this.onPointerDown}
            @pointermove=${this.onPointerMove}
            @lostpointercapture=${this.onPointerEnd}
            @keydown=${this.onKeyDown}
        >
            <div class="size-full rounded-[inherit]" style=${styleMap({ background: fill })}></div>
            <div
                part="${control}-thumb"
                role="slider"
                tabindex="0"
                aria-label=${label}
                aria-valuemin="0"
                aria-valuemax=${max}
                aria-valuenow=${now}
                aria-valuetext="${now}${unit}"
                class="${thumbClass} top-1/2"
                style=${styleMap({ left: `${fraction * 100}%`, background: thumb })}
            ></div>
        </div>`;
    }

    private renderSwatches() {
        if (!this.swatches?.length) return nothing;
        const swatches = this.swatches.filter((swatch) => parseColor(swatch));
        const selected = swatches.find(
            (swatch) => formatColor(parseColor(swatch)!, this.format, this.alpha) === this.value,
        );
        return html`<oui-color-swatch-picker
            part="swatches"
            aria-label="Swatches"
            size=${this.swatchSize}
            .value=${selected ?? ""}
            @input=${stop}
            @change=${this.onSwatchChange}
        >
            ${swatches.map((swatch) => html`<oui-color-swatch part="preset" value=${swatch}></oui-color-swatch>`)}
        </oui-color-swatch-picker>`;
    }

    private renderFormats() {
        if (!this.formatSelect) return nothing;
        return html`<oui-select
            part="formats"
            .value=${this.fieldFormat}
            @input=${stop}
            @change=${this.onFormatChange}
            @oui-show=${stop}
            @oui-after-show=${stop}
            @oui-hide=${stop}
            @oui-after-hide=${stop}
        >
            ${formats.map(
                (format) => html`<oui-select-option value=${format}>${format.toUpperCase()}</oui-select-option>`,
            )}
        </oui-select>`;
    }

    protected renderPopup() {
        const { h, a } = this.color;
        const opaque = formatColor(this.color, "rgb", false);
        return html`<div class="flex flex-col gap-3">
            ${this.renderArea(opaque)}
            ${this.renderSlider("hue", {
                label: "Hue",
                fraction: h / 360,
                max: 360,
                unit: "°",
                fill: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                thumb: `hsl(${h} 100% 50%)`,
            })}
            ${
                this.alpha
                    ? this.renderSlider("alpha", {
                          label: "Transparency",
                          fraction: a,
                          max: 100,
                          unit: "%",
                          fill: `linear-gradient(to right, transparent, ${opaque})`,
                          thumb: opaque,
                      })
                    : nothing
            }
            ${this.renderSwatches()} ${this.renderFormats()}
            <oui-color-field
                part="field"
                .value=${this.fieldValue}
                format=${this.fieldFormat}
                ?alpha=${this.alpha}
                @input=${stop}
                @change=${this.onFieldChange}
            ></oui-color-field>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-color-picker": OuiColorPicker;
    }
}
