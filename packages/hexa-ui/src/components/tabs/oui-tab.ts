import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IconNode } from "lucide";
import { OuiElement } from "../../oui-element.js";
import "../icon/oui-icon.js";

export type OuiTabIconPlacement = "left" | "right";
import type { OuiTabsDirection, OuiTabsVariant } from "./oui-tabs.js";

const variants: Record<OuiTabsVariant, { selected: string; idle: string } & Record<OuiTabsDirection, string>> = {
    default: {
        horizontal: "justify-center rounded-tab border border-transparent h-tab gap-2 px-tab",
        vertical: "justify-start rounded-tab border border-transparent h-tab gap-2 px-tab",
        selected: "bg-background text-foreground shadow-sm",
        idle: "hover:text-foreground",
    },
    secondary: {
        horizontal: "justify-center border-b-2 h-tabs gap-2 px-tab",
        vertical: "justify-start -ml-(--oui-border-width) border-l-2 h-tabs gap-2 px-tab",
        selected: "border-primary text-foreground",
        idle: "border-transparent text-muted-foreground hover:text-foreground",
    },
    button: {
        horizontal: "justify-center rounded-tab h-tabs gap-2 px-tab",
        vertical: "justify-start rounded-tab h-tabs gap-2 px-tab",
        selected: "bg-primary text-primary-foreground",
        idle: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    },
};

/**
 * @element oui-tab
 * @property value - Matches the `value` of its `oui-tab-panel`.
 * @property selected - Whether the tab is selected (set by the `oui-tabs`).
 * @property disabled - Prevents selecting the tab.
 * @property variant - Visual style (set by the `oui-tabs`).
 * @property direction - Tab list above or beside the panels (set by the `oui-tabs`).
 * @property icon - Lucide icon, set as a JS property.
 * @property iconPlacement - Side of the icon relative to the label.
 * @slot - The tab label (text, icon…).
 * @csspart base - The tab wrapper.
 * @csspart icon - The `oui-icon` rendered from the `icon` property.
 */
@customElement("oui-tab")
export class OuiTab extends OuiElement {
    static override styles = [
        OuiElement.styles,
        css`
            :host {
                display: flex;
                outline: none;
            }
            :host([disabled]) {
                pointer-events: none;
                opacity: 0.5;
            }
            :host(:focus-visible) [part="base"] {
                box-shadow: 0 0 0 3px color-mix(in oklab, var(--oui-ring) 50%, transparent);
            }
        `,
    ];

    @property({ reflect: true }) value = "";
    @property({ type: Boolean, reflect: true }) selected = false;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ reflect: true }) variant: OuiTabsVariant = "default";
    @property({ reflect: true }) direction: OuiTabsDirection = "horizontal";
    @property({ attribute: false }) icon?: IconNode;
    @property({ attribute: "icon-placement", reflect: true }) iconPlacement: OuiTabIconPlacement = "left";

    private internals = this.attachInternals();

    constructor() {
        super();
        this.internals.role = "tab";
    }

    override connectedCallback() {
        super.connectedCallback();
        this.slot = "nav";
    }

    protected override updated() {
        this.internals.ariaSelected = String(this.selected);
        this.internals.ariaDisabled = String(this.disabled);
    }

    override render() {
        const variant = variants[this.variant];
        const icon = this.icon ? html`<oui-icon part="icon" .icon=${this.icon}></oui-icon>` : nothing;
        return html`<div
            part="base"
            class="${variant[this.direction]} ${
                this.selected ? variant.selected : variant.idle
            } inline-flex flex-1 cursor-pointer items-center whitespace-nowrap transition-[color,background-color,box-shadow]"
        >
            ${this.iconPlacement === "left" ? icon : nothing}<slot></slot>${
                this.iconPlacement === "right" ? icon : nothing
            }
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "oui-tab": OuiTab;
    }
}
