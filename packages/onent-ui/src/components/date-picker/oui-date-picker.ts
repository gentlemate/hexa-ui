import type { Placement } from "@floating-ui/dom";
import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { parseDate } from "../../date.js";
import { OuiDatePickerElement, type OuiDateStyle } from "../../oui-date-picker-element.js";
import "../calendar/oui-calendar.js";
import type { OuiCalendar } from "../calendar/oui-calendar.js";

export type OuiDatePickerPlacement = Placement;
export type OuiDatePickerDateStyle = OuiDateStyle;

/**
 * @element oui-date-picker
 * @property name - Name submitted with the form.
 * @property value - Selected date, as `YYYY-MM-DD`.
 * @fires input - The user selected another date.
 * @fires change - The user selected another date.
 * @fires oui-show - The calendar is about to open. Cancelable.
 * @fires oui-after-show - The calendar is open and its enter animation finished.
 * @fires oui-hide - The calendar is about to close. Cancelable.
 * @fires oui-after-hide - The calendar is closed and its exit animation finished.
 * @cssprop [--oui-height-date-picker=var(--oui-height-field)] - Height of the trigger.
 * @cssprop [--oui-spacing-date-picker=var(--oui-spacing-field)] - Horizontal padding of the trigger.
 * @cssprop [--oui-radius-date-picker=var(--oui-radius-field)] - Border radius of the trigger.
 * @cssprop [--oui-spacing-calendar=var(--oui-spacing-popup)] - Padding around the calendar.
 * @cssprop [--oui-size-calendar-day=2.25rem] - Width and height of the day cells, and height of the month and year selects.
 * @csspart trigger - The button showing the selected date.
 * @csspart value - The selected date, or the placeholder.
 * @csspart icon - The calendar icon of the trigger.
 * @csspart popup - The panel holding the calendar.
 * @csspart calendar - The `oui-calendar`.
 */
@customElement("oui-date-picker")
export class OuiDatePicker extends OuiDatePickerElement {
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
        this.value = (event.target as OuiCalendar).value;
        this.commit();
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        this.internals.setFormValue(this.value);
        if (this.required && !this.value)
            this.internals.setValidity({ valueMissing: true }, "Please select a date.", this.focusTarget);
        else this.internals.setValidity({});
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
    }

    protected renderCalendar() {
        return html`<oui-calendar
            id="calendar"
            part="calendar"
            .value=${this.value}
            min=${this.min}
            max=${this.max}
            locale=${this.resolvedLocale}
            ?month-select=${this.monthSelect}
            ?year-select=${this.yearSelect}
            @change=${this.onCalendarChange}
        ></oui-calendar>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-date-picker": OuiDatePicker;
    }
}
