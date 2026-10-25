import type { Placement } from "@floating-ui/dom";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { keyed } from "lit/directives/keyed.js";
import { Calendar } from "lucide";
import "./components/icon/hx-icon.js";
import { FloatingController } from "./controllers/floating-controller.js";
import { hasFocus } from "./focus-target.js";
import { localeOf } from "./date.js";
import type { HxCalendarElement } from "./hx-calendar-element.js";
import { HxElement } from "./hx-element.js";
import { HxOverlayElement } from "./hx-overlay-element.js";

export type HxDateStyle = "full" | "long" | "medium" | "short";

/**
 * @property label - Label displayed above the field.
 * @property placeholder - Text shown when no date is selected.
 * @property hint - Help text under the field, replaced by `error` when set.
 * @property error - Error message under the field; also marks the field as invalid.
 * @property min - Earliest selectable date, as `YYYY-MM-DD`.
 * @property max - Latest selectable date, as `YYYY-MM-DD`.
 * @property locale - Language of the displayed date and of the calendar; defaults to the closest `lang` attribute.
 * @property dateStyle - Format of the displayed date.
 * @property monthSelect - Shows the month of the calendar as a select.
 * @property yearSelect - Shows the year of the calendar as a select.
 * @property placement - Position of the calendar relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the calendar.
 * @property disabled - Prevents user interaction.
 * @property required - Adds an asterisk to the label and marks the field as required for assistive technologies.
 * @property focusTarget - The inner element that receives the focus (read-only).
 */
export abstract class HxPickerElement extends HxOverlayElement {
    static formAssociated = true;
    static override shadowRootOptions = { ...HxElement.shadowRootOptions, delegatesFocus: true };
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property() label = "";
    @property() placeholder = "";
    @property() hint = "";
    @property() error = "";
    @property() min = "";
    @property() max = "";
    @property() locale = "";
    @property({ attribute: "date-style" }) dateStyle: HxDateStyle = "medium";
    @property({ type: Boolean, attribute: "month-select" }) monthSelect = false;
    @property({ type: Boolean, attribute: "year-select" }) yearSelect = false;
    @property({ reflect: true }) placement: Placement = "bottom-start";
    @property({ type: Number }) distance = 4;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    @query("#trigger") focusTarget!: HTMLButtonElement;
    @query("#popup") protected overlay!: HTMLElement;
    @query("#calendar") private calendar!: HxCalendarElement;

    protected internals = this.attachInternals();

    private generation = 0;
    private openOnPointerDown = false;

    private floating = new FloatingController(this, () => ({
        anchor: this.focusTarget,
        floating: this.overlay,
        placement: this.placement,
        distance: this.distance,
    }));

    protected abstract get displayText(): string;

    protected abstract renderCalendar(): TemplateResult;

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

    private onTriggerClick(event: MouseEvent) {
        const wasOpen = event.detail > 0 ? this.openOnPointerDown : this.open;
        if (wasOpen) this.hide();
        else this.show();
    }

    private onTriggerKeyDown(event: KeyboardEvent) {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        this.show();
    }

    private onPopupFocusOut(event: FocusEvent) {
        const next = event.relatedTarget as Node | null;
        if (next && !this.overlay.contains(next)) this.hide();
    }

    private onLabelClick(event: MouseEvent) {
        event.preventDefault();
        this.focusTarget.focus();
    }

    private async focusCalendar() {
        await this.calendar.updateComplete;
        this.calendar.focusTarget.focus({ preventScroll: true });
    }

    override show() {
        if (!this.disabled) super.show();
    }

    protected override present() {
        if (!this.overlay.matches(":popover-open")) this.overlay.showPopover({ source: this.focusTarget });
        this.floating.start();
        this.focusCalendar();
    }

    protected override dismiss() {
        super.dismiss();
        this.floating.stop();
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("open") && this.open) this.generation++;
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("disabled") && this.disabled) this.hide();
        if (changed.has("open") && !this.open && changed.get("open") !== undefined && hasFocus(this))
            this.focusTarget.focus();
    }

    override render() {
        const text = this.displayText;
        return html`
            <div class="text-foreground flex flex-col gap-1.5">
                ${
                    this.label
                        ? html`<label id="label" for="trigger" @click=${this.onLabelClick}
                              >${this.label}${
                                  this.required
                                      ? html`<span class="text-destructive ml-0.5" aria-hidden="true">*</span>`
                                      : nothing
                              }</label
                          >`
                        : nothing
                }
                <button
                    id="trigger"
                    part="trigger"
                    type="button"
                    aria-haspopup="dialog"
                    aria-controls="popup"
                    aria-expanded=${this.open ? "true" : "false"}
                    aria-labelledby=${this.label ? "label value" : "value"}
                    aria-required=${this.required ? "true" : "false"}
                    aria-invalid=${this.error ? "true" : "false"}
                    class="border-input bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 rounded-control h-input px-input flex w-full cursor-pointer items-center justify-between gap-2 border text-left shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                    ?disabled=${this.disabled}
                    @pointerdown=${() => (this.openOnPointerDown = this.open)}
                    @click=${this.onTriggerClick}
                    @keydown=${this.onTriggerKeyDown}
                >
                    <span part="value" id="value" class="${text ? "" : "text-muted-foreground"} truncate"
                        >${text || this.placeholder}</span
                    >
                    <hx-icon part="icon" .icon=${Calendar} class="text-muted-foreground"></hx-icon>
                </button>
                ${
                    this.error
                        ? html`<p class="text-destructive text-sm" role="alert">${this.error}</p>`
                        : this.hint
                          ? html`<p class="text-muted-foreground text-sm">${this.hint}</p>`
                          : nothing
                }
            </div>
            <div
                part="popup"
                id="popup"
                popover="auto"
                role="dialog"
                aria-labelledby=${ifDefined(this.label ? "label" : undefined)}
                data-state=${this.open ? "open" : "closed"}
                class="bg-popover text-popover-foreground border-border animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-popover p-popover inset-auto m-0 border shadow-md outline-none"
                @focusout=${this.onPopupFocusOut}
            >
                ${keyed(this.generation, this.renderCalendar())}
            </div>
        `;
    }
}
