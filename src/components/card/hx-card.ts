import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HxElement } from "../../hx-element.js";

export type HxCardVariant = "default" | "outline" | "ghost";

type HxCardSlot = "header" | "title" | "description" | "action" | "footer";

const variants: Record<HxCardVariant, string> = {
    default: "bg-card text-card-foreground ring-(length:--hx-border-width) ring-foreground/10",
    outline: "bg-background text-foreground ring-(length:--hx-border-width) ring-foreground/10",
    ghost: "",
};

/**
 * @element hx-card
 * @slot header - A custom header, replacing the `title`, `description` and `action` layout.
 * @slot title - The card title.
 * @slot description - A short text under the title.
 * @slot action - An element aligned to the top right of the header (button, badge…).
 * @slot - The card content.
 * @slot footer - The card footer (actions…).
 * @csspart base - The card container.
 * @csspart header - The header wrapper.
 * @csspart content - The content wrapper.
 * @csspart footer - The footer wrapper.
 */
@customElement("hx-card")
export class HxCard extends HxElement {
    static override styles = [
        HxElement.styles,
        css`
            :host {
                display: block;
            }
            ::slotted([slot="title"]),
            ::slotted([slot="description"]) {
                margin: 0;
                font: inherit;
            }
        `,
    ];

    @property({ reflect: true }) variant: HxCardVariant = "default";

    @state() private filled = new Set<HxCardSlot>();

    private onSlotChange(event: Event) {
        const slot = event.target as HTMLSlotElement;
        const filled = new Set(this.filled);
        if (slot.assignedNodes({ flatten: true }).length) filled.add(slot.name as HxCardSlot);
        else filled.delete(slot.name as HxCardSlot);
        this.filled = filled;
    }

    override render() {
        const has = (name: HxCardSlot) => this.filled.has(name);
        const hasHeader = has("header") || has("title") || has("description") || has("action");
        return html`<div
            part="base"
            class="${variants[this.variant]} rounded-card gap-card py-card flex flex-col"
            @slotchange=${this.onSlotChange}
        >
            <div part="header" class="${hasHeader ? "" : "hidden"} px-card">
                <slot name="header">
                    <div class="flex items-start gap-4">
                        <div class="flex flex-1 flex-col gap-1.5">
                            <div class="${has("title") ? "" : "hidden"} text-lg leading-none font-medium">
                                <slot name="title"></slot>
                            </div>
                            <div class="${has("description") ? "" : "hidden"} text-muted-foreground">
                                <slot name="description"></slot>
                            </div>
                        </div>
                        <div class="${has("action") ? "" : "hidden"} shrink-0"><slot name="action"></slot></div>
                    </div>
                </slot>
            </div>
            <div part="content" class="px-card"><slot></slot></div>
            <div part="footer" class="${has("footer") ? "flex" : "hidden"} px-card items-center gap-2">
                <slot name="footer"></slot>
            </div>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "hx-card": HxCard;
    }
}
