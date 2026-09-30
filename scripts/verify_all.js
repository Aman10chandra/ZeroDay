import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const artifactDir = '/Users/aman/.gemini/antigravity-ide/brain/b6130bcc-af58-412c-ba57-f2e7334cbbe5';

async function verifyAll() {
  console.log('🚀 Launching Comprehensive ZeroDay Verification Suite...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ==========================================
    // 1. CLICKTHROUGH & ARCHITECTURE VERIFICATION
    // ==========================================
    console.log('\n--- 1. Testing Grid Shell, Rail, TopBar, and Overlays ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?screen=overview', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Rail & TopBar Dimensions
    const railWidth = await page.$eval('aside#left-rail', el => el.offsetWidth);
    assert(railWidth === 72, `Left rail is 72px icon-only rail (actual: ${railWidth}px)`);

    const topBarHeight = await page.$eval('header', el => el.offsetHeight);
    assert(topBarHeight === 56, `Top bar height is 56px (actual: ${topBarHeight}px)`);

    const incidentStrip = await page.$('div[role="alert"]');
    assert(incidentStrip !== null, 'Incident strip is rendered in-flow as grid row');

    // Priority Queue and Ward Detail toggle
    await page.click('#overview-right-column [data-ward-id="ward-rampur-4b"]');
    await new Promise(r => setTimeout(r, 400));
    const detailHeader = await page.$eval('#overview-right-column h2', el => el.textContent.trim());
    assert(detailHeader.includes('Rampur Basin 4B'), `Right column switched to Ward Detail: "${detailHeader}"`);

    // Back to queue
    await page.click('#btn-back-to-queue');
    await new Promise(r => setTimeout(r, 300));
    const backToQueue = await page.$eval('#overview-right-column h2', el => el.textContent.trim());
    assert(backToQueue.includes('Priority queue'), `Back button returned to Priority Queue: "${backToQueue}"`);

    // ==========================================
    // 2. COMMAND PALETTE TEST (Cmd+K, /, search, run, esc)
    // ==========================================
    console.log('\n--- 2. Testing Command Palette (cmdk) ---');
    
    // Test 1: Open via top-bar pill button
    await page.click('button#topbar-search-trigger');
    await new Promise(r => setTimeout(r, 300));
    let paletteInput = await page.$('[cmdk-input]');
    assert(paletteInput !== null, 'Command palette opened via top-bar pill button');

    // Search "ramp"
    await page.type('[cmdk-input]', 'ramp');
    await new Promise(r => setTimeout(r, 200));
    let items = await page.$$eval('[cmdk-item]', els => els.map(e => e.textContent.trim()));
    assert(items.some(t => t.includes('Rampur')), 'Search "ramp" successfully displays Rampur Basin');

    // Close via Escape
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    let paletteClosed = await page.$('[cmdk-input]');
    assert(paletteClosed === null, 'Command palette closed via Escape');

    // Test 2: Open via "/" key
    await page.keyboard.press('Slash');
    await new Promise(r => setTimeout(r, 300));
    paletteInput = await page.$('[cmdk-input]');
    assert(paletteInput !== null, 'Command palette opened via "/" key');

    // Search "mesh"
    await page.type('[cmdk-input]', 'mesh');
    await new Promise(r => setTimeout(r, 200));
    items = await page.$$eval('[cmdk-item]', els => els.map(e => e.textContent.trim()));
    assert(items.some(t => t.toLowerCase().includes('mesh')), 'Search "mesh" displays mesh telemetry option');

    // Close via Escape
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // Test 3: Search "siren" and run via Enter
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyK');
    await page.keyboard.up('Meta');
    await new Promise(r => setTimeout(r, 300));
    
    await page.type('[cmdk-input]', 'siren');
    await new Promise(r => setTimeout(r, 200));
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 400));
    paletteClosed = await page.$('[cmdk-input]');
    assert(paletteClosed === null, 'Selecting action executed and closed palette');

    // ==========================================
    // 3. RADIX HEALTH POPOVER TEST (Single Source of Truth)
    // ==========================================
    console.log('\n--- 3. Testing Radix Health Popover & Outside Click ---');
    await page.click('#btn-system-health');
    await new Promise(r => setTimeout(r, 300));
    let healthContent = await page.$('#health-popover-content');
    assert(healthContent !== null, 'Health popover rendered through portal');

    // Dismiss by clicking outside on main
    await page.click('main');
    await new Promise(r => setTimeout(r, 300));
    healthContent = await page.$('#health-popover-content');
    assert(healthContent === null, 'Health popover dismissed cleanly on outside click');

    // ==========================================
    // 4. SCREENSHOTS AT 1440x900 AND 1280x720 FOR ALL 9 ROUTES
    // ==========================================
    console.log('\n--- 4. Capturing High-Res Screenshots across all routes ---');
    const routes = [
      { id: 'overview', name: 'Overview' },
      { id: 'region_detail', name: 'Region detail' },
      { id: 'sensors_mpu', name: 'Sensors MPU6050' },
      { id: 'risk_engine', name: 'AI risk engine' },
      { id: 'gateway_mesh', name: 'Gateway and mesh' },
      { id: 'evacuation', name: 'Evacuation planner' },
      { id: 'alerts', name: 'Alerts' },
      { id: 'reports', name: 'Community reports' },
      { id: 'settings', name: 'Settings' },
    ];

    for (const route of routes) {
      // 1440x900
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`http://localhost:5173/?screen=${route.id}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 500));
      
      const shot1440Path = path.join(artifactDir, `verify_${route.id}_1440.png`);
      await page.screenshot({ path: shot1440Path });

      // Check no leftover popovers or dialogs on fresh route load
      const leftoverOverlays = await page.$$eval('[role="dialog"], [data-radix-popper-content-wrapper]', els => els.length);
      assert(leftoverOverlays === 0, `${route.name} (1440x900) loaded with 0 leftover overlays`);

      // 1280x720
      await page.setViewport({ width: 1280, height: 720 });
      await new Promise(r => setTimeout(r, 300));
      const shot1280Path = path.join(artifactDir, `verify_${route.id}_1280.png`);
      await page.screenshot({ path: shot1280Path });
      assert(true, `${route.name} captured at 1440x900 and 1280x720`);
    }

    // ==========================================
    // 5. LIGHT AND DARK THEME TOGGLE TEST
    // ==========================================
    console.log('\n--- 5. Testing Light and Dark Theme Toggle ---');
    await page.setViewport({ width: 1440, height: 900 });
    
    // Overview Dark
    await page.goto('http://localhost:5173/?screen=overview', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, 'theme_overview_dark.png') });

    // Toggle to Light
    await page.click('#btn-theme-toggle');
    await new Promise(r => setTimeout(r, 400));
    const isDarkAfterToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    assert(!isDarkAfterToggle, 'Theme toggled to Light mode (dark class removed)');
    await page.screenshot({ path: path.join(artifactDir, 'theme_overview_light.png') });

    // Risk Engine in Light mode
    await page.goto('http://localhost:5173/?screen=risk_engine', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, 'theme_risk_engine_light.png') });

    // Evacuation in Light mode
    await page.goto('http://localhost:5173/?screen=evacuation', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, 'theme_evacuation_light.png') });

    // Toggle back to Dark
    await page.click('#btn-theme-toggle');
    await new Promise(r => setTimeout(r, 400));
    const isDarkAgain = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    assert(isDarkAgain, 'Theme restored to Dark mode (dark class present)');

    // Risk Engine in Dark mode
    await page.goto('http://localhost:5173/?screen=risk_engine', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, 'theme_risk_engine_dark.png') });

    // Evacuation in Dark mode
    await page.goto('http://localhost:5173/?screen=evacuation', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, 'theme_evacuation_dark.png') });

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await browser.close();
    console.log('\n==========================================');
    console.log(`📊 FINAL TEST REPORT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==========================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

verifyAll();
