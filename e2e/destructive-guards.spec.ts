import { test, expect } from "@playwright/test";

// Both guards came out of an exploratory pass, not from a test plan:
// - deleting a component that was placed on the page silently broke the page
// - Escape (newly wired when the overlays became real modals) discarded builder work

function encodeState(page: unknown): string {
  return Buffer.from(encodeURIComponent(JSON.stringify(page))).toString("base64");
}

const composite = {
  id: "custom_placed_a",
  name: "Placed Card",
  description: "Used on the page",
  nodes: [{ id: "n1", type: "heading", props: { text: "Placed", level: "h3", align: "left" } }],
  propBindings: [
    {
      propKey: "title",
      label: "Title",
      type: "string",
      default: "Placed",
      required: true,
      targetPath: [0, "props", "text"],
    },
  ],
  version: "1.0",
};

const pageUsingIt = {
  version: "2.0",
  theme: { brand: "default", mode: "light" },
  sections: [{ id: "sec_1", component: composite.id, props: { title: "I am placed" } }],
};

test.describe("deleting a component in use", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => {
        if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
      },
      ["sandy-composites", JSON.stringify([composite])],
    );
    await page.goto(`/sandbox?s=${encodeState(pageUsingIt)}`);
    await page.getByTitle("Open component library").click();
    await page.getByTitle("Delete Placed Card").click();
  });

  test("says what it will break before doing it", async ({ page }) => {
    const confirm = page.getByRole("dialog", { name: /Delete "Placed Card"/ });

    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText("1 section on the current page");
    await expect(confirm).toContainText("cannot be undone");
  });

  test("cancelling keeps the component and the page intact", async ({ page }) => {
    await page
      .getByRole("dialog", { name: /Delete "Placed Card"/ })
      .getByRole("button", { name: "Cancel", exact: true })
      .click();

    await expect(page.getByRole("dialog", { name: /Delete/ })).toHaveCount(0);
    await expect(page.getByTitle("Delete Placed Card")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".sandy-preview").getByText(/Unknown component/i)).toHaveCount(0);
  });

  test("confirming deletes it", async ({ page }) => {
    await page
      .getByRole("dialog", { name: /Delete "Placed Card"/ })
      .getByRole("button", { name: "Delete", exact: true })
      .click();

    await expect(page.getByTitle("Delete Placed Card")).toHaveCount(0);
  });
});

test.describe("closing the builder with unsaved work", () => {
  test("Escape asks before discarding", async ({ page }) => {
    await page.goto("/sandbox");
    await page.getByTitle("Create custom component").click();
    const builder = page.getByRole("dialog", { name: "Component builder" });
    await builder.getByRole("button", { name: "Heading" }).click();

    await page.keyboard.press("Escape");

    const confirm = page.getByRole("dialog", { name: "Discard unsaved changes?" });
    await expect(confirm).toBeVisible();

    // Cancelling returns to the builder with the work still there.
    await page
      .getByRole("dialog", { name: "Discard unsaved changes?" })
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(builder).toBeVisible();
    await expect(builder.getByText("Node Properties", { exact: true })).toBeVisible();
  });

  test("Escape closes immediately when there is nothing to lose", async ({ page }) => {
    await page.goto("/sandbox");
    await page.getByTitle("Create custom component").click();
    const builder = page.getByRole("dialog", { name: "Component builder" });

    await page.keyboard.press("Escape");

    await expect(builder).toBeHidden();
    await expect(page.getByRole("dialog", { name: "Discard unsaved changes?" })).toHaveCount(0);
  });

  test("discarding actually closes", async ({ page }) => {
    await page.goto("/sandbox");
    await page.getByTitle("Create custom component").click();
    const builder = page.getByRole("dialog", { name: "Component builder" });
    await builder.getByRole("button", { name: "Heading" }).click();

    await page.keyboard.press("Escape");
    await page
      .getByRole("dialog", { name: "Discard unsaved changes?" })
      .getByRole("button", { name: "Discard", exact: true })
      .click();

    await expect(builder).toBeHidden();
  });
});
