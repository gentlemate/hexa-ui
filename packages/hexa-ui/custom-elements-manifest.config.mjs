function methodTags() {
    return {
        name: "method-tags",
        analyzePhase({ ts, node, moduleDoc }) {
            if (!ts.isClassDeclaration(node) || !node.name) return;
            const declaration = moduleDoc.declarations?.find((declaration) => declaration.name === node.name.getText());
            for (const tag of ts.getJSDocTags(node)) {
                if (tag.tagName.getText() !== "method") continue;
                const [, name, description] =
                    ts.getTextOfJSDocComment(tag.comment)?.match(/^(\w+)\s+-\s+([\s\S]*)$/) ?? [];
                const method = declaration?.members?.find((member) => member.kind === "method" && member.name === name);
                if (method) method.description = description;
            }
        },
    };
}

function expandedTypes() {
    let ts;
    let program;
    let checker;

    function literals(node) {
        if (ts.isUnionTypeNode(node)) {
            const parts = node.types.map(literals);
            return parts.every(Boolean) ? parts.flat() : undefined;
        }
        if (ts.isParenthesizedTypeNode(node)) return literals(node.type);
        if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [node.getText()];
        if (ts.isTypeReferenceNode(node)) {
            let symbol = checker.getSymbolAtLocation(node.typeName);
            if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
            const alias = symbol?.declarations?.find(ts.isTypeAliasDeclaration);
            const values = alias && literals(alias.type);
            if (values) return values;
        }
        const type = checker.getTypeFromTypeNode(node);
        const types = type.isUnion() ? type.types : [type];
        return types.every((type) => type.isStringLiteral())
            ? types.map((type) => JSON.stringify(type.value))
            : undefined;
    }

    return {
        name: "expanded-types",
        initialize(options) {
            ts = options.ts;
            const { config } = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
            const { fileNames, options: compilerOptions } = ts.parseJsonConfigFileContent(config, ts.sys, ".");
            program = ts.createProgram(fileNames, compilerOptions);
            checker = program.getTypeChecker();
        },
        moduleLinkPhase({ moduleDoc }) {
            const source = program.getSourceFile(ts.sys.resolvePath(moduleDoc.path));
            for (const declaration of moduleDoc.declarations ?? []) {
                const node = source?.statements.find(
                    (statement) => ts.isClassDeclaration(statement) && statement.name?.text === declaration.name,
                );
                for (const member of declaration.members ?? []) {
                    const property = node?.members.find(
                        (property) => ts.isPropertyDeclaration(property) && property.name.getText() === member.name,
                    );
                    if (!property?.type || member.type?.text !== property.type.getText()) continue;
                    const values = literals(property.type);
                    if (values) member.type.text = values.join(" | ");
                }
            }
        },
    };
}

export default {
    globs: ["src/**/*.ts"],
    litelement: true,
    packagejson: false,
    plugins: [methodTags(), expandedTypes()],
};
