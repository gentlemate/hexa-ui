import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IconNode } from "lucide";
import { HxElement } from "../../hx-element.js";
import "../icon/hx-icon.js";

export type HxTabIconPlacement = "left" | "right";
import type { HxTabsDirection, HxTabsVariant } from "./hx-tabs.js";

const variants: Record<HxTabsVariant, { selected: string; idle: string } & Record<HxTabsDirection, string>> = {
    default: {
        horizontal: "justify-center rounded-control border border-transparent h-tab gap-2 px-tab",
        vertical: "justify-start rounded-control border border-transparent h-tab gap-2 px-tab",
        selected: "bg-background text-foreground shadow-sm",
        idle: "hover:text-foreground",
    },
    secondary: {
        horizontal: "justify-center -mb-(--hx-border-width) border-b-2 h-tabs gap-2 px-tab",
        vertical: "justify-start -ml-(--hx-border-width) border-l-2 h-tabs gap-2 px-tab",
        selected: "border-primary text-foreground",
        idle: "border-transparent text-muted-foreground hover:text-foreground",
    },
};

/**
 * @element hx-tab
 * @slot - The tab label (text, icon…).
 * @csspart base - The tab wrapper.
 * @csspart icon - The `hx-icon` rendered from the `icon` property.
 */
@customElement("hx-tab")
export class HxTab extends HxElement {
    static override styles = [
        HxElement.styles,
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
                box-shadow: 0 0 0 3px color-mix(in oklab, var(--hx-ring) 50%, transparent);
            }
        `,
    ];

    @property({ reflect: true }) value = "";
    @property({ type: Boolean, reflect: true }) selected = false;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ reflect: true }) variant: HxTabsVariant = "default";
    @property({ reflect: true }) direction: HxTabsDirection = "horizontal";
    @property({ attribute: false }) icon?: IconNode;
    @property({ attribute: "icon-placement", reflect: true }) iconPlacement: HxTabIconPlacement = "left";

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
        const icon = this.icon ? html`<hx-icon part="icon" .icon=${this.icon}></hx-icon>` : nothing;
        return html`<div
            part="base"
            class="${variant[this.direction]} ${
                this.selected ? variant.selected : variant.idle
            } inline-flex flex-1 cursor-pointer items-center text-sm font-medium whitespace-nowrap transition-[color,box-shadow]"
        >
            ${this.iconPlacement === "left" ? icon : nothing}<slot></slot>${
                this.iconPlacement === "right" ? icon : nothing
            }
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-tab": HxTab;
    }
}
