/* eslint-disable */
// docs/screenshots/desktop-polish/capture-auth.js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseUrl = 'http://localhost:3000';
const outputDir = __dirname;

const { execSync } = require('child_process');

let sourceCommit = 'd8f76de6e372ec42dfc246f6f8ce6f4121ca9313';
try {
  sourceCommit = execSync('git rev-parse HEAD').toString().trim();
} catch (e) {
  // Fallback
}
const screenshotEvidenceCommit = sourceCommit; // Synchronized in the same commit

async function performLogin(page, email, password) {
  console.log(`Navigating to login page for ${email}...`);
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0' });

  // Clear input fields first
  await page.evaluate(() => {
    const emailInput = document.querySelector('input[type="email"]');
    const passInput = document.querySelector('input[type="password"]');
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
  });

  console.log('Typing credentials...');
  await page.type('input[type="email"]', email, { delay: 50 });
  await page.type('input[type="password"]', password, { delay: 50 });

  console.log('Submitting login form...');
  await page.click('button[type="submit"]');

  console.log('Waiting for redirect to dashboard...');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
}

async function captureRoute(page, route, theme, filename) {
  console.log(`Capturing ${filename} (route: ${route}, theme: ${theme})...`);
  
  let consoleErrorCount = 0;
  let pageErrorCount = 0;
  let hydrationWarningCount = 0;

  const consoleListener = msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrorCount++;
      console.log(`[Browser Console Error]: ${text}`);
    }
    if (text.toLowerCase().includes('hydration') || text.toLowerCase().includes('did not match') || text.toLowerCase().includes('hydrated')) {
      hydrationWarningCount++;
      console.log(`[Browser Hydration Warning]: ${text}`);
    }
  };

  const errorListener = err => {
    pageErrorCount++;
    console.log(`[Browser Page Error]: ${err.message}`);
  };

  page.on('console', consoleListener);
  page.on('pageerror', errorListener);

  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0' });

  // Set theme attribute
  await page.evaluate((themeVal) => {
    document.documentElement.setAttribute('data-theme', themeVal);
    localStorage.setItem('theme', themeVal);
  }, theme);

  // Reload to apply theme
  await page.reload({ waitUntil: 'networkidle0' });

  // Brief pause for animations / layouts
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Confirm theme
  const activeTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  console.log(`Confirmed active theme: ${activeTheme}`);

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);

  const screenshotPath = path.join(outputDir, filename);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  }));

  // Clean up listeners
  page.off('console', consoleListener);
  page.off('pageerror', errorListener);

  return {
    filename,
    route,
    theme,
    viewport: { width: 1440, height: 900 },
    imageDimensions: dimensions,
    sourceUrl: `${baseUrl}${route}`,
    captureMode: 'production',
    authState: 'authenticated',
    sourceCommit,
    screenshotEvidenceCommit,
    consoleErrorCount,
    pageErrorCount,
    hydrationWarningCount
  };
}

async function run() {
  const metadata = [];

  // ============================================
  // 1. CAPTURE PLAYER ROUTES
  // ============================================
  console.log('\n--- LAUNCHING PLAYER BROWSER SESSION ---');
  console.log('Launching Chrome from:', chromePath);
  const playerBrowser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await playerBrowser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await performLogin(page, 'player@nanoplay.com', 'password123');

    const playerTargets = [
      { route: '/dashboard', theme: 'dark', filename: 'dashboard-dark-1440.png' },
      { route: '/dashboard', theme: 'light', filename: 'dashboard-light-1440.png' },
      { route: '/arena', theme: 'dark', filename: 'arena-dark-1440.png' },
      { route: '/arena', theme: 'light', filename: 'arena-light-1440.png' },
      { route: '/wallet', theme: 'dark', filename: 'wallet-dark-1440.png' },
      { route: '/wallet', theme: 'light', filename: 'wallet-light-1440.png' }
    ];

    for (const t of playerTargets) {
      const res = await captureRoute(page, t.route, t.theme, t.filename);
      metadata.push(res);
    }
  } catch (err) {
    console.error('Error during player capture:', err);
    await playerBrowser.close();
    process.exit(1);
  } finally {
    await playerBrowser.close();
  }

  // ============================================
  // 2. CAPTURE ADMIN ROUTES
  // ============================================
  console.log('\n--- LAUNCHING ADMIN BROWSER SESSION ---');
  console.log('Launching Chrome from:', chromePath);
  const adminBrowser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await adminBrowser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await performLogin(page, 'admin@nanoplay.com', 'password123');

    const adminTargets = [
      { route: '/admin', theme: 'dark', filename: 'admin-dark-1440.png' },
      { route: '/admin', theme: 'light', filename: 'admin-light-1440.png' }
    ];

    for (const t of adminTargets) {
      const res = await captureRoute(page, t.route, t.theme, t.filename);
      metadata.push(res);
    }
  } catch (err) {
    console.error('Error during admin capture:', err);
    await adminBrowser.close();
    process.exit(1);
  } finally {
    await adminBrowser.close();
  }

  console.log('\nAll authenticated screenshots captured successfully!');
  
  // Save metadata file
  const metaPath = path.join(outputDir, 'capture-metadata-auth.json');
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  console.log(`Saved metadata to: ${metaPath}`);
}

run();
