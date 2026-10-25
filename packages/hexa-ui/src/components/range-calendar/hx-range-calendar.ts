import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatDate, isSameDay, parseDate } from "../../date.js";
import { HxCalendarElement, type HxCalendarDay } from "../../hx-calendar-element.js";

/**
 * @element hx-range-calendar
 * @property start - First date of the selected range, as `YYYY-MM-DD`.
 * @property end - Last date of the selected range, as `YYYY-MM-DD`.
 * @fires change - The user selected another range (once both ends are picked).
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
@customElement("hx-range-calendar")
export class HxRangeCalendar extends HxCalendarElement {
    @property() start = "";
    @property() end = "";

    @state() private anchor?: Date;
    @state() private hovered?: Date;

    constructor() {
        super();
        this.addEventListener("keydown", (event) => {
            if (event.key !== "Escape" || !this.anchor) return;
            event.preventDefault();
            event.stopPropagation();
            this.anchor = undefined;
        });
    }

    private get bounds(): [Date?, Date?] {
        if (!this.anchor) return [parseDate(this.start), parseDate(this.end)];
        const other = this.hovered ?? this.focusedDate;
        return this.anchor <= other ? [this.anchor, other] : [other, this.anchor];
    }

    protected dayOf(date: Date): HxCalendarDay {
        const [from, to] = this.bounds;
        const selected = isSameDay(date, from) || isSameDay(date, to);
        if (!from || !to || isSameDay(from, to)) return { selected };
        if (isSameDay(date, from)) return { selected, range: "start" };
        if (isSameDay(date, to)) return { selected, range: "end" };
        return { selected, range: date > from && date < to ? "middle" : undefined };
    }

    protected override hover(date?: Date) {
        this.hovered = date;
    }

    protected select(date: Date) {
        this.focusDate(date);
        if (!this.anchor) {
            this.anchor = date;
            return;
        }
        const [from, to] = this.anchor <= date ? [this.anchor, date] : [date, this.anchor];
        this.anchor = undefined;
        if (formatDate(from) === this.start && formatDate(to) === this.end) return;
        this.start = formatDate(from);
        this.end = formatDate(to);
        this.emitChange();
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("start") || changed.has("end")) {
            this.anchor = undefined;
            this.focusedDate = parseDate(this.start) ?? this.focusedDate;
        }
        super.willUpdate(changed);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-range-calendar": HxRangeCalendar;
    }
}
