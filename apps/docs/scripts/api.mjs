import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

const root = new URL("../../../", import.meta.url);
const pages = new URL("apps/docs/src/content/docs/components/", root);
const manifest = JSON.parse(await readFile(new URL("packages/hexa-ui/custom-elements.json", root), "utf8"));
const declarations = new Map(
    manifest.modules
        .flatMap((module) => module.declarations ?? [])
        .map((declaration) => [declaration.name, declaration]),
);

const args = process.argv.slice(2);
const check = args.includes("--check");
const components = args.filter((arg) => !arg.startsWith("--"));
const names = components.length
    ? components
    : (await readdir(pages)).filter((file) => file.endsWith(".mdx")).map((file) => file.slice(0, -4));

const heading = "## API";

function text(value = "") {
    return value.replace(/\s+/g, " ").trim().replace(/\.$/, "").replaceAll("|", "\\|");
}

function code(value) {
    return value ? `\`${value.replaceAll("|", "\\|")}\`` : "—";
}

function table(headers, rows) {
    return [headers, headers.map(() => "---"), ...rows].map((cells) => `| ${cells.join(" | ")} |`).join("\n");
}

function elements(component) {
    const index = manifest.modules.find((module) => module.path === `src/components/${component}/index.ts`);
    return index.exports
        .map((entry) => declarations.get(entry.declaration.name))
        .filter((declaration) => declaration?.customElement);
}

function sections(element) {
    const members = (element.members ?? []).filter((member) => !member.static && !member.privacy);
    const properties = members.filter((member) => member.kind === "field" && (member.attribute || member.description));
    const methods = members.filter((member) => member.kind === "method" && member.description);
    const named = (items) => items.map((item) => [code(item.name), text(item.description)]);

    return [
        [
            "Properties",
            ["Property", "Attribute", "Type", "Default", "Description"],
            properties.map((property) => [
                code(property.name),
                code(property.attribute),
                code(property.type?.text.replace(/ \| undefined$/, "")) + (property.readonly ? " (read-only)" : ""),
                code(property.default),
                text(property.description),
            ]),
        ],
        [
            "Methods",
            ["Name", "Description"],
            methods.map((method) => [code(`${method.name}()`), text(method.description)]),
        ],
        ["Events", ["Name", "Description"], named((element.events ?? []).filter((event) => event.description))],
        [
            "Slots",
            ["Name", "Description"],
            (element.slots ?? []).map((slot) => [slot.name ? code(slot.name) : "(default)", text(slot.description)]),
        ],
        [
            "CSS custom properties",
            ["Name", "Default", "Description"],
            (element.cssProperties ?? []).map((property) => [
                code(property.name),
                code(property.default),
                text(property.description),
            ]),
        ],
        ["CSS parts", ["Name", "Description"], named(element.cssParts ?? [])],
        ["CSS states", ["Name", "Description"], named(element.cssStates ?? [])],
    ].filter(([, , rows]) => rows.length);
}

function render(component) {
    return elements(component)
        .map((element) =>
            [
                `### ${element.tagName}`,
                ...sections(element).flatMap(([title, headers, rows]) => [`#### ${title}`, table(headers, rows)]),
            ].join("\n\n"),
        )
        .join("\n\n");
}

for (const name of names) {
    const url = new URL(`${name}.mdx`, pages);
    const path = fileURLToPath(url);
    const source = (await readFile(url, "utf8")).replaceAll("\r\n", "\n");
    const start = source.indexOf(`\n${heading}\n`);
    if (start === -1) throw new Error(`${name}.mdx has no "${heading}" section`);

    const page = `${source.slice(0, start)}\n${heading}\n\n${render(name)}\n`;
    const result = await format(page, { ...(await resolveConfig(path)), filepath: path });
    if (result === source) continue;

    if (check) {
        console.error(`${name}.mdx: the API section is out of date`);
        process.exitCode = 1;
    } else {
        await writeFile(url, result);
        console.log(`${name}.mdx: API section generated`);
    }
}
