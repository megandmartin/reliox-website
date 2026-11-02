import { test, expect } from '@playwright/test';

test('phone navigation closes on links and Escape returns focus', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /navigation/ });
  const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAccessibleName('Open navigation');
  await expect(navigation).not.toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAccessibleName('Close navigation');
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'The experience', exact: true }).click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAccessibleName('Open navigation');
  await expect(navigation).not.toBeVisible();
  await toggle.click();
  await navigation.getByRole('link', { name: 'Privacy', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAccessibleName('Open navigation');
  await expect(navigation).not.toBeVisible();
  await expect(toggle).toBeFocused();
});
