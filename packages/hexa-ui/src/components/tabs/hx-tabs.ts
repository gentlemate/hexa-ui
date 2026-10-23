import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";
import type { HxTabPanel } from "./hx-tab-panel.js";
import type { HxTab } from "./hx-tab.js";
import "./hx-tab-panel.js";
import "./hx-tab.js";

export type HxTabsVariant = "default" | "secondary";
export type HxTabsDirection = "horizontal" | "vertical";

const variants: Record<HxTabsVariant, Record<HxTabsDirection, string>> = {
    default: {
        horizontal: "rounded-control-lg bg-muted p-tabs text-muted-foreground",
        vertical: "rounded-control-lg bg-muted p-tabs text-muted-foreground",
    },
    secondary: {
        horizontal: "border-b border-border",
        vertical: "border-l border-border",
    },
};

const directions: Record<HxTabsDirection, { nav: string; body: string }> = {
    horizontal: { nav: "auto-cols-fr grid-flow-col", body: "mt-2" },
    vertical: { nav: "auto-rows-fr grid-flow-row", body: "ml-2 min-w-0 flex-1" },
};

/**
 * @element hx-tabs
 * @slot - The `hx-tab` and `hx-tab-panel` elements (tabs move to the tab list on their own).
 * @fires hx-tab-change - The selected tab changed; `event.detail.value` is its value.
 * @csspart nav - The tab list.
 * @csspart body - The panels wrapper.
 */
@customElement("hx-tabs")
export class HxTabs extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
            :host([direction="vertical"]) {
                display: flex;
                align-items: flex-start;
            }
        `,
    ];

    @property() value = "";
    @property({ reflect: true }) variant: HxTabsVariant = "default";
    @property({ reflect: true }) direction: HxTabsDirection = "horizontal";

    constructor() {
        super();
        this.addEventListener("click", (event) => {
            const tab = this.tabFrom(event.target);
            if (tab) this.select(tab);
        });
        this.addEventListener("keydown", (event) => this.onKeyDown(event));
    }

    private get tabs() {
        return [...this.querySelectorAll<HxTab>(":scope > hx-tab")];
    }

    private get panels() {
        return [...this.querySelectorAll<HxTabPanel>(":scope > hx-tab-panel")];
    }

    private get selectedValue() {
        const enabled = this.tabs.filter((tab) => !tab.disabled);
        return enabled.some((tab) => tab.value === this.value) ? this.value : (enabled[0]?.value ?? "");
    }

    private tabFrom(target: EventTarget | null) {
        const tab = target instanceof Element ? target.closest<HxTab>("hx-tab") : null;
        return tab && tab.parentElement === this && !tab.disabled ? tab : null;
    }

    private select(tab: HxTab) {
        if (tab.value === this.selectedValue) return;
        this.value = tab.value;
        this.dispatchEvent(
            new CustomEvent("hx-tab-change", { detail: { value: tab.value }, bubbles: true, composed: true }),
        );
    }

    private onKeyDown(event: KeyboardEvent) {
        const tab = this.tabFrom(event.target);
        if (!tab) return;
        const enabled = this.tabs.filter((t) => !t.disabled);
        const index = enabled.indexOf(tab);
        const last = enabled.length - 1;
        const [nextKey, previousKey] =
            this.direction === "vertical" ? ["ArrowDown", "ArrowUp"] : ["ArrowRight", "ArrowLeft"];
        const next: HxTab | undefined = {
            [nextKey]: enabled[index === last ? 0 : index + 1],
            [previousKey]: enabled[index === 0 ? last : index - 1],
            Home: enabled[0],
            End: enabled[last],
        }[event.key];
        if (!next) return;
        event.preventDefault();
        next.focus();
        this.select(next);
    }

    private sync() {
        const value = this.selectedValue;
        const panels = this.panels;
        for (const tab of this.tabs) {
            const panel = panels.find((p) => p.value === tab.value);
            tab.selected = tab.value === value;
            tab.variant = this.variant;
            tab.direction = this.direction;
            tab.tabIndex = tab.selected ? 0 : -1;
            tab.ariaControlsElements = panel ? [panel] : null;
            if (panel) panel.ariaLabelledByElements = [tab];
        }
        for (const panel of panels) panel.hidden = panel.value !== value;
    }

    protected override updated() {
        this.sync();
    }

    override render() {
        const direction = directions[this.direction];
        return html`<div
                part="nav"
                role="tablist"
                aria-orientation=${this.direction}
                class="${variants[this.variant][this.direction]} ${direction.nav} inline-grid"
            >
                <slot name="nav" @slotchange=${this.sync}></slot>
            </div>
            <div part="body" class=${direction.body}><slot @slotchange=${this.sync}></slot></div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-tabs": HxTabs;
    }
}
