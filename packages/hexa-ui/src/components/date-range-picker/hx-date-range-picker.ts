import type { Placement } from "@floating-ui/dom";
import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { parseDate } from "../../date.js";
import { HxPickerElement, type HxDateStyle } from "../../hx-picker-element.js";
import "../range-calendar/hx-range-calendar.js";
import type { HxRangeCalendar } from "../range-calendar/hx-range-calendar.js";

export type HxDateRangePickerPlacement = Placement;
export type HxDateRangePickerDateStyle = HxDateStyle;

/**
 * @element hx-date-range-picker
 * @property startName - Name of the first date submitted with the form.
 * @property endName - Name of the last date submitted with the form.
 * @property start - First date of the selected range, as `YYYY-MM-DD`.
 * @property end - Last date of the selected range, as `YYYY-MM-DD`.
 * @fires input - The user selected another range.
 * @fires change - The user selected another range.
 * @fires hx-show - The calendar is about to open. Cancelable.
 * @fires hx-after-show - The calendar is open and its enter animation finished.
 * @fires hx-hide - The calendar is about to close. Cancelable.
 * @fires hx-after-hide - The calendar is closed and its exit animation finished.
 * @csspart trigger - The button showing the selected range.
 * @csspart value - The selected range, or the placeholder.
 * @csspart icon - The calendar icon of the trigger.
 * @csspart popup - The panel holding the calendar.
 * @csspart calendar - The `hx-range-calendar`.
 */
@customElement("hx-date-range-picker")
export class HxDateRangePicker extends HxPickerElement {
    @property({ attribute: "start-name", reflect: true }) startName = "";
    @property({ attribute: "end-name", reflect: true }) endName = "";
    @property() start = "";
    @property() end = "";

    protected get displayText() {
        const start = parseDate(this.start);
        const end = parseDate(this.end);
        return start && end ? this.formatter.formatRange(start, end) : "";
    }

    private onCalendarChange(event: Event) {
        event.stopPropagation();
        const calendar = event.target as HxRangeCalendar;
        this.start = calendar.start;
        this.end = calendar.end;
        this.commit();
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        const data = new FormData();
        if (this.startName) data.append(this.startName, this.start);
        if (this.endName) data.append(this.endName, this.end);
        this.internals.setFormValue(data);
    }

    formResetCallback() {
        this.start = this.getAttribute("start") ?? "";
        this.end = this.getAttribute("end") ?? "";
    }

    protected renderCalendar() {
        return html`<hx-range-calendar
            id="calendar"
            part="calendar"
            .start=${this.start}
            .end=${this.end}
            min=${this.min}
            max=${this.max}
            locale=${this.resolvedLocale}
            ?month-select=${this.monthSelect}
            ?year-select=${this.yearSelect}
            @change=${this.onCalendarChange}
        ></hx-range-calendar>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-date-range-picker": HxDateRangePicker;
    }
}
