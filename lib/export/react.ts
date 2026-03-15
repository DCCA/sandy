import type { ValidatedSection } from "@/lib/registry/types";

function propsToJSX(props: Record<string, unknown>, indent: number): string {
  const pad = " ".repeat(indent);
  const entries: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (typeof value === "string") {
      entries.push(`${pad}${key}=${JSON.stringify(value)}`);
    } else if (typeof value === "boolean" && value) {
      entries.push(`${pad}${key}`);
    } else {
      entries.push(`${pad}${key}={${JSON.stringify(value)}}`);
    }
  }

  return entries.join("\n");
}

export function generateReactCode(sections: ValidatedSection[]): string {
  const components = new Set<string>();
  const jsxBlocks: string[] = [];

  for (const section of sections) {
    components.add(section.componentName);
    const propsStr = propsToJSX(section.props, 8);
    if (propsStr) {
      jsxBlocks.push(`      <${section.componentName}\n${propsStr}\n      />`);
    } else {
      jsxBlocks.push(`      <${section.componentName} />`);
    }
  }

  const imports = Array.from(components)
    .sort()
    .map((name) => `import { ${name} } from "@/components/registry/${toFileName(name)}";`)
    .join("\n");

  return `${imports}

export default function Page() {
  return (
    <div>
${jsxBlocks.join("\n")}
    </div>
  );
}
`;
}

function toFileName(componentName: string): string {
  return componentName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
