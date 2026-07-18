import { test, expect, type Locator } from "@playwright/test";

// The library is the browsing surface for saved composites: it replaced a cramped row of
// pills in the toolbar that did not scale past a handful of components.

const composite = (id: string, name: string, category?: string, updatedAt?: number) => ({
  id,
  name,
  description: `${name} description`,
  ...(category ? { category } : {}),
  ...(updatedAt ? { updatedAt } : {}),
  nodes: [{ id: "n1", type: "heading", props: { text: name, level: "h2", align: "left" } }],
  propBindings: [
    {
      propKey: "title",
      label: "Title",
      type: "string",
      default: name,
      required: true,
      targetPath: [0, "props", "text"],
    },
  ],
  version: "1.0",
});

const saved = [
  composite("custom_price_tag_a", "Price Tag", "Commerce", 3000),
  composite("custom_hero_b", "Hero Block", "Marketing", 9000),
  composite("custom_loose_c", "Loose Widget"),
];

test.describe("component library", () => {
  let library: Locator;

  test.beforeEach(async ({ page }) => {
    // Seed only when absent: addInitScript runs on every navigation, so an
    // unconditional write would wipe anything the test itself saved before a reload.
    await page.addInitScript(
      ([key, value]) => {
        if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
      },
      ["sandy-composites", JSON.stringify(saved)],
    );
    await page.goto("/sandbox");
    await page.getByTitle("Open component library").click();
    library = page.getByRole("dialog", { name: "Component library" });
  });

  test("lists every saved component, most recently updated first", async () => {
    const names = await library.getByRole("heading", { level: 3 }).allInnerTexts();

    expect(names).toEqual(["Hero Block", "Price Tag", "Loose Widget"]);
  });

  test("search filters by name, description and category", async () => {
    const search = library.getByPlaceholder("Name, description or category");

    await search.fill("hero");
    await expect(library.getByRole("heading", { level: 3 })).toHaveText(["Hero Block"]);

    await search.fill("commerce");
    await expect(library.getByRole("heading", { level: 3 })).toHaveText(["Price Tag"]);

    await search.fill("zzzz");
    await expect(library.getByRole("heading", { level: 3 })).toHaveCount(0);
  });

  test("duplicating adds a copy without touching the original", async ({ page }) => {
    await library.getByTitle("Duplicate Price Tag").click();

    await expect(page.getByRole("heading", { level: 3, name: "Price Tag copy" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Price Tag", exact: true }),
    ).toBeVisible();

    // The copy is a real saved component, so it survives a reload.
    await page.reload();
    await page.getByTitle("Open component library").click();
    await expect(page.getByRole("heading", { level: 3, name: "Price Tag copy" })).toBeVisible();
  });

  test("deleting removes the component from the library", async ({ page }) => {
    await library.getByTitle("Delete Loose Widget").click();
    // Deletion is guarded by a confirmation.
    await page
      .getByRole("dialog", { name: /Delete "Loose Widget"/ })
      .getByRole("button", { name: "Delete", exact: true })
      .click();

    await expect(page.getByRole("heading", { level: 3, name: "Loose Widget" })).toHaveCount(0);
    await expect(library.getByRole("heading", { level: 3 })).toHaveCount(2);
  });

  test("editing a component from the library opens the builder for it", async ({ page }) => {
    await library.getByTitle("Edit Price Tag").click();

    await expect(page.getByText("Component Builder")).toBeVisible();
    await expect(page.locator('input[value="Price Tag"]')).toBeVisible();
  });

  test("export all downloads a bundle containing every component", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await library.getByTitle("Export all components").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("sandy-components.json");
  });

  test("is a real modal: Escape closes it and focus moves inside", async ({ page }) => {
    await expect(library).toBeVisible();

    // Focus must land inside the dialog, not stay on the covered toolbar button.
    const focusedInside = await page.evaluate(() => {
      const dialog = document.querySelector("dialog[aria-label='Component library']");
      return !!dialog && dialog.contains(document.activeElement);
    });
    expect(focusedInside).toBe(true);

    await page.keyboard.press("Escape");
    await expect(library).toBeHidden();
  });

  test("makes the sandbox behind it inert", async ({ page }) => {
    // showModal() puts the dialog in the top layer, so controls underneath stop being
    // reachable - previously Tab walked the invisible toolbar and Monaco editor.
    const toolbarReachable = await page.evaluate(() => {
      const btn = document.querySelector("button[aria-label='Open component library']");
      if (!(btn instanceof HTMLElement)) return "missing";
      btn.focus();
      return document.activeElement === btn;
    });
    expect(toolbarReachable).toBe(false);
  });
});
