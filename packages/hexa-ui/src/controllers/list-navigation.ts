export interface ListItem extends HTMLElement {
    disabled: boolean;
}

const typeaheadDelay = 500;

/**
 * Keyboard navigation in a vertical list (menu, listbox): ArrowUp/ArrowDown (looping), Home/End, and
 * typeahead on the item labels. Disabled items are skipped.
 */
export class ListNavigation<T extends ListItem> {
    private items: () => T[];
    private label: (item: T) => string;
    private search = "";
    private timer?: ReturnType<typeof setTimeout>;

    constructor(items: () => T[], label: (item: T) => string) {
        this.items = items;
        this.label = label;
    }

    target(event: KeyboardEvent, current?: T): T | undefined {
        const items = this.items().filter((item) => !item.disabled);
        const index = current ? items.indexOf(current) : -1;
        switch (event.key) {
            case "ArrowDown":
                return items[(index + 1) % items.length];
            case "ArrowUp":
                return items[index <= 0 ? items.length - 1 : index - 1];
            case "Home":
                return items[0];
            case "End":
                return items.at(-1);
        }
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        return this.typeahead(event.key, items, index);
    }

    private typeahead(key: string, items: T[], index: number) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => (this.search = ""), typeaheadDelay);
        this.search += key.toLowerCase();

        const search = /^(.)\1*$/.test(this.search) ? this.search[0] : this.search;
        const start = search.length === 1 ? index + 1 : Math.max(index, 0);
        const ordered = [...items.slice(start), ...items.slice(0, start)];
        return ordered.find((item) => this.label(item).toLowerCase().startsWith(search));
    }
}
