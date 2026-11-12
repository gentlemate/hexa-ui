import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OuiElement } from "../../oui-element.js";
import type { OuiTabPanel } from "./oui-tab-panel.js";
import type { OuiTab } from "./oui-tab.js";
import "./oui-tab-panel.js";
import "./oui-tab.js";

export type OuiTabsVariant = "default" | "secondary" | "button";
export type OuiTabsDirection = "horizontal" | "vertical";

const variants: Record<OuiTabsVariant, Record<OuiTabsDirection, string>> = {
    default: {
        horizontal: "auto-cols-[minmax(max-content,1fr)] rounded-tabs bg-muted p-tabs text-muted-foreground",
        vertical: "rounded-tabs bg-muted p-tabs text-muted-foreground",
    },
    secondary: {
        horizontal:
            "auto-cols-[minmax(max-content,1fr)] shadow-[inset_0_calc(-1*var(--oui-border-width))_0_var(--oui-border)]",
        vertical: "border-l border-border",
    },
    button: {
        horizontal: "auto-cols-max gap-2",
        vertical: "gap-2",
    },
};

const directions: Record<OuiTabsDirection, { nav: string; body: string }> = {
    horizontal: { nav: "grid-flow-col max-w-full overflow-x-auto", body: "mt-2" },
    vertical: { nav: "auto-rows-fr grid-flow-row", body: "ml-2 min-w-0 flex-1" },
};

/**
 * @element oui-tabs
 * @property value - Value of the selected tab.
 * @property variant - Visual style.
 * @property direction - Tab list above (`horizontal`) or beside (`vertical`) the panels.
 * @slot - The `oui-tab` and `oui-tab-panel` elements (tabs move to the tab list on their own).
 * @fires oui-tab-change - The selected tab changed; `event.detail.value` is its value.
 * @cssprop [--oui-height-tabs=var(--oui-height-control)] - Height of the tab list.
 * @cssprop [--oui-spacing-tabs=0.25rem] - Padding of the tab list.
 * @cssprop [--oui-spacing-tab=var(--oui-spacing-control)] - Horizontal padding of each tab.
 * @cssprop [--oui-radius-tabs=calc(var(--oui-radius-tab) + 0.125rem)] - Border radius of the tab list.
 * @cssprop [--oui-radius-tab=var(--oui-radius-control)] - Border radius of each tab.
 * @csspart nav - The tab list.
 * @csspart body - The panels wrapper (not displayed without `oui-tab-panel`).
 */
@customElement("oui-tabs")
export class OuiTabs extends OuiElement {
    static override styles = [
        OuiElement.styles,
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
    @property({ reflect: true }) variant: OuiTabsVariant = "default";
    @property({ reflect: true }) direction: OuiTabsDirection = "horizontal";

    @state() private hasPanels = false;

    constructor() {
        super();
        this.addEventListener("click", (event) => {
            const tab = this.tabFrom(event.target);
            if (tab) this.select(tab);
        });
        this.addEventListener("keydown", (event) => this.onKeyDown(event));
    }

    private get tabs() {
        return [...this.querySelectorAll<OuiTab>(":scope > oui-tab")];
    }

    private get panels() {
        return [...this.querySelectorAll<OuiTabPanel>(":scope > oui-tab-panel")];
    }

    private get selectedValue() {
        const enabled = this.tabs.filter((tab) => !tab.disabled);
        return enabled.some((tab) => tab.value === this.value) ? this.value : (enabled[0]?.value ?? "");
    }

    private tabFrom(target: EventTarget | null) {
        const tab = target instanceof Element ? target.closest<OuiTab>("oui-tab") : null;
        return tab && tab.parentElement === this && !tab.disabled ? tab : null;
    }

    private select(tab: OuiTab) {
        if (tab.value === this.selectedValue) return;
        this.value = tab.value;
        this.dispatchEvent(
            new CustomEvent("oui-tab-change", { detail: { value: tab.value }, bubbles: true, composed: true }),
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
        const next: OuiTab | undefined = {
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

    private onSlotChange() {
        this.hasPanels = this.panels.length > 0;
        this.sync();
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
            <div part="body" class=${this.hasPanels ? direction.body : "hidden"}>
                <slot @slotchange=${this.onSlotChange}></slot>
            </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-tabs": OuiTabs;
    }
}
