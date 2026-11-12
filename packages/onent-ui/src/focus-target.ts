import type { ReactiveElement } from "lit";

export async function focusTargetOf(element: HTMLElement) {
    await (element as Partial<ReactiveElement>).updateComplete;
    return (element as { focusTarget?: HTMLElement }).focusTarget ?? element;
}

export function hasFocus(element: Element) {
    const active = (element.getRootNode() as Document | ShadowRoot).activeElement;
    return !!active && element.contains(active);
}
