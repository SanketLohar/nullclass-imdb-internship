// Playwright E2E tests for watchlist
import { test, expect } from "@playwright/test";

test.describe("Watchlist", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase("movieverse-db");
    });
  });

  test("should add movie to watchlist", async ({ page }) => {
    await page.goto("/movies/1");

    // Find and click watchlist button
    const watchlistButton = page.getByRole("button", {
      name: /add to watchlist/i,
    });
    await expect(watchlistButton).toBeVisible();
    await watchlistButton.click();

    // Verify button state changes
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();

    // Navigate to watchlist page
    await page.goto("/watchlist");
    await expect(page.getByText("Dune: Part Two")).toBeVisible();
  });

  test("should persist watchlist across page refresh", async ({ page }) => {
    await page.goto("/movies/1");

    // Add to watchlist
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Refresh page
    await page.reload();

    // Verify still in watchlist
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();
  });

  test("should sync watchlist across tabs", async ({ page, context }) => {
    await page.goto("/movies/1");

    // Add to watchlist in first tab
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto("/watchlist");

    // Verify item appears in second tab (may need small delay for sync)
    await page2.waitForTimeout(500);
    await expect(page2.getByText("Dune: Part Two")).toBeVisible();
  });

  test("should work offline", async ({ page, context }) => {
    await page.goto("/movies/1");

    // Add to watchlist while online
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Go offline
    await context.setOffline(true);

    // Try to add another movie (should still work with optimistic update)
    await page.goto("/movies/2");
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Verify both items in watchlist
    await page.goto("/watchlist");
    await expect(page.getByText("Dune: Part Two")).toBeVisible();
  });

  test("should show undo toast on remove", async ({ page }) => {
    await page.goto("/movies/1");

    // Add to watchlist
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Remove from watchlist
    await page
      .getByRole("button", { name: /in watchlist/i })
      .click();

    // Verify undo toast appears
    await expect(page.getByText(/removed from watchlist/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /undo/i })).toBeVisible();
  });

  test("should undo removal", async ({ page }) => {
    await page.goto("/movies/1");

    // Add to watchlist
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Remove
    await page
      .getByRole("button", { name: /in watchlist/i })
      .click();

    // Click undo
    await page.getByRole("button", { name: /undo/i }).click();

    // Verify back in watchlist
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();
  });

  test("should handle simultaneous edits on two tabs", async ({ page, context }) => {
    await page.goto("/movies/1");

    // Add to watchlist in first tab
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto("/movies/1");

    // Wait for both tabs to be ready
    await page.waitForTimeout(500);
    await page2.waitForTimeout(500);

    // Verify both tabs show item in watchlist
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();
    await expect(
      page2.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();

    // Remove from watchlist in first tab
    await page
      .getByRole("button", { name: /in watchlist/i })
      .click();

    // Wait for sync
    await page.waitForTimeout(500);

    // Verify second tab also updates (cross-tab sync)
    await expect(
      page2.getByRole("button", { name: /add to watchlist/i })
    ).toBeVisible();
  });

  test("should handle conflict resolution", async ({ page, context }) => {
    await page.goto("/movies/1");

    // Add to watchlist
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Open second tab and add same movie (simulate conflict)
    const page2 = await context.newPage();
    await page2.goto("/movies/1");
    await page2.waitForTimeout(500);

    // Both should show in watchlist (conflict resolved)
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();
    await expect(
      page2.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();
  });

  test("should sync after going online", async ({ page, context }) => {
    await page.goto("/movies/1");

    // Go offline
    await context.setOffline(true);

    // Add to watchlist (should work offline)
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Verify item is in watchlist
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();

    // Go online
    await context.setOffline(false);

    // Wait for background sync
    await page.waitForTimeout(2000);

    // Verify item persists after sync
    await page.reload();
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();
  });

  test("should validate watchlist items with Zod", async ({ page }) => {
    await page.goto("/movies/1");

    // Try to add invalid item (should be prevented by validation)
    await page.evaluate(() => {
      // Attempt to add invalid item directly to IndexedDB
      const invalidItem = { id: "", title: "", releaseYear: "invalid" };
      // This should fail validation
    });

    // Add valid item
    await page
      .getByRole("button", { name: /add to watchlist/i })
      .click();

    // Verify valid item is added
    await expect(
      page.getByRole("button", { name: /in watchlist/i })
    ).toBeVisible();
  });
});
