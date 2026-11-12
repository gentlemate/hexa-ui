import type { Placement } from "@floating-ui/dom";
import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { parseDate } from "../../date.js";
import { OuiDatePickerElement, type OuiDateStyle } from "../../oui-date-picker-element.js";
import "../range-calendar/oui-range-calendar.js";
import type { OuiRangeCalendar } from "../range-calendar/oui-range-calendar.js";

export type OuiDateRangePickerPlacement = Placement;
export type OuiDateRangePickerDateStyle = OuiDateStyle;

/**
 * @element oui-date-range-picker
 * @property startName - Name of the first date submitted with the form.
 * @property endName - Name of the last date submitted with the form.
 * @property start - First date of the selected range, as `YYYY-MM-DD`.
 * @property end - Last date of the selected range, as `YYYY-MM-DD`.
 * @fires input - The user selected another range.
 * @fires change - The user selected another range.
 * @fires oui-show - The calendar is about to open. Cancelable.
 * @fires oui-after-show - The calendar is open and its enter animation finished.
 * @fires oui-hide - The calendar is about to close. Cancelable.
 * @fires oui-after-hide - The calendar is closed and its exit animation finished.
 * @cssprop [--oui-height-date-range-picker=var(--oui-height-field)] - Height of the trigger.
 * @cssprop [--oui-spacing-date-range-picker=var(--oui-spacing-field)] - Horizontal padding of the trigger.
 * @cssprop [--oui-radius-date-range-picker=var(--oui-radius-field)] - Border radius of the trigger.
 * @cssprop [--oui-spacing-calendar=var(--oui-spacing-popup)] - Padding around the calendar.
 * @cssprop [--oui-size-calendar-day=2.25rem] - Width and height of the day cells, and height of the month and year selects.
 * @csspart trigger - The button showing the selected range.
 * @csspart value - The selected range, or the placeholder.
 * @csspart icon - The calendar icon of the trigger.
 * @csspart popup - The panel holding the calendar.
 * @csspart calendar - The `oui-range-calendar`.
 */
@customElement("oui-date-range-picker")
export class OuiDateRangePicker extends OuiDatePickerElement {
    @property({ attribute: "start-name", reflect: true }) startName = "";
    @property({ attribute: "end-name", reflect: true }) endName = "";
    @property() start = "";
    @property() end = "";

    protected get triggerClass() {
        return "rounded-date-range-picker h-date-range-picker px-date-range-picker";
    }

    protected get displayText() {
        const start = parseDate(this.start);
        const end = parseDate(this.end);
        return start && end ? this.formatter.formatRange(start, end) : "";
    }

    private onCalendarChange(event: Event) {
        event.stopPropagation();
        const calendar = event.target as OuiRangeCalendar;
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
        if (this.required && !(this.start && this.end))
            this.internals.setValidity({ valueMissing: true }, "Please select a date range.", this.focusTarget);
        else this.internals.setValidity({});
    }

    formResetCallback() {
        this.start = this.getAttribute("start") ?? "";
        this.end = this.getAttribute("end") ?? "";
    }

    protected renderCalendar() {
        return html`<oui-range-calendar
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
        ></oui-range-calendar>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-date-range-picker": OuiDateRangePicker;
    }
}
