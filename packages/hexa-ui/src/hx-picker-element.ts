import type { Placement } from "@floating-ui/dom";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { FloatingController } from "./controllers/floating-controller.js";
import { hasFocus } from "./focus-target.js";
import { HxElement } from "./hx-element.js";
import { HxOverlayElement } from "./hx-overlay-element.js";

/**
 * @property placeholder - Text shown when nothing is selected.
 * @property placement - Position of the popup relative to the trigger.
 * @property distance - Gap in pixels between the trigger and the popup.
 * @property disabled - Prevents user interaction.
 * @property required - Marks the field as required for form validation.
 * @property invalid - Marks the field as invalid without displaying a message.
 * @property ariaLabel - Accessible name of the field, set with the `aria-label` attribute.
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

    @property() placeholder = "";
    @property({ reflect: true }) placement: Placement = "bottom-start";
    @property({ type: Number }) distance = 4;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, reflect: true }) invalid = false;
    @property({ attribute: "aria-label" }) override ariaLabel: string | null = null;

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
            ${this.ariaLabel ? html`<span id="name" hidden>${this.ariaLabel}</span>` : nothing}
            <button
                id="trigger"
                part="trigger"
                type="button"
                aria-haspopup="dialog"
                aria-controls="popup"
                aria-expanded=${this.open ? "true" : "false"}
                aria-labelledby=${this.ariaLabel ? "name value" : "value"}
                aria-required=${this.required ? "true" : "false"}
                aria-invalid=${this.invalid ? "true" : "false"}
                class="text-foreground border-border bg-field focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 ${this.triggerClass} flex w-full cursor-pointer items-center gap-2 border text-left shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                ?disabled=${this.disabled}
                @pointerdown=${() => (this.openOnPointerDown = this.open)}
                @click=${this.onTriggerClick}
                @keydown=${this.onTriggerKeyDown}
            >
                ${this.renderTrigger()}
            </button>
            <div
                part="popup"
                id="popup"
                popover="auto"
                role="dialog"
                aria-labelledby=${ifDefined(this.ariaLabel ? "name" : undefined)}
                data-state=${this.open ? "open" : "closed"}
                class="bg-surface text-surface-foreground border-border animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-popup ${this.popupClass} inset-auto m-0 border shadow-md outline-none"
                @focusout=${this.onPopupFocusOut}
            >
                ${this.renderPopup()}
            </div>
        `;
    }
}
