import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const artifactDir = '/Users/aman/.gemini/antigravity-ide/brain/b6130bcc-af58-412c-ba57-f2e7334cbbe5';

async function runTest() {
  console.log('🚀 Starting ZeroDay UI Automated Click-through Test...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

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
    // 1. Load Overview
    console.log('\n--- Step 1: Navigating to Overview ---');
    await page.goto('http://localhost:5173/?screen=overview', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Check Grid Layout
    const railWidth = await page.$eval('aside', el => el.offsetWidth);
    assert(railWidth === 72, `Left rail is 72px icon-only rail (actual: ${railWidth}px)`);

    const topBarHeight = await page.$eval('header', el => el.offsetHeight);
    assert(topBarHeight === 56, `Top bar height is 56px (actual: ${topBarHeight}px)`);

    const incidentStrip = await page.$('div[role="alert"]');
    assert(incidentStrip !== null, 'Incident strip is rendered in-flow as grid row');

    // Check Priority Queue
    const queueHeader = await page.$eval('aside h2', el => el.textContent.trim());
    assert(queueHeader.includes('Priority queue'), `Right column displays Priority Queue (actual: "${queueHeader}")`);

    // 2. Click on a ward in the Priority Queue
    console.log('\n--- Step 2: Clicking Ward in Priority Queue ---');
    await page.click('#overview-right-column [data-ward-id="ward-rampur-4b"]');
    await new Promise(r => setTimeout(r, 400));

    const detailHeader = await page.$eval('#overview-right-column h2', el => el.textContent.trim());
    assert(detailHeader.includes('Rampur Basin 4B'), `Right column switched to Ward Detail view: "${detailHeader}"`);

    const backButton = await page.$('#btn-back-to-queue');
    assert(backButton !== null, 'Back button is rendered in ward detail header');

    await page.screenshot({ path: path.join(artifactDir, 'test_overview_ward_detail.png') });

    // 3. Click back button to return to Priority Queue
    console.log('\n--- Step 3: Clicking Back to Priority Queue ---');
    await page.click('#btn-back-to-queue');
    await new Promise(r => setTimeout(r, 400));

    const queueHeaderAgain = await page.$eval('#overview-right-column h2', el => el.textContent.trim());
    assert(queueHeaderAgain.includes('Priority queue'), `Right column switched back to Priority Queue: "${queueHeaderAgain}"`);

    // 4. Click Search Pill to open Command Palette
    console.log('\n--- Step 4: Testing Command Palette ---');
    await page.click('header button[aria-label*="Search"]');
    await new Promise(r => setTimeout(r, 400));

    const cmdDialog = await page.$('div[role="dialog"]');
    assert(cmdDialog !== null, 'Command Palette Dialog opened');

    await page.type('div[role="dialog"] input', 'Rampur');
    await new Promise(r => setTimeout(r, 200));

    const cmdResults = await page.$eval('div[role="dialog"] [cmdk-list]', el => el.textContent);
    assert(cmdResults.includes('Rampur Basin 4B'), 'Command search filtered and displayed Rampur Basin 4B');

    await page.screenshot({ path: path.join(artifactDir, 'test_command_palette.png') });

    // 5. Press Escape to close Command Palette
    console.log('\n--- Step 5: Pressing Escape on Command Palette ---');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    const cmdDialogAfterEsc = await page.$('div[role="dialog"]');
    assert(cmdDialogAfterEsc === null, 'Command Palette cleanly closed on Escape');

    // 6. Test Health Popover
    console.log('\n--- Step 6: Testing System Health Popover ---');
    await page.click('header button[aria-label="System status"]');
    await new Promise(r => setTimeout(r, 300));

    const healthPopover = await page.$('[data-radix-popper-content-wrapper]');
    assert(healthPopover !== null, 'Health Popover opened');

    // Click on the map to dismiss popover (outside click)
    console.log('  Testing outside-click to dismiss health popover...');
    await page.mouse.click(400, 400);
    await new Promise(r => setTimeout(r, 300));

    const healthPopoverAfter = await page.$('[data-radix-popper-content-wrapper]');
    assert(healthPopoverAfter === null, 'Health Popover cleanly dismissed on outside click');

    // 7. Click through Left Rail Navigation items
    console.log('\n--- Step 7: Clicking Through All Left Rail Routes ---');
    const navItems = [
      { name: 'Regions', selector: 'aside button[aria-label="Regions"]', expect: 'Region Detail' },
      { name: 'Sensors', selector: 'aside button[aria-label="Sensors"]', expect: 'Sensor Telemetry' },
      { name: 'AI Risk Engine', selector: 'aside button[aria-label="AI Risk Engine"]', expect: 'AI Risk Engine' },
      { name: 'Gateway & Mesh', selector: 'aside button[aria-label="Gateway & Mesh"]', expect: 'Gateway & Mesh' },
      { name: 'Evacuation Planner', selector: 'aside button[aria-label="Evacuation Planner"]', expect: 'Evacuation Planner' },
      { name: 'Alert Control', selector: 'aside button[aria-label="Alert Control"]', expect: 'Alert Control' },
      { name: 'Community Reports', selector: 'aside button[aria-label="Community Reports"]', expect: 'Community Reports' },
      { name: 'Settings & Audit', selector: 'aside button[aria-label="Settings & Audit"]', expect: 'Settings & Audit' },
      { name: 'Overview', selector: 'aside button[aria-label="Overview"]', expect: 'Overview' },
    ];

    for (const nav of navItems) {
      await page.click(nav.selector);
      await new Promise(r => setTimeout(r, 350));

      const title = await page.$eval('header h1', el => el.textContent.trim());
      assert(title === nav.expect, `Navigated to ${nav.name} (Header title: "${title}")`);

      // Ensure no leftover dialogs or popovers exist
      const leftoverOverlays = await page.$$('[role="dialog"], [data-radix-popper-content-wrapper]');
      assert(leftoverOverlays.length === 0, `No leftover overlays visible on route "${nav.name}"`);
    }

    console.log(`\n🎉 Test Suite Completed! Results: ${passed} passed, ${failed} failed.`);

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTest();
