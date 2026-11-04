import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.FINGERFOX_BASE_URL ?? "http://localhost:3000";
const outputDir = join(process.cwd(), "docs", "screenshots");
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  for (const colorScheme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("fingerfox-consent-v1", "rejected"));
    await page.reload({ waitUntil: "networkidle" });

    await page.goto(`${baseUrl}/settings`, { waitUntil: "networkidle" });
    const themeSelect = page.getByLabel("Appearance");
    const appearances = {};
    for (const preference of ["light", "dark", "system"]) {
      await themeSelect.selectOption(preference);
      const appliedTheme = await page.locator("html").getAttribute("data-theme");
      if (appliedTheme !== preference) throw new Error(`Theme selector failed to apply ${preference}`);
      if (preference !== "system") appearances[preference] = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
    }
    if (appearances.light === appearances.dark) throw new Error("Light and Dark preferences use the same page background color");
    await themeSelect.selectOption("dark");
    await page.reload({ waitUntil: "networkidle" });
    if (await page.locator("html").getAttribute("data-theme") !== "dark") throw new Error("Theme preference did not persist after reload");
    await page.getByLabel("Appearance").selectOption("system");

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(outputDir, `landing-${colorScheme}.png`), fullPage: true });
    await page.goto(`${baseUrl}/games`, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(outputDir, `catalog-${colorScheme}.png`), fullPage: true });
    await page.goto(`${baseUrl}/daily`, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(outputDir, `daily-${colorScheme}.png`), fullPage: true });
    await page.goto(`${baseUrl}/games/zen-test`, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(outputDir, `game-${colorScheme}.png`), fullPage: true });

    await page.clock.install();
    await page.getByRole("button", { name: /start round/i }).click();
    const prompt = await page.locator(".typing-area span").evaluateAll((nodes) => nodes.map((node) => node.textContent ?? "").join(""));
    await page.keyboard.type(prompt.slice(0, 70), { delay: 1 });
    await page.clock.fastForward(61_000);
    await page.getByRole("heading", { name: /nice work/i }).waitFor();
    await page.screenshot({ path: join(outputDir, `results-${colorScheme}.png`), fullPage: true });
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 640 });
      const resultWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (resultWidth > width) throw new Error(`/games/zen-test results overflow at ${width}px in ${colorScheme} mode: ${resultWidth}px`);
    }

    await page.goto(`${baseUrl}/leaderboard`, { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: join(outputDir, `leaderboard-${colorScheme}.png`), fullPage: true });

    for (const slug of ["zen-test", "key-forge", "word-rain", "star-blaster", "race-day", "night-watch", "slice", "lane-runner", "maze-keys", "express-rush", "defuse"]) {
      await page.goto(`${baseUrl}/games/${slug}`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /start round/i }).click();
      await page.locator(".mechanic-instructions").waitFor();
      if (slug === "word-rain" || slug === "star-blaster") await page.locator(".falling-target").nth(4).waitFor();
      if (slug === "maze-keys") await page.getByRole("button", { name: "Move up" }).waitFor();
      await page.screenshot({ path: join(outputDir, `game-mode-${slug}-${colorScheme}.png`), fullPage: true });
    }

    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 640 });
      for (const route of ["/", "/games", "/daily", "/games/zen-test", "/leaderboard"]) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        if (documentWidth > width) throw new Error(`${route} overflows at ${width}px in ${colorScheme} mode: ${documentWidth}px`);
      }
    }
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(outputDir, `landing-mobile-${colorScheme}.png`), fullPage: true });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Screenshots saved to ${outputDir}`);
