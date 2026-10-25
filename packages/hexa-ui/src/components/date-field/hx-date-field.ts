import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createDate, daysInMonth, formatDate, localeOf, parseDate, today } from "../../date.js";
import { HxElement } from "../../hx-element.js";

type SegmentType = "day" | "month" | "year";
type Segments = Partial<Record<SegmentType, number>>;

const segmentTypes: SegmentType[] = ["day", "month", "year"];

const segmentInfo: Record<SegmentType, { label: string; digits: number }> = {
    day: { label: "Day", digits: 2 },
    month: { label: "Month", digits: 2 },
    year: { label: "Year", digits: 4 },
};

const leapYear = 2000;

function fieldNamesOf(locale: string) {
    try {
        return new Intl.DisplayNames(locale, { type: "dateTimeField" });
    } catch {
        return undefined;
    }
}

function placeholderOf(type: SegmentType, locale: string, names?: Intl.DisplayNames) {
    const letter = names?.of(type)?.normalize("NFD").replace(/\p{M}/gu, "")[0]?.toLocaleLowerCase(locale);
    const cased = !!letter && letter !== letter.toLocaleUpperCase(locale);
    return (cased ? letter : "–").repeat(segmentInfo[type].digits);
}

function segmentsOf(date?: Date): Segments {
    return date ? { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() } : {};
}

function valueOf({ day, month, year }: Segments) {
    return day && month && year ? formatDate(createDate(year, month - 1, day)) : "";
}

/**
 * @element hx-date-field
 * @property name - Name submitted with the form.
 * @property value - Current date, as `YYYY-MM-DD`; empty while the date is incomplete.
 * @property label - Label displayed above the field.
 * @property hint - Help text under the field, replaced by `error` when set.
 * @property error - Error message under the field; also marks the field as invalid.
 * @property locale - Order, separators and placeholders of the segments; defaults to the closest `lang` attribute.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @property focusTarget - The group of segments, which holds the focus (read-only).
 * @property incomplete - Whether some segments are filled but not all, while `value` is empty.
 * @fires input - The value changed.
 * @fires change - The value changed.
 * @csspart control - The group of segments.
 * @csspart segment - A day, month or year segment.
 * @csspart separator - The text between two segments.
 */
@customElement("hx-date-field")
export class HxDateField extends HxElement {
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

    @property({ reflect: true }) name = "";
    @property() value = "";
    @property() label = "";
    @property() hint = "";
    @property() error = "";
    @property() locale = "";
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    @query("#control") focusTarget!: HTMLElement;

    @state() private segments: Segments = {};
    @state() private active?: SegmentType;
    @state() private buffer?: string;

    private internals = this.attachInternals();

    get incomplete(): boolean {
        const filled = segmentTypes.filter((type) => this.segments[type] !== undefined).length;
        return filled > 0 && filled < segmentTypes.length;
    }

    private activate(type: SegmentType | undefined) {
        this.commit();
        this.active = type;
    }

    private commit() {
        if (this.active && this.buffer !== undefined) this.setSegment(this.active, Number(this.buffer) || undefined);
        this.buffer = undefined;
    }

    private get segmentElements() {
        return [...this.renderRoot.querySelectorAll<HTMLElement>("[data-segment]")];
    }

    private range(type: SegmentType): [number, number] {
        const { month, year } = this.segments;
        if (type === "day") return [1, month ? daysInMonth(year ?? leapYear, month - 1) : 31];
        return type === "month" ? [1, 12] : [1, 9999];
    }

