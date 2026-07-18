import { test, expect } from "@playwright/test";

// Regression coverage for the composite registry being invisible to React.
//
// Before the registry became an observable store, the validation memo depended only on
// [jsonText]. Saved composites register in a mount effect that never touches jsonText, so
// a restored page resolved against an empty registry, rendered "Unknown component", and
// never recomputed - it only healed once the user typed something. Editing a placed
// composite went stale the same way.

function encodeState(page: unknown): string {
  return Buffer.from(encodeURIComponent(JSON.stringify(page))).toString("base64");
}

const composite = {
  id: "custom_price_tag_abc123",
  name: "Price Tag",
  description: "Regression composite",
  nodes: [
    { id: "n1", type: "heading", props: { text: "Placeholder", level: "h2", align: "left" } },
  ],
  propBindings: [
    {
      propKey: "title",
      label: "Title",
      type: "string",
      default: "Placeholder",
      required: true,
      targetPath: [0, "props", "text"],
    },
  ],
  version: "1.0",
};

const pageUsingComposite = {
  version: "2.0",
  theme: { brand: "default", mode: "light" },
  sections: [{ id: "sec_1", component: composite.id, props: { title: "Composite Rendered OK" } }],
};

test.describe("saved composites resolve without a keystroke", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      ["sandy-composites", JSON.stringify([composite])],
    );
  });

  test("a shared link using a saved composite renders it on load", async ({ page }) => {
    await page.goto(`/sandbox?s=${encodeState(pageUsingComposite)}`);

    const preview = page.locator(".sandy-preview");
    await expect(preview.getByText("Composite Rendered OK")).toBeVisible();
    await expect(preview.getByText(/Unknown component/i)).toHaveCount(0);
  });

  test("editing a placed composite updates the preview immediately", async ({ page }) => {
    await page.goto(`/sandbox?s=${encodeState(pageUsingComposite)}`);
    const preview = page.locator(".sandy-preview");
    await expect(preview.getByText("Composite Rendered OK")).toBeVisible();

    // Open the builder for the placed composite and add a new primitive to it.
    await page.getByTitle("Edit Price Tag").click();
    await page.getByRole("button", { name: "Badge" }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // No keystroke in the editor: the preview must reflect the edited definition.
    await expect(preview.getByText("Badge")).toBeVisible();
    await expect(preview.getByText("Composite Rendered OK")).toBeVisible();
  });

  test("the Add Section picker shows the composite's name, not its raw id", async ({ page }) => {
    await page.goto("/sandbox");
    await expect(page.getByTitle("Edit Price Tag")).toBeVisible();

    await page.getByText("Add Section").click();
    await page.getByRole("option").last().scrollIntoViewIfNeeded();

    const labels = await page.getByRole("option").allInnerTexts();
    const composites = labels.filter((l) => l.includes("Regression composite"));
    expect(composites).toHaveLength(1);
    expect(composites[0]).toContain("Price Tag");
    expect(composites[0]).not.toContain("custom_price_tag_abc123");
  });
});

test("editing a composite in use warns before breaking placed sections", async ({ page }) => {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    ["sandy-composites", JSON.stringify([composite])],
  );
  await page.goto(`/sandbox?s=${encodeState(pageUsingComposite)}`);

  await page.getByTitle("Edit Price Tag").click();

  // No warning until the edit actually breaks something.
  await expect(page.getByRole("status")).toHaveCount(0);

  // Remove the bound prop the placed section depends on.
  await page.getByTitle("Remove binding").first().click();

  const warning = page.getByRole("status");
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("1 section");
  await expect(warning).toContainText("title");
});
