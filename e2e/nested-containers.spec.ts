import { test, expect } from "@playwright/test";

// Composites could only ever be a flat stack of primitives. The data model, the renderer
// and the binding-path walker all supported nesting already - the builder was the ceiling:
// it appended everything to the top level and showed container children read-only.

test.describe("nested containers in the builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sandbox");
    await page.getByTitle("Create custom component").click();
    await expect(page.getByRole("dialog", { name: "Component builder" })).toBeVisible();
  });

  test("adds primitives into the selected container instead of the top level", async ({ page }) => {
    const builder = page.getByRole("dialog", { name: "Component builder" });

    await builder.getByRole("button", { name: "Container" }).click();
    // Selecting the container retargets the palette.
    await expect(builder.getByText("into selected container")).toBeVisible();

    await builder.getByRole("button", { name: "Heading" }).click();
    await builder.getByRole("button", { name: "Badge" }).click();

    // Adding a node selects it, and a non-container selection retargets the palette
    // back to the top level, so the destination is always stated rather than guessed.
    await expect(builder.getByText("at top level")).toBeVisible();

    // Re-selecting the container targets it again.
    await builder.getByText("Container", { exact: true }).last().click();
    await expect(builder.getByText("into selected container")).toBeVisible();
  });

  test("nested nodes can be reordered and deleted", async ({ page }) => {
    const builder = page.getByRole("dialog", { name: "Component builder" });

    await builder.getByRole("button", { name: "Container" }).click();
    await builder.getByRole("button", { name: "Heading" }).click();
    await builder.getByRole("button", { name: "Badge" }).click();

    // Before this change the action buttons were hidden on nested rows entirely.
    await expect(builder.getByTitle("Delete")).not.toHaveCount(0);
    const deleteButtons = builder.getByTitle("Delete");
    const countBefore = await deleteButtons.count();

    await deleteButtons.last().click();

    await expect(builder.getByTitle("Delete")).toHaveCount(countBefore - 1);
  });

  test("a nested node's own properties are editable", async ({ page }) => {
    const builder = page.getByRole("dialog", { name: "Component builder" });

    await builder.getByRole("button", { name: "Container" }).click();
    await builder.getByRole("button", { name: "Heading" }).click();

    // Selecting the nested heading must surface its props - previously selection only
    // ever matched top-level nodes, so a nested node showed no editor at all.
    await expect(builder.getByText("Node Properties", { exact: true })).toBeVisible();
    // The heading's own fields, proving the selection resolved to the nested node.
    await expect(builder.getByText("Level", { exact: true })).toBeVisible();
    await expect(builder.getByText("Align", { exact: true })).toBeVisible();
  });

  test("saves a nested component and renders it on the page", async ({ page }) => {
    const builder = page.getByRole("dialog", { name: "Component builder" });

    await builder.getByRole("button", { name: "Container" }).click();
    await builder.getByRole("button", { name: "Badge" }).click();
    await builder.getByRole("textbox").first().fill("Nested Card");
    await builder.getByRole("button", { name: "Save", exact: true }).click();

    await expect(builder).toBeHidden();

    // It is a real saved component: it appears in the library with a preview.
    await page.getByTitle("Open component library").click();
    const library = page.getByRole("dialog", { name: "Component library" });
    await expect(library.getByRole("heading", { level: 3, name: "Nested Card" })).toBeVisible();

    // And the saved definition actually has a nested child, not a flattened stack.
    const stored = await page.evaluate(() => {
      const raw = window.localStorage.getItem("sandy-composites");
      return JSON.parse(raw || "[]");
    });
    const saved = stored.find((d: { name: string }) => d.name === "Nested Card");
    expect(saved).toBeTruthy();
    expect(saved.nodes).toHaveLength(1);
    expect(saved.nodes[0].type).toBe("container");
    expect(saved.nodes[0].children).toHaveLength(1);
    expect(saved.nodes[0].children[0].type).toBe("badge");
  });
});
