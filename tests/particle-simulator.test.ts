import { test, expect } from '@playwright/test';

test.describe('Particle Simulator', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
    // Add a short wait to ensure app is rendered
    await page.waitForTimeout(1000);
  });

  test('should render the particle simulator with initial particles', async ({ page }) => {
    // Check that the canvas and control panel exist
    await expect(page.locator('[data-testid="simulator-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="particle-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="control-panel"]')).toBeVisible();

    // Wait for canvas to be initialized with particles (checking if canvas is not empty)
    const canvas = page.locator('[data-testid="particle-canvas"]');
    await expect(canvas).toBeVisible();

    // Since we can't directly check the canvas content with Playwright, we'll verify
    // that the initial controls have the expected values
    await expect(page.locator('[data-testid="particle-count-slider"]')).toHaveValue('100');
    await expect(page.locator('[data-testid="gravity-slider"]')).toHaveValue('5');
  });

  test('should toggle control panel visibility', async ({ page }) => {
    // Control panel should be visible by default
    await expect(page.locator('[data-testid="control-panel"]')).toBeVisible();

    // Click the toggle button
    await page.locator('[data-testid="toggle-controls"]').click();

    // Control panel should be hidden
    await expect(page.locator('[data-testid="control-panel"]')).not.toBeVisible();

    // Click again to show
    await page.locator('[data-testid="toggle-controls"]').click();

    // Control panel should be visible again
    await expect(page.locator('[data-testid="control-panel"]')).toBeVisible();
  });

  test('should update particle count when slider is adjusted', async ({ page }) => {
    // Get the initial slider value
    const initialValue = await page.locator('[data-testid="particle-count-slider"]').inputValue();
    expect(initialValue).toBe('100');

    // Change the slider value
    await page.locator('[data-testid="particle-count-slider"]').fill('200');
    await page.locator('[data-testid="particle-count-slider"]').dispatchEvent('change');

    // Verify the slider shows the new value
    await expect(page.locator('[data-testid="particle-count-slider"]')).toHaveValue('200');
  });

  test('should change color mode', async ({ page }) => {
    // Initial color mode should be velocity
    await expect(page.locator('[data-testid="color-mode-select"]')).toHaveValue('velocity');

    // Change to solid color
    await page.locator('[data-testid="color-mode-select"]').selectOption('solid');

    // Color picker should now be visible
    await expect(page.locator('[data-testid="color-picker"]')).toBeVisible();

    // Change to random colors
    await page.locator('[data-testid="color-mode-select"]').selectOption('random');

    // Color picker should be hidden
    await expect(page.locator('[data-testid="color-picker"]')).not.toBeVisible();
  });

  test('should toggle particle trails', async ({ page }) => {
    // Trails should be enabled by default
    await expect(page.locator('[data-testid="show-trails-checkbox"]')).toBeChecked();

    // Disable trails
    await page.locator('[data-testid="show-trails-checkbox"]').click();

    // Checkbox should be unchecked
    await expect(page.locator('[data-testid="show-trails-checkbox"]')).not.toBeChecked();

    // Enable trails again
    await page.locator('[data-testid="show-trails-checkbox"]').click();

    // Checkbox should be checked
    await expect(page.locator('[data-testid="show-trails-checkbox"]')).toBeChecked();
  });

  test('should adjust physics parameters', async ({ page }) => {
    // Test gravity slider
    await page.locator('[data-testid="gravity-slider"]').fill('10');
    await page.locator('[data-testid="gravity-slider"]').dispatchEvent('change');
    await expect(page.locator('[data-testid="gravity-slider"]')).toHaveValue('10');

    // Test friction slider
    await page.locator('[data-testid="friction-slider"]').fill('5');
    await page.locator('[data-testid="friction-slider"]').dispatchEvent('change');
    await expect(page.locator('[data-testid="friction-slider"]')).toHaveValue('5');

    // Test elasticity slider
    await page.locator('[data-testid="elasticity-slider"]').fill('50');
    await page.locator('[data-testid="elasticity-slider"]').dispatchEvent('change');
    await expect(page.locator('[data-testid="elasticity-slider"]')).toHaveValue('50');
  });

  test('should reset simulation when reset button is clicked', async ({ page }) => {
    // Change some parameters
    await page.locator('[data-testid="particle-count-slider"]').fill('200');
    await page.locator('[data-testid="particle-count-slider"]').dispatchEvent('change');
    await page.locator('[data-testid="gravity-slider"]').fill('10');
    await page.locator('[data-testid="gravity-slider"]').dispatchEvent('change');

    // First, make sure to scroll the reset button into view
    const resetButton = page.locator('[data-testid="reset-button"]');
    await resetButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Small wait to ensure the button is scrolled into view

    // Now click the reset button
    await resetButton.click({ force: true });

    // Parameters should remain at their set values (reset just resets the particle positions, not the controls)
    await expect(page.locator('[data-testid="particle-count-slider"]')).toHaveValue('200');
    await expect(page.locator('[data-testid="gravity-slider"]')).toHaveValue('10');
  });
});