    private setSegment(type: SegmentType, value: number | undefined) {
        const segments = { ...this.segments, [type]: value };
        const { day, month, year } = segments;
        if (day && month && year) segments.day = Math.min(day, daysInMonth(year, month - 1));
        this.segments = segments;

        const next = valueOf(segments);
        if (next === this.value) return;
        this.value = next;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    private focusSegment(type: SegmentType, direction: number) {
        const elements = this.segmentElements;
        const index = elements.findIndex((element) => element.dataset.segment === type);
        elements[index + direction]?.focus();
    }

    private enter(type: SegmentType, digit: string) {
        const [, max] = this.range(type);
        const typed = (this.buffer ?? "") + digit;
        this.buffer = Number(typed) > max ? digit : typed;
        if (this.buffer.length < segmentInfo[type].digits && Number(this.buffer) * 10 <= max) return;
        this.commit();
        this.focusSegment(type, 1);
    }

    private erase(type: SegmentType) {
        const value = this.segments[type];
        const text = this.buffer ?? (value === undefined ? "" : String(value));
        if (!text) return this.focusSegment(type, -1);
        this.buffer = text.slice(0, -1);
    }

    private step(type: SegmentType, delta: number) {
        this.commit();
        const [min, max] = this.range(type);
        const value = this.segments[type];
        if (value === undefined) return this.setSegment(type, Math.min(segmentsOf(today())[type]!, max));
        const next = value + delta;
        this.setSegment(type, next > max ? min : next < min ? max : next);
    }

    private onKeyDown(event: KeyboardEvent, type: SegmentType) {
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
                this.step(type, event.key === "ArrowUp" ? 1 : -1);
                break;
            case "ArrowLeft":
            case "ArrowRight":
                this.focusSegment(type, event.key === "ArrowRight" ? 1 : -1);
                break;
            case "Backspace":
                this.erase(type);
                break;
            case "Delete":
                this.buffer = undefined;
                this.setSegment(type, undefined);
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    private onBeforeInput(event: InputEvent, type: SegmentType) {
        event.preventDefault();
        if (event.inputType === "deleteContentBackward") this.erase(type);
        else if (event.inputType === "insertText" && /^\d$/.test(event.data ?? "")) this.enter(type, event.data!);
    }

    private onControlMouseDown(event: MouseEvent) {
        if (this.disabled || (event.target as HTMLElement).dataset.segment) return;
        event.preventDefault();
        this.focusFirstSegment();
    }

    private onLabelClick(event: MouseEvent) {
        event.preventDefault();
        this.focusFirstSegment();
    }

    private focusFirstSegment() {
        const elements = this.segmentElements;
        (
            elements.find((element) => this.segments[element.dataset.segment as SegmentType] === undefined) ??
            elements[0]
        )?.focus();
    }

    protected override willUpdate(changed: PropertyValues<this>) {
        if (changed.has("value") && this.value !== valueOf(this.segments))
            this.segments = segmentsOf(parseDate(this.value));
    }

    protected override updated() {
        this.internals.setFormValue(this.value);
    }

    formResetCallback() {
        this.value = this.getAttribute("value") ?? "";
        this.segments = segmentsOf(parseDate(this.value));
        this.buffer = undefined;
    }

    private renderSegment(type: SegmentType, placeholder: string) {
        const value = this.segments[type];
        const [min, max] = this.range(type);
        const { label, digits } = segmentInfo[type];
        const padded = value === undefined ? undefined : String(value).padStart(digits === 2 ? 2 : 0, "0");
        const pending = this.active === type ? this.buffer : undefined;
        const text = pending === undefined ? (padded ?? placeholder) : pending || placeholder;
        const empty = pending === undefined ? value === undefined : !pending;
        return html`<span
            part="segment"
            data-segment=${type}
            role="spinbutton"
            contenteditable=${this.disabled ? "false" : "true"}
            inputmode="numeric"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            tabindex=${this.disabled ? -1 : 0}
            aria-label=${label}
            aria-valuemin=${min}
            aria-valuemax=${max}
            aria-valuenow=${ifDefined(value)}
            aria-valuetext=${padded ?? "Empty"}
            aria-required=${this.required ? "true" : "false"}
            aria-invalid=${this.error ? "true" : "false"}
            aria-disabled=${this.disabled ? "true" : "false"}
            class="${empty ? "text-muted-foreground" : ""} rounded-control-sm focus:bg-accent focus:text-accent-foreground px-0.5 tabular-nums caret-transparent outline-none"
            @focus=${() => this.activate(type)}
            @blur=${() => this.activate(undefined)}
            @keydown=${(event: KeyboardEvent) => this.onKeyDown(event, type)}
            @beforeinput=${(event: InputEvent) => this.onBeforeInput(event, type)}
            >${text}</span
        >`;
    }

    override render() {
        const locale = localeOf(this, this.locale);
        const names = fieldNamesOf(locale);
        const parts = new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            calendar: "gregory",
        }).formatToParts(today());
        const empty = segmentTypes.every((type) => this.segments[type] === undefined);
        return html`
            <div class="text-foreground flex flex-col gap-1.5">
                ${
                    this.label
                        ? html`<label id="label" @click=${this.onLabelClick}
                              >${this.label}${
                                  this.required
                                      ? html`<span class="text-destructive ml-0.5" aria-hidden="true">*</span>`
                                      : nothing
                              }</label
                          >`
                        : nothing
                }
                <div
                    id="control"
                    part="control"
                    role="group"
                    aria-labelledby=${ifDefined(this.label ? "label" : undefined)}
                    ?data-invalid=${!!this.error}
                    ?data-disabled=${this.disabled}
                    class="border-input bg-input focus-within:border-ring focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-destructive/20 rounded-control h-input px-input flex w-full cursor-text items-center border shadow-xs focus-within:ring-[3px] data-disabled:cursor-not-allowed data-disabled:opacity-50"
                    @mousedown=${this.onControlMouseDown}
                >
                    ${parts.map((part) =>
                        segmentTypes.includes(part.type as SegmentType)
                            ? this.renderSegment(
                                  part.type as SegmentType,
                                  placeholderOf(part.type as SegmentType, locale, names),
                              )
                            : part.type === "literal"
                              ? html`<span
                                    part="separator"
                                    aria-hidden="true"
                                    class=${empty ? "text-muted-foreground" : ""}
                                    >${part.value}</span
                                >`
                              : nothing,
                    )}
                </div>
                ${
                    this.error
                        ? html`<p class="text-destructive text-sm" role="alert">${this.error}</p>`
                        : this.hint
                          ? html`<p class="text-muted-foreground text-sm">${this.hint}</p>`
                          : nothing
                }
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-date-field": HxDateField;
    }
}
