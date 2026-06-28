import { test, expect } from "@playwright/test";

// The prompt-to-envelope flow is exercised end-to-end with the /api/generate
// route stubbed, so the test is deterministic and spends no model tokens. It
// verifies the wiring: capability gate -> prompt -> editor fill -> preview render.

const generatedPage = {
  version: "2.0",
  theme: { brand: "default", mode: "light" },
  sections: [
    {
      id: "sec_1",
      component: "HeroBanner",
      props: { title: "Generated Banking Home", subtitle: "From a prompt", align: "left" },
    },
  ],
};

test.describe("Generate from prompt", () => {
  test("generates a page and renders it in the preview", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            page: generatedPage,
            validation: { success: true, sections: [], renderItems: [], errors: [] },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ available: true }),
        });
      }
    });

    await page.goto("/sandbox");

    // The Generate action only appears when the capability probe says available.
    const trigger = page.getByRole("button", { name: "Generate" });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const textarea = page.getByPlaceholder(/Describe the screen/i);
    await expect(textarea).toBeVisible();
    await textarea.fill("a banking home screen with a hero");
    await textarea.press("ControlOrMeta+Enter");

    // The generated content flows through the normal validate -> render pipeline.
    const preview = page.locator(".sandy-preview");
    await expect(preview.getByText("Generated Banking Home")).toBeVisible();
  });

  test("hides the Generate action when generation is unavailable", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ available: false }),
      });
    });

    await page.goto("/sandbox");
    await expect(page.locator(".sandy-preview")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate" })).toHaveCount(0);
  });
});
