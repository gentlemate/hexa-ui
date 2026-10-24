import { arrow, autoUpdate, computePosition, flip, offset, shift, size, type Placement } from "@floating-ui/dom";
import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface FloatingOptions {
    anchor: Element;
    floating: HTMLElement;
    placement: Placement;
    distance: number;
    alignOffset?: number;
    fit?: boolean;
    matchWidth?: boolean;
    arrow?: HTMLElement;
}

type Side = "top" | "right" | "bottom" | "left";

const opposite: Record<Side, Side> = { top: "bottom", right: "left", bottom: "top", left: "right" };

export class FloatingController implements ReactiveController {
    private options: () => FloatingOptions | undefined;
    private cleanup?: () => void;

    constructor(host: ReactiveControllerHost, options: () => FloatingOptions | undefined) {
        this.options = options;
        host.addController(this);
    }

    start() {
        this.stop();
        const options = this.options();
        if (options) this.cleanup = autoUpdate(options.anchor, options.floating, () => this.position(options));
    }

    stop() {
        this.cleanup?.();
        this.cleanup = undefined;
    }

    hostDisconnected() {
        this.stop();
    }

    private async position(options: FloatingOptions) {
        const { anchor, floating, placement, distance, alignOffset, fit, matchWidth, arrow: arrowElement } = options;
        const result = await computePosition(anchor, floating, {
            strategy: "fixed",
            placement,
            middleware: [
                offset({ mainAxis: distance, alignmentAxis: alignOffset }),
                flip(),
                shift({ padding: 8 }),
                (fit || matchWidth) &&
                    size({
                        padding: 8,
                        apply: ({ availableHeight, rects }) => {
                            if (fit) floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
                            if (matchWidth) floating.style.minWidth = `${rects.reference.width}px`;
                        },
                    }),
                arrowElement && arrow({ element: arrowElement, padding: 8 }),
            ],
        });
        const [side, align = "center"] = result.placement.split("-") as [Side, string?];
        Object.assign(floating.style, {
            left: `${result.x}px`,
            top: `${result.y}px`,
            transformOrigin: opposite[side],
        });
        floating.dataset.side = side;
        floating.dataset.align = align;

        const coords = result.middlewareData.arrow;
        if (arrowElement && coords) {
            Object.assign(arrowElement.style, {
                left: coords.x != null ? `${coords.x}px` : "",
                top: coords.y != null ? `${coords.y}px` : "",
                right: "",
                bottom: "",
                [opposite[side]]: `${-arrowElement.offsetWidth / 2}px`,
            });
        }
    }
}
