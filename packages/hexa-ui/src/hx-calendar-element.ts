import { css, html, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ChevronLeft, ChevronRight } from "lucide";
import "./components/icon/hx-icon.js";
import type { HxSelect } from "./components/select/hx-select.js";
import "./components/select/hx-select.js";
import {
    addDays,
    addMonths,
    clampDate,
    createDate,
    firstDayOfWeek,
    isSameDay,
    isSameMonth,
    localeOf,
    parseDate,
    startOfMonth,
    startOfWeek,
    today,
} from "./date.js";
import { focusTargetOf, hasFocus } from "./focus-target.js";
import { HxElement } from "./hx-element.js";

export interface HxCalendarDay {
    selected: boolean;
    range?: "start" | "middle" | "end";
}

const yearSpan = 100;

const control =
    "inline-flex size-calendar-day cursor-pointer items-center justify-center rounded-control outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";

const shapes = { start: "rounded-r-none", middle: "rounded-none", end: "rounded-l-none" };

const stop = (event: Event) => event.stopPropagation();

/**
 * @property min - Earliest selectable date, as `YYYY-MM-DD`.
 * @property max - Latest selectable date, as `YYYY-MM-DD`.
 * @property locale - Language of the month and weekday names; defaults to the closest `lang` attribute.
 * @property monthSelect - Shows the month as a select.
 * @property yearSelect - Shows the year as a select, from `min` to `max` (100 years around today by default).
 * @property focusTarget - The day of the grid that receives the focus (read-only).
 */
