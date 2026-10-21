import { css, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import type { IconNode } from "lucide";
import "./components/icon/hx-icon.js";
import { HxElement } from "./hx-element.js";

/**
 * Base class for the items of a popup list (menu item, select option).
 *
 * Items are out of the tab order: the parent list moves the focus between them (keyboard and hover),
 * and the focused item is highlighted. Disabled items are dimmed and swallow their clicks. Subclasses
 * set their ARIA role and render their content with `renderBase()` and `renderIndicator()`.
 */
export abstract class HxMenuItemElement extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
                outline: none;
            }
            :host(:focus) [part="base"] {
                background: var(--hx-accent);
                color: var(--hx-accent-foreground);
            }
            :host([disabled]) [part="base"] {
                opacity: 0.5;
                pointer-events: none;
            }
        `,
    ];

    @property({ reflect: true }) value = "";
    @property({ type: Boolean, reflect: true }) disabled = false;

    protected internals = this.attachInternals();

    constructor() {
        super();
        this.addEventListener("click", (event) => {
            if (this.disabled && (event.target as Element).closest(this.localName) === this)
                event.stopImmediatePropagation();
        });
    }

    override connectedCallback() {
        super.connectedCallback();
        this.tabIndex = -1;
    }

    get label() {
        return [...this.childNodes]
            .filter((node) => !(node instanceof Element && node.slot))
            .map((node) => node.textContent)
            .join("")
            .trim();
    }

    protected override updated() {
        this.internals.ariaDisabled = String(this.disabled);
    }

    protected renderBase(content: unknown, padding: string) {
        return html`<div
            part="base"
            class="${padding} rounded-menu-item min-h-menu-item relative flex cursor-default items-center gap-2 select-none"
        >
            ${content}
        </div>`;
    }

    protected renderIndicator(icon: IconNode | undefined, side: "left" | "right") {
        return html`<span
            part="indicator"
            class="${side === "left" ? "left-2" : "right-2"} pointer-events-none absolute flex size-3.5 items-center justify-center"
            >${icon ? html`<hx-icon .icon=${icon}></hx-icon>` : nothing}</span
        >`;
    }
}
