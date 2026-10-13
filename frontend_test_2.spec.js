const { test, expect } = require('@playwright/test');

test('studio file input updates url text input', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Login as creator
  await page.selectOption('#role-switcher-select', 'creator');

  // Go to studio
  await page.click('#nav-btn-studio');

  // Go to RGB THEME CUSTOMIZER tab
  await page.click('#tab-btn-theme');

  // Verify inputs are present
  const avatarFileInput = await page.locator('#studio-avatar-file');
  await expect(avatarFileInput).toBeVisible();

  // Create a dummy image file and upload
  const fs = require('fs');
  fs.writeFileSync('/tmp/test-image2.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));

  await avatarFileInput.setInputFiles('/tmp/test-image2.png');

  // Check if URL text input is updated
  const avatarUrlInput = await page.locator('#studio-avatar-url');
  const urlValue = await avatarUrlInput.inputValue();

  expect(urlValue).toContain('data:image/png;base64');
  console.log('Successfully updated studio input via file selection.');
});