export abstract class HxCalendarElement extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: inline-block;
            }
            hx-select::part(trigger) {
                height: var(--hx-size-calendar-day);
                padding-inline: 0.375rem;
                gap: 0.25rem;
            }
        `,
    ];

    @property() min = "";
    @property() max = "";
    @property() locale = "";
    @property({ type: Boolean, reflect: true, attribute: "month-select" }) monthSelect = false;
    @property({ type: Boolean, reflect: true, attribute: "year-select" }) yearSelect = false;

    @query('[part="day"][tabindex="0"]') focusTarget!: HTMLButtonElement;

    @state() protected focusedDate = today();

    protected abstract dayOf(date: Date): HxCalendarDay;

    protected abstract select(date: Date): void;

    protected hover(_date?: Date) {}

    protected get minDate() {
        return parseDate(this.min);
    }

    protected get maxDate() {
        return parseDate(this.max);
    }

    private get resolvedLocale() {
        return localeOf(this, this.locale);
    }

    private isDisabled(date: Date) {
        const min = this.minDate;
        const max = this.maxDate;
        return (!!min && date < min) || (!!max && date > max);
    }

    protected async focusDate(date: Date) {
        this.focusedDate = clampDate(date, this.minDate, this.maxDate);
        await this.updateComplete;
        if (hasFocus(this)) this.focusTarget.focus();
    }

    protected emitChange() {
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private showMonth(months: number) {
        this.focusedDate = clampDate(addMonths(this.focusedDate, months), this.minDate, this.maxDate);
    }

    private onGridKeyDown(event: KeyboardEvent) {
        const date = this.focusedDate;
        const week = startOfWeek(date, firstDayOfWeek(this.resolvedLocale));
        const months = event.shiftKey ? 12 : 1;
        const next: Date | undefined = {
            ArrowLeft: addDays(date, -1),
            ArrowRight: addDays(date, 1),
            ArrowUp: addDays(date, -7),
            ArrowDown: addDays(date, 7),
            Home: week,
            End: addDays(week, 6),
            PageUp: addMonths(date, -months),
            PageDown: addMonths(date, months),
        }[event.key];
        if (!next) return;
        event.preventDefault();
        this.hover(undefined);
        this.focusDate(next);
    }

    private onMonthChange(event: Event) {
        event.stopPropagation();
        this.showMonth(Number((event.target as HxSelect).value) - this.focusedDate.getMonth());
    }

    private onYearChange(event: Event) {
        event.stopPropagation();
        this.showMonth((Number((event.target as HxSelect).value) - this.focusedDate.getFullYear()) * 12);
    }

    protected override willUpdate(_changed: PropertyValues<this>) {
        this.focusedDate = clampDate(this.focusedDate, this.minDate, this.maxDate);
    }

    protected override updated() {
        for (const [part, label] of [
            ["month-select", "Month"],
            ["year-select", "Year"],
        ]) {
            const select = this.renderRoot.querySelector<HxSelect>(`[part="${part}"]`);
            if (select) focusTargetOf(select).then((target) => (target.ariaLabel = label));
        }
    }

    private renderDay(date: Date, month: Date, label: Intl.DateTimeFormat) {
        const { selected, range } = this.dayOf(date);
        const isToday = isSameDay(date, today());
        const colors = selected
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : range === "middle"
              ? "bg-accent text-accent-foreground"
              : `${isToday ? "bg-accent text-accent-foreground" : isSameMonth(date, month) ? "text-foreground" : "text-muted-foreground"} hover:bg-accent hover:text-accent-foreground`;
        return html`<td class="p-0" aria-selected=${ifDefined(selected || range ? "true" : undefined)}>
            <button
                part="day"
                type="button"
                tabindex=${isSameDay(date, this.focusedDate) ? 0 : -1}
                class="${control} ${colors} ${range ? shapes[range] : ""} text-sm"
                aria-label=${label.format(date)}
                aria-current=${ifDefined(isToday ? "date" : undefined)}
                ?disabled=${this.isDisabled(date)}
                @click=${() => this.select(date)}
                @pointerenter=${() => this.hover(date)}
            >
                ${date.getDate()}
            </button>
        </td>`;
    }

    private renderMonthSelect(month: Date, locale: string) {
        const name = new Intl.DateTimeFormat(locale, { month: "long" });
        const min = this.minDate;
        const max = this.maxDate;
        return html`<hx-select
            part="month-select"
            class="min-w-0 text-sm"
            .value=${String(month.getMonth())}
            @input=${stop}
            @change=${this.onMonthChange}
            @hx-show=${stop}
            @hx-after-show=${stop}
            @hx-hide=${stop}
            @hx-after-hide=${stop}
        >
            ${Array.from({ length: 12 }, (_, index) => {
                const start = createDate(month.getFullYear(), index, 1);
                const end = createDate(month.getFullYear(), index + 1, 0);
                return html`<hx-select-option
                    class="text-sm"
                    value=${index}
                    ?disabled=${(!!min && end < min) || (!!max && start > max)}
                    >${name.format(start)}</hx-select-option
                >`;
            })}
        </hx-select>`;
    }

    private renderYearSelect(month: Date) {
        const year = month.getFullYear();
        const current = today().getFullYear();
        const first = this.minDate?.getFullYear() ?? Math.min(current - yearSpan, year);
        const last = this.maxDate?.getFullYear() ?? Math.max(current + yearSpan, year);
        return html`<hx-select
            part="year-select"
            class="min-w-0 text-sm"
            .value=${String(year)}
            @input=${stop}
            @change=${this.onYearChange}
            @hx-show=${stop}
            @hx-after-show=${stop}
            @hx-hide=${stop}
            @hx-after-hide=${stop}
        >
            ${Array.from(
                { length: last - first + 1 },
                (_, index) =>
                    html`<hx-select-option class="text-sm" value=${first + index}>${first + index}</hx-select-option>`,
            )}
        </hx-select>`;
    }

    private renderHeading(month: Date, locale: string) {
        const format = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
        const selects = this.monthSelect || this.yearSelect;
        const heading = html`<span
            part="heading"
            id="heading"
            class=${selects ? "sr-only" : "text-sm font-medium"}
            aria-live="polite"
            >${format.format(month)}</span
        >`;
        if (!selects) return heading;
        return html`${heading}
            <div class="flex min-w-0 items-center gap-1 text-sm font-medium">
                ${format
                    .formatToParts(month)
                    .map((part) =>
                        part.type === "month" && this.monthSelect
                            ? this.renderMonthSelect(month, locale)
                            : part.type === "year" && this.yearSelect
                              ? this.renderYearSelect(month)
                              : html`<span aria-hidden="true">${part.value}</span>`,
                    )}
            </div>`;
    }

    override render() {
        const locale = this.resolvedLocale;
        const month = startOfMonth(this.focusedDate);
        const first = startOfWeek(month, firstDayOfWeek(locale));
        const weeks = Array.from({ length: 6 }, (_, week) =>
            Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)),
        );
        const min = this.minDate;
        const max = this.maxDate;
        const label = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
        const shortWeekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
        const longWeekday = new Intl.DateTimeFormat(locale, { weekday: "long" });

        return html`<div class="text-foreground">
            <div part="header" class="mb-2 flex items-center justify-between gap-1">
                <button
                    part="previous"
                    type="button"
                    class="${control} hover:bg-accent hover:text-accent-foreground"
                    aria-label="Previous month"
                    ?disabled=${!!min && min >= month}
                    @click=${() => this.showMonth(-1)}
                >
                    <hx-icon .icon=${ChevronLeft}></hx-icon>
                </button>
                ${this.renderHeading(month, locale)}
                <button
                    part="next"
                    type="button"
                    class="${control} hover:bg-accent hover:text-accent-foreground"
                    aria-label="Next month"
                    ?disabled=${!!max && max < addMonths(month, 1)}
                    @click=${() => this.showMonth(1)}
                >
                    <hx-icon .icon=${ChevronRight}></hx-icon>
                </button>
            </div>
            <table
                part="grid"
                role="grid"
                aria-labelledby="heading"
                class="border-collapse"
                @keydown=${this.onGridKeyDown}
                @pointerleave=${() => this.hover(undefined)}
            >
                <thead>
                    <tr>
                        ${weeks[0].map(
                            (date) =>
                                html`<th
                                    part="weekday"
                                    scope="col"
                                    abbr=${longWeekday.format(date)}
                                    class="text-muted-foreground size-calendar-day p-0 text-sm font-normal"
                                >
                                    ${shortWeekday.format(date)}
                                </th>`,
                        )}
                    </tr>
                </thead>
                <tbody>
                    ${weeks.map(
                        (week) =>
                            html`<tr>
                                ${week.map((date) => this.renderDay(date, month, label))}
                            </tr>`,
                    )}
                </tbody>
            </table>
        </div>`;
    }
}
