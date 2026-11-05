import type { Placement } from "@floating-ui/dom";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { FloatingController } from "./controllers/floating-controller.js";
import { hasFocus } from "./focus-target.js";
import { HxElement } from "./hx-element.js";
import { HxOverlayElement } from "./hx-overlay-element.js";

/**
 * @property label - Label displayed above the field.
 * @property placeholder - Text shown when nothing is selected.
 * @property hint - Help text under the field, replaced by `error` when set.
 * @property error - Error message under the field; also marks the field as invalid.
 * @property placement - Position of the popup relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the popup.
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
    @property({ reflect: true }) placement: Placement = "bottom-start";
    @property({ type: Number }) distance = 4;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;

    @query("#trigger") focusTarget!: HTMLButtonElement;
    @query("#popup") protected overlay!: HTMLElement;

    protected internals = this.attachInternals();

    private openOnPointerDown = false;

    private floating = new FloatingController(this, () => ({
        anchor: this.focusTarget,
        floating: this.overlay,
        placement: this.placement,
        distance: this.distance,
    }));

    protected abstract get triggerClass(): string;

    protected abstract get popupClass(): string;

    protected abstract get displayText(): string;

    protected abstract renderTrigger(): TemplateResult;

    protected abstract renderPopup(): unknown;

    protected abstract focusPopup(): void;

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

    override show() {
        if (!this.disabled) super.show();
    }

    protected override present() {
        if (!this.overlay.matches(":popover-open")) this.overlay.showPopover({ source: this.focusTarget });
        this.floating.start();
        this.focusPopup();
    }

    protected override dismiss() {
        super.dismiss();
        this.floating.stop();
    }

    protected override updated(changed: PropertyValues<this>) {
        super.updated(changed);
        if (changed.has("disabled") && this.disabled) this.hide();
        if (changed.has("open") && !this.open && changed.get("open") !== undefined && hasFocus(this))
            this.focusTarget.focus();
    }

    protected renderValue() {
        const text = this.displayText;
        return html`<span part="value" id="value" class="${text ? "" : "text-muted-foreground"} grow truncate"
            >${text || this.placeholder}</span
        >`;
    }

    override render() {
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
                    class="border-border bg-field focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 ${this.triggerClass} flex w-full cursor-pointer items-center gap-2 border text-left shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                    ?disabled=${this.disabled}
                    @pointerdown=${() => (this.openOnPointerDown = this.open)}
                    @click=${this.onTriggerClick}
                    @keydown=${this.onTriggerKeyDown}
                >
                    ${this.renderTrigger()}
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
                class="bg-surface text-surface-foreground border-border animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-popup ${this.popupClass} inset-auto m-0 border shadow-md outline-none"
                @focusout=${this.onPopupFocusOut}
            >
                ${this.renderPopup()}
            </div>
        `;
    }
}
