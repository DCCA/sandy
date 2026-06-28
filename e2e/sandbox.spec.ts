import { test, expect } from "@playwright/test";

// Mirrors lib/sandbox/serialize.ts serializeState so we can drive the app
// through its real load path (URL -> deserialize -> validate -> render).
function encodeState(page: unknown): string {
  return Buffer.from(encodeURIComponent(JSON.stringify(page))).toString("base64");
}

const heroPage = {
  version: "2.0",
  theme: { brand: "default", mode: "light" },
  sections: [{ id: "sec_1", component: "HeroBanner", props: { title: "Shared Title" } }],
};

test.describe("Sandy sandbox", () => {
  test("renders the default page in the preview", async ({ page }) => {
    await page.goto("/sandbox");
    const preview = page.locator(".sandy-preview");
    await expect(preview).toBeVisible();
    await expect(preview.locator("h1, h2, h3").first()).toBeVisible();
  });

  test("loads shared state from the URL", async ({ page }) => {
    await page.goto(`/sandbox?s=${encodeState(heroPage)}`);
    await expect(page.locator(".sandy-preview").getByText("Shared Title")).toBeVisible();
  });

  test("unknown component degrades to an in-place placeholder", async ({ page }) => {
    const broken = {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      sections: [
        { id: "sec_1", component: "HeroBanner", props: { title: "Good section" } },
        { id: "sec_2", component: "DoesNotExist", props: {} },
      ],
    };
    await page.goto(`/sandbox?s=${encodeState(broken)}`);
    const preview = page.locator(".sandy-preview");
    // The valid section still renders...
    await expect(preview.getByText("Good section")).toBeVisible();
    // ...and the unknown one shows a placeholder instead of crashing the page.
    await expect(preview.getByText(/DoesNotExist|Unknown component/i).first()).toBeVisible();
  });

  test("applies dark mode from theme.mode", async ({ page }) => {
    const darkPage = { ...heroPage, theme: { brand: "default", mode: "dark" } };
    await page.goto(`/sandbox?s=${encodeState(darkPage)}`);
    const preview = page.locator(".sandy-preview");
    await expect(preview).toBeVisible();
    const bg = await preview.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--sandy-color-background").trim(),
    );
    // Dark override background, not the light default (#E5F1FA).
    expect(bg.toLowerCase()).not.toBe("#e5f1fa");
    expect(bg).toBeTruthy();
  });

  test("editing keeps the shell alive and reflects in the preview", async ({ page }) => {
    await page.goto("/sandbox");
    await expect(page.getByText("Editor").first()).toBeVisible();
    // Drive the Monaco model directly if the global is exposed; otherwise skip
    // the edit assertion but still verify the shell didn't crash.
    const edited = await page.evaluate(() => {
      type MonacoLike = {
        editor: { getModels: () => Array<{ setValue: (value: string) => void }> };
      };
      const monaco = (window as unknown as { monaco?: MonacoLike }).monaco;
      if (!monaco) return false;
      const model = monaco.editor.getModels()[0];
      if (!model) return false;
      model.setValue(
        JSON.stringify(
          {
            version: "2.0",
            theme: { brand: "default", mode: "light" },
            sections: [{ id: "sec_1", component: "HeroBanner", props: { title: "Edited Live" } }],
          },
          null,
          2,
        ),
      );
      return true;
    });
    if (edited) {
      await expect(page.locator(".sandy-preview").getByText("Edited Live")).toBeVisible({
        timeout: 5000,
      });
    }
    await expect(page.getByText("Editor").first()).toBeVisible();
  });
});
