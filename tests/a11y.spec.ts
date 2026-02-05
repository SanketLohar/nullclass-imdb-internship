import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
    test('HomePage should not have any automatically detectable accessibility issues', async ({ page }) => {
        await page.goto('/');

        // Wait for content to load
        await page.waitForLoadState('domcontentloaded');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Movie Details should be accessible', async ({ page }) => {
        // Navigate to Home first to find a valid movie (avoids hardcoded IDs failing)
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        // Click the first movie card
        await page.locator('a[href^="/movies/"]').first().click({ force: true });

        // Wait for content to load - using semantic landmark for stability
        await page.waitForLoadState('domcontentloaded');
        await page.getByRole('heading', { level: 1 }).waitFor();

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Actor Profile should be accessible', async ({ page }) => {
        // Navigate to a known actor
        await page.goto('/actor/1');

        await page.waitForLoadState('domcontentloaded');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Watchlist page should be accessible', async ({ page }) => {
        await page.goto('/watchlist');

        await page.waitForLoadState('domcontentloaded');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
