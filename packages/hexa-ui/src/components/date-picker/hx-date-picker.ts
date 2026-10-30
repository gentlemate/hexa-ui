import type { Placement } from "@floating-ui/dom";
import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { parseDate } from "../../date.js";
import { HxPickerElement, type HxDateStyle } from "../../hx-picker-element.js";
import "../calendar/hx-calendar.js";
import type { HxCalendar } from "../calendar/hx-calendar.js";

export type HxDatePickerPlacement = Placement;
export type HxDatePickerDateStyle = HxDateStyle;

/**
 * @element hx-date-picker
 * @property name - Name submitted with the form.
 * @property value - Selected date, as `YYYY-MM-DD`.
 * @fires input - The user selected another date.
 * @fires change - The user selected another date.
 * @fires hx-show - The calendar is about to open. Cancelable.
 * @fires hx-after-show - The calendar is open and its enter animation finished.
 * @fires hx-hide - The calendar is about to close. Cancelable.
 * @fires hx-after-hide - The calendar is closed and its exit animation finished.
 * @cssprop [--hx-height-date-picker=var(--hx-height-field)] - Height of the trigger.
 * @cssprop [--hx-spacing-date-picker=var(--hx-spacing-field)] - Horizontal padding of the trigger.
 * @cssprop [--hx-radius-date-picker=var(--hx-radius-field)] - Border radius of the trigger.
 * @cssprop [--hx-spacing-calendar=var(--hx-spacing-popup)] - Padding around the calendar.
 * @cssprop [--hx-size-calendar-day=2.25rem] - Width and height of the day cells, and height of the month and year selects.
 * @csspart trigger - The button showing the selected date.
 * @csspart value - The selected date, or the placeholder.
 * @csspart icon - The calendar icon of the trigger.
 * @csspart popup - The panel holding the calendar.
 * @csspart calendar - The `hx-calendar`.
 */
@customElement("hx-date-picker")
export class HxDatePicker extends HxPickerElement {
    @property({ reflect: true }) name = "";
    @property() value = "";

    protected get triggerClass() {
        return "rounded-date-picker h-date-picker px-date-picker";
    }

    protected get displayText() {
        const date = parseDate(this.value);
        return date ? this.formatter.format(date) : "";
    }

    private onCalendarChange(event: Event) {
        event.stopPropagation();
        this.value = (event.target as HxCalendar).value;
        this.commit();
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        this.internals.setFormValue(this.value);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    protected renderCalendar() {
        return html`<hx-calendar
            id="calendar"
            part="calendar"
            .value=${this.value}
            min=${this.min}
            max=${this.max}
            locale=${this.resolvedLocale}
            ?month-select=${this.monthSelect}
            ?year-select=${this.yearSelect}
            @change=${this.onCalendarChange}
        ></hx-calendar>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-date-picker": HxDatePicker;
    }
}
