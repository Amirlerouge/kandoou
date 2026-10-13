const { test, expect } = require('@playwright/test');

test('frontend file input updates url text input', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Navigate to Signup -> Creator Onboarding
  await page.click('#nav-btn-signup');
  await page.click('#role-card-creator');
  await page.click('#btn-role-next');

  // Fill required signup fields to proceed
  await page.fill('#input-signup-name', 'Test User');
  await page.fill('#input-signup-username', 'testuser');
  await page.fill('#input-signup-email', 'test@test.com');
  await page.fill('#input-signup-password', 'password');
  await page.click('button[type="submit"]');

  // Verify inputs are present
  const avatarFileInput = await page.locator('#creator-avatar-file');
  await expect(avatarFileInput).toBeVisible();

  // Create a dummy image file and upload
  const fs = require('fs');
  fs.writeFileSync('/tmp/test-image.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));

  await avatarFileInput.setInputFiles('/tmp/test-image.png');

  // Check if URL text input is updated
  const avatarUrlInput = await page.locator('#creator-avatar-url');
  const urlValue = await avatarUrlInput.inputValue();

  expect(urlValue).toContain('data:image/png;base64');
  console.log('Successfully updated input via file selection.');
});
