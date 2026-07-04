/* eslint-disable */
// docs/screenshots/desktop-polish/capture.js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseUrl = 'http://localhost:3000';
const outputDir = __dirname;

const targets = [
  { filename: 'homepage-dark-1440.png', route: '/', theme: 'dark', width: 1440, height: 900 },
  { filename: 'homepage-light-1440.png', route: '/', theme: 'light', width: 1440, height: 900 },
  { filename: 'rules-dark-1440.png', route: '/rules', theme: 'dark', width: 1440, height: 900 },
  { filename: 'rules-light-1440.png', route: '/rules', theme: 'light', width: 1440, height: 900 },
  { filename: 'winners-dark-1440.png', route: '/winners', theme: 'dark', width: 1440, height: 900 },
  { filename: 'winners-light-1440.png', route: '/winners', theme: 'light', width: 1440, height: 900 },
  { filename: 'desktop-boundary-1024.png', route: '/', theme: 'dark', width: 1024, height: 900 }
];

async function run() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const metadata = [];
  const sourceCommit = '485762ed3e3fd62e86a7950c565ff3c101e5a910';

  try {
    for (const t of targets) {
      console.log(`Capturing ${t.filename} (route: ${t.route}, theme: ${t.theme})...`);
      const page = await browser.newPage();
      
      let consoleErrorCount = 0;
      let pageErrorCount = 0;
      let hydrationWarningCount = 0;

      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
          consoleErrorCount++;
          console.log(`[Browser Console Error]: ${text}`);
        }
        if (text.toLowerCase().includes('hydration') || text.toLowerCase().includes('did not match') || text.toLowerCase().includes('hydrated')) {
          hydrationWarningCount++;
          console.log(`[Browser Hydration Warning]: ${text}`);
        }
      });

      page.on('pageerror', err => {
        pageErrorCount++;
        console.log(`[Browser Page Error]: ${err.message}`);
      });

      // Set larger navigation timeout for cold compiles
      page.setDefaultNavigationTimeout(90000);
      
      // Set viewport
      await page.setViewport({ width: t.width, height: t.height });

      // Navigate
      const url = `${baseUrl}${t.route}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Wait 15 seconds on the very first page request to allow compile to complete
      if (t === targets[0]) {
        console.log('Waiting 15 seconds for initial cold compilation...');
        await new Promise(resolve => setTimeout(resolve, 15000));
      }

      // Set theme attribute
      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }, t.theme);

      // Brief reload to ensure React/Next.js and styles initialize with the set theme
      await page.reload({ waitUntil: 'domcontentloaded' });

      // Wait 3 seconds for compilation/animations after reload
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Double check theme after reload
      const activeTheme = await page.evaluate(() => document.documentElement.dataset.theme);
      console.log(`Confirmed active theme: ${activeTheme}`);

      // Wait for fonts
      await page.evaluate(() => document.fonts.ready);

      const screenshotPath = path.join(outputDir, t.filename);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      // Get image dimensions to confirm
      const dimensions = await page.evaluate(() => ({
        width: window.innerWidth,
        height: document.documentElement.scrollHeight
      }));

      console.log(`Saved ${t.filename} (${t.width}x${dimensions.height})`);

      metadata.push({
        filename: t.filename,
        route: t.route,
        theme: t.theme,
        viewport: {
          width: t.width,
          height: t.height
        },
        imageDimensions: {
          width: t.width,
          height: dimensions.height
        },
        sourceUrl: url,
        captureMode: 'production',
        authState: 'unauthenticated',
        sourceCommit: sourceCommit,
        screenshotEvidenceCommit: '',
        consoleErrorCount: consoleErrorCount,
        pageErrorCount: pageErrorCount,
        hydrationWarningCount: hydrationWarningCount
      });

      await page.close();
    }

    // Add uncaptured authenticated routes to metadata
    const authRoutes = ['/arena', '/dashboard', '/wallet', '/admin'];
    for (const route of authRoutes) {
      metadata.push({
        filename: `${route.substring(1)}-dark-1440.png`,
        route: route,
        theme: 'dark',
        viewport: { width: 1440, height: 900 },
        imageDimensions: null,
        sourceUrl: `${baseUrl}${route}`,
        captureMode: 'production',
        authState: 'authenticated',
        sourceCommit: sourceCommit,
        screenshotEvidenceCommit: '',
        status: 'Screenshot unavailable — valid authenticated session not available.'
      });
      metadata.push({
        filename: `${route.substring(1)}-light-1440.png`,
        route: route,
        theme: 'light',
        viewport: { width: 1440, height: 900 },
        imageDimensions: null,
        sourceUrl: `${baseUrl}${route}`,
        captureMode: 'production',
        authState: 'authenticated',
        sourceCommit: sourceCommit,
        screenshotEvidenceCommit: '',
        status: 'Screenshot unavailable — valid authenticated session not available.'
      });
    }

    const metadataPath = path.join(outputDir, 'capture-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('Saved metadata to:', metadataPath);

  } catch (error) {
    console.error('Error during capture:', error);
  } finally {
    await browser.close();
  }
}

run();
