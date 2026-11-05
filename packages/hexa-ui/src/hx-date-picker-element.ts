import { html, type PropertyValues, type TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { Calendar } from "lucide";
import "./components/icon/hx-icon.js";
import { localeOf } from "./date.js";
import type { HxCalendarElement } from "./hx-calendar-element.js";
import { HxPickerElement } from "./hx-picker-element.js";

export type HxDateStyle = "full" | "long" | "medium" | "short";

/**
 * @property min - Earliest selectable date, as `YYYY-MM-DD`.
 * @property max - Latest selectable date, as `YYYY-MM-DD`.
 * @property locale - Language of the displayed date and of the calendar; defaults to the closest `lang` attribute.
 * @property dateStyle - Format of the displayed date.
 * @property monthSelect - Shows the month of the calendar as a select.
 * @property yearSelect - Shows the year of the calendar as a select.
 * @property placement - Position of the calendar relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the calendar.
 */
export abstract class HxDatePickerElement extends HxPickerElement {
    @property() min = "";
    @property() max = "";
    @property() locale = "";
    @property({ attribute: "date-style" }) dateStyle: HxDateStyle = "medium";
    @property({ type: Boolean, attribute: "month-select" }) monthSelect = false;
    @property({ type: Boolean, attribute: "year-select" }) yearSelect = false;

    @query("#calendar") private calendar!: HxCalendarElement;

    private generation = 0;

    protected abstract renderCalendar(): TemplateResult;

    protected get popupClass() {
        return "p-calendar";
    }

    protected get resolvedLocale() {
        return localeOf(this, this.locale);
    }

    protected get formatter() {
        return new Intl.DateTimeFormat(this.resolvedLocale, { dateStyle: this.dateStyle });
    }

    protected commit() {
        this.hide();
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    protected async focusPopup() {
        await this.calendar.updateComplete;
        this.calendar.focusTarget.focus({ preventScroll: true });
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("open") && this.open) this.generation++;
    }

    protected renderTrigger() {
        return html`${this.renderValue()}<hx-icon
                part="icon"
                .icon=${Calendar}
                class="text-muted-foreground"
            ></hx-icon>`;
    }

    protected renderPopup(): unknown {
        return keyed(this.generation, this.renderCalendar());
    }
}
