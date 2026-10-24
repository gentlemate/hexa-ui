import type { ReactiveElement } from "lit";

export async function focusTargetOf(element: HTMLElement) {
    await (element as Partial<ReactiveElement>).updateComplete;
    return (element as { focusTarget?: HTMLElement }).focusTarget ?? element;
}
