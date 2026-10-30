import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatDate, isSameDay, parseDate } from "../../date.js";
import { HxCalendarElement } from "../../hx-calendar-element.js";

/**
 * @element hx-calendar
 * @property value - Selected date, as `YYYY-MM-DD`.
 * @fires change - The user selected another date.
 * @cssprop [--hx-size-calendar-day=2.25rem] - Width and height of the day cells, and height of the month and year selects.
 * @csspart header - The month heading and the navigation buttons.
 * @csspart heading - The displayed month and year (visually hidden with `month-select` or `year-select`).
 * @csspart month-select - The `hx-select` of the month.
 * @csspart year-select - The `hx-select` of the year.
 * @csspart previous - The previous month button.
 * @csspart next - The next month button.
 * @csspart grid - The table of days.
 * @csspart weekday - A weekday column header.
 * @csspart day - A day button.
 */
@customElement("hx-calendar")
export class HxCalendar extends HxCalendarElement {
    @property() value = "";

    protected dayOf(date: Date) {
        return { selected: isSameDay(date, parseDate(this.value)) };
    }

    protected select(date: Date) {
        this.focusDate(date);
        const value = formatDate(date);
        if (value === this.value) return;
        this.value = value;
        this.emitChange();
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("value")) this.focusedDate = parseDate(this.value) ?? this.focusedDate;
        super.willUpdate(changed);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-calendar": HxCalendar;
    }
}
