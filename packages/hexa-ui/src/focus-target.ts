import type { ReactiveElement } from "lit";

/**
 * Resolves the element that actually receives focus for `element`: the `focusTarget` of `hx-*`
 * components that delegate focus to an inner element (once rendered), or the element itself.
 */
export async function focusTargetOf(element: HTMLElement) {
    await (element as Partial<ReactiveElement>).updateComplete;
    return (element as { focusTarget?: HTMLElement }).focusTarget ?? element;
}
