import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ComponentLibrary } from "@/components/sandbox/component-library";
import type { CompositeDefinition } from "@/lib/composite/types";
import type { ThemeTokens } from "@/lib/theme/types";

expect.extend(toHaveNoViolations);

// Theming and composite rendering are covered by their own suites; stubbing them keeps
// this file about the library surface (filtering, sorting, actions, isolation).
vi.mock("@/lib/theme/css-vars", () => ({ applyTheme: vi.fn() }));
vi.mock("@/components/composite/composite-renderer", () => ({
  CompositeRenderer: ({ definition }: { definition: CompositeDefinition }) => {
    if (definition.id === "broken") throw new Error("bad definition");
    return <div data-testid={`preview-${definition.id}`} />;
  },
}));

afterEach(cleanup);

const HOUR = 60 * 60 * 1000;
const now = Date.now();

// jsdom has no layout, so contrast/region rules cannot be evaluated meaningfully.
const axeOptions = {
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
    "heading-order": { enabled: false },
  },
};

function def(overrides: Partial<CompositeDefinition> & { id: string; name: string }) {
  return {
    nodes: [{ id: "n1", type: "paragraph" as const, props: { text: overrides.name } }],
    propBindings: [],
    version: "1.0" as const,
    ...overrides,
  } satisfies CompositeDefinition;
}

const alpha = def({
  id: "alpha",
  name: "Alpha Card",
  description: "A promo card",
  category: "Marketing",
  updatedAt: now - 2 * HOUR,
});
const beta = def({
  id: "beta",
  name: "Beta Banner",
  description: "Top of page banner",
  category: "Layout",
  updatedAt: now - 30 * 1000,
});
// No category and no timestamp: the pre-library shape.
const gamma = def({ id: "gamma", name: "Gamma Legacy" });

const noop = () => {};

function renderLibrary(overrides: Partial<Parameters<typeof ComponentLibrary>[0]> = {}) {
  const props = {
    composites: [alpha, beta, gamma],
    themeTokens: {} as ThemeTokens,
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onExportOne: vi.fn(),
    onExportAll: vi.fn(),
    onCreate: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  return { ...render(<ComponentLibrary {...props} />), props };
}

function cardNames(container: HTMLElement): string[] {
  return [...container.querySelectorAll("h3")].map((h) => h.textContent ?? "");
}

describe("ComponentLibrary", () => {
  it("lists every saved composite", () => {
    const { container } = renderLibrary();
    expect(cardNames(container)).toEqual(
      expect.arrayContaining(["Alpha Card", "Beta Banner", "Gamma Legacy"]),
    );
  });

  it("sorts most-recently-updated first and undated last", () => {
    const { container } = renderLibrary();
    expect(cardNames(container)).toEqual(["Beta Banner", "Alpha Card", "Gamma Legacy"]);
  });

  it("shows a relative updated line, and '-' when the timestamp is missing", () => {
    renderLibrary();
    expect(screen.getByText("Updated 2 hours ago")).toBeDefined();
    expect(screen.getByText("Updated just now")).toBeDefined();
    expect(screen.getByText("Updated -")).toBeDefined();
  });

  it("filters by name, description and category, case-insensitively", () => {
    const { container } = renderLibrary();
    const search = screen.getByLabelText("Search");

    fireEvent.change(search, { target: { value: "alpha" } });
    expect(cardNames(container)).toEqual(["Alpha Card"]);

    fireEvent.change(search, { target: { value: "TOP OF PAGE" } });
    expect(cardNames(container)).toEqual(["Beta Banner"]);

    fireEvent.change(search, { target: { value: "marketing" } });
    expect(cardNames(container)).toEqual(["Alpha Card"]);
  });

  it("filters by category, grouping the untagged ones under Uncategorized", () => {
    const { container } = renderLibrary();

    fireEvent.click(screen.getByRole("button", { name: "Layout" }));
    expect(cardNames(container)).toEqual(["Beta Banner"]);

    fireEvent.click(screen.getByRole("button", { name: "Uncategorized" }));
    expect(cardNames(container)).toEqual(["Gamma Legacy"]);

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(cardNames(container)).toHaveLength(3);
  });

  it("offers Create when the library is empty", () => {
    const { props } = renderLibrary({ composites: [] });
    expect(screen.getByText("No components yet")).toBeDefined();
    expect(screen.queryByLabelText("Search")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Create your first component" }));
    expect(props.onCreate).toHaveBeenCalled();
  });

  it("distinguishes an empty search result and clears the search", () => {
    const { container } = renderLibrary();
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "nothing matches" } });

    expect(screen.getByText("No components match this search")).toBeDefined();
    expect(screen.queryByText("No components yet")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(cardNames(container)).toHaveLength(3);
  });

  it("fires each per-card action with that composite", () => {
    const { props } = renderLibrary();

    fireEvent.click(screen.getByTitle("Edit Alpha Card"));
    expect(props.onEdit).toHaveBeenCalledWith(alpha);

    fireEvent.click(screen.getByTitle("Duplicate Alpha Card"));
    expect(props.onDuplicate).toHaveBeenCalledWith(alpha);

    fireEvent.click(screen.getByTitle("Export Alpha Card"));
    expect(props.onExportOne).toHaveBeenCalledWith(alpha);

    fireEvent.click(screen.getByTitle("Delete Alpha Card"));
    expect(props.onDelete).toHaveBeenCalledWith("alpha");
  });

  it("fires the header actions", () => {
    const { props } = renderLibrary();

    fireEvent.click(screen.getByTitle("Export all components"));
    expect(props.onExportAll).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle("New component"));
    expect(props.onCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle("Close component library"));
    expect(props.onClose).toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = renderLibrary();
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});

describe("ComponentLibrary preview isolation", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // React logs the caught render error; the boundary is the thing under test.
    errorSpy = vi.spyOn(console, "error").mockImplementation(noop);
  });
  afterAll(() => errorSpy.mockRestore());

  it("keeps the library up when one composite fails to render", () => {
    const broken = def({ id: "broken", name: "Broken One", updatedAt: now });
    const { container } = render(
      <ComponentLibrary
        composites={[broken, alpha]}
        themeTokens={{} as ThemeTokens}
        onEdit={noop}
        onDuplicate={noop}
        onDelete={noop}
        onExportOne={noop}
        onExportAll={noop}
        onCreate={noop}
        onClose={noop}
      />,
    );

    expect(cardNames(container)).toEqual(["Broken One", "Alpha Card"]);
    expect(screen.getByText("bad definition")).toBeDefined();
    // The healthy sibling still renders its preview.
    expect(within(container).getByTestId("preview-alpha")).toBeDefined();
  });
});
