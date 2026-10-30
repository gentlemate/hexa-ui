import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";
import type { HxAccordionItem } from "./hx-accordion-item.js";
import "./hx-accordion-item.js";

export type HxAccordionType = "single" | "multiple";
export type HxAccordionVariant = "default" | "secondary";
export type HxAccordionTrigger = "click" | "hover";

const variants: Record<HxAccordionVariant, string> = {
    default: "",
    secondary: "overflow-hidden rounded-accordion bg-secondary",
};

/**
 * @element hx-accordion
 * @property type - `single` keeps one item open at a time, `multiple` lets several stay open.
 * @property collapsible - In `single` mode, lets the user close the open item.
 * @property variant - Visual style.
 * @property trigger - Opens the items on click or on hover.
 * @property {string[]} value - Values of the open items.
 * @slot - The `hx-accordion-item` elements.
 * @fires hx-accordion-change - The open items changed; `event.detail.value` lists their values.
 * @cssprop [--hx-spacing-accordion=1rem] - Padding of the triggers and contents. The top padding of the contents is half of it.
 * @cssprop [--hx-radius-accordion=var(--hx-radius-panel)] - Border radius of the `secondary` variant.
 * @csspart base - The items wrapper.
 */
@customElement("hx-accordion")
export class HxAccordion extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    @property({ reflect: true }) type: HxAccordionType = "single";
    @property({ type: Boolean, reflect: true }) collapsible = false;
    @property({ reflect: true }) variant: HxAccordionVariant = "default";
    @property({ reflect: true }) trigger: HxAccordionTrigger = "click";

    constructor() {
        super();
        this.addEventListener("hx-accordion-toggle", (event) => this.onToggle(event as CustomEvent<{ open: boolean }>));
        this.addEventListener("keydown", (event) => this.onKeyDown(event));
        this.addEventListener("mouseenter", (event) => this.onHover(event, true), true);
        this.addEventListener("mouseleave", (event) => this.onHover(event, false), true);
        this.addEventListener("click", (event) => this.onClick(event), true);
    }

    private get items() {
        return [...this.querySelectorAll<HxAccordionItem>(":scope > hx-accordion-item")];
    }

    get value() {
        return this.items.filter((item) => item.open).map((item) => item.value);
    }

    private itemFrom(event: Event) {
        const item = event.target as HxAccordionItem;
        return item.parentElement === this && item.tagName === "HX-ACCORDION-ITEM" ? item : null;
    }

    private onHover(event: MouseEvent, open: boolean) {
        if (this.trigger !== "hover") return;
        const item = this.itemFrom(event);
        if (item && event.composedPath()[0] === item && item.open !== open) item.toggle();
    }

    private onClick(event: MouseEvent) {
        const item = (event.target as Element).closest<HxAccordionItem>("hx-accordion-item");
        if (
            this.trigger === "hover" &&
            event.detail > 0 &&
            item?.parentElement === this &&
            event.composedPath().includes(item.button)
        ) {
            event.stopPropagation();
        }
    }

    private onToggle(event: CustomEvent<{ open: boolean }>) {
        const item = this.itemFrom(event);
        if (!item) return;
        if (this.type === "single") {
            if (!event.detail.open && !this.collapsible) {
                event.preventDefault();
                return;
            }
            if (event.detail.open) for (const other of this.items) if (other !== item) other.open = false;
        }
        queueMicrotask(() =>
            this.dispatchEvent(
                new CustomEvent("hx-accordion-change", {
                    detail: { value: this.value },
                    bubbles: true,
                    composed: true,
                }),
            ),
        );
    }

    private onKeyDown(event: KeyboardEvent) {
        const item = this.itemFrom(event);
        if (!item || event.composedPath()[0] !== item.button) return;
        const enabled = this.items.filter((i) => !i.disabled);
        const index = enabled.indexOf(item);
        const last = enabled.length - 1;
        const next: HxAccordionItem | undefined = {
            ArrowDown: enabled[index === last ? 0 : index + 1],
            ArrowUp: enabled[index === 0 ? last : index - 1],
            Home: enabled[0],
            End: enabled[last],
        }[event.key];
        if (!next) return;
        event.preventDefault();
        next.focus();
    }

    private sync() {
        let found = false;
        for (const item of this.items) {
            item.variant = this.variant;
            item.trigger = this.trigger;
            if (this.type !== "single") continue;
            if (item.open && found) item.open = false;
            found ||= item.open;
        }
    }

    protected override updated() {
        this.sync();
    }

    override render() {
        return html`<div part="base" class=${variants[this.variant]}><slot @slotchange=${this.sync}></slot></div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-accordion": HxAccordion;
    }
}
