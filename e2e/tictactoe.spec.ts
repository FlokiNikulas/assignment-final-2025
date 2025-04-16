import { test, expect, Page } from '@playwright/test';

async function countGames(page: Page) {
  await page.waitForTimeout(500);
  return await page.locator('ul > li').count();
}

// Clear all games before each test
test.beforeEach(async ({ page, request }) => {
  const response = await request.get('/api/games');
  const games = await response.json();

  for (const game of games) {
    await request.delete(`/api/games/${game.id}`);
  }

  await page.goto('/');
});

// Clean up after each test as well (optional, for safety)
test.afterEach(async ({ request }) => {
  const response = await request.get('/api/games');
  const games = await response.json();

  for (const game of games) {
    await request.delete(`/api/games/${game.id}`);
  }
});

test('should initialize with an empty game list', async ({ page }) => {
  await expect(await countGames(page)).toBe(0);
});

test('should create a new Tic-Tac-Toe game', async ({ page }) => {
  await page.goto('/');
  await page.fill("input[placeholder='❌ Your Name (Optional)']", 'Alice');
  await page.fill("input[placeholder='⭕ Opponent Name (Optional)']", 'Bob');
  await page.click("button:text('Start Game')");
});

test('should play a move in the Tic-Tac-Toe game', async ({ page }) => {
  await page.fill("input[placeholder='❌ Your Name (Optional)']", 'Alice');
  await page.fill("input[placeholder='⭕ Opponent Name (Optional)']", 'Bob');
  await page.click("button:text('Start Game')");

  // Wait for board to load
  await page.waitForSelector('.Board_container__VfdJF', { timeout: 5000 });
  const boardCells = page.locator('.Cell_cell__6Ors9');

  // Click the first cell
  const firstCell = boardCells.nth(0);
  await firstCell.click({ force: true });

  // Verify the move is registered
  await expect(firstCell).toHaveText('❌');
});

test('should detect a win', async ({ page }) => {
  await page.fill("input[placeholder='❌ Your Name (Optional)']", 'Alice');
  await page.fill("input[placeholder='⭕ Opponent Name (Optional)']", 'Bob');
  await page.click("button:text('Start Game')");

  // Wait for board to load
  await page.waitForSelector('.Board_container__VfdJF', { timeout: 5000 });
  const boardCells = page.locator('.Cell_cell__6Ors9');
  await expect(boardCells).toHaveCount(9);

  // Click cells for a winning move sequence
  await boardCells.nth(0).click({ force: true });
  await page.waitForTimeout(200);

  await boardCells.nth(3).click({ force: true });
  await page.waitForTimeout(200);

  await boardCells.nth(1).click({ force: true });
  await page.waitForTimeout(200);

  await boardCells.nth(4).click({ force: true });
  await page.waitForTimeout(200);

  await boardCells.nth(2).click({ force: true });
  await page.waitForTimeout(500);

  await expect(page.locator('h1')).toHaveText('❌ Player 1  Won');
});

test('should show all past games in the game list', async ({ page }) => {
  await page.click('text=See all games');
  await page.waitForURL('**/games', { timeout: 5000 });
  await page.waitForTimeout(500);

  const gameCount = await page.locator("a[href^='/game/']").count();
  expect(gameCount).toBeGreaterThan(0);
});

test('should be able to select played game', async ({ page }) => {
  await page.click('text=See all games');
  await page.waitForURL('**/games', { timeout: 5000 });
  await page.waitForTimeout(500);

  const gameLinks = page.locator("a[href^='/game/']");
  const gameCount = await gameLinks.count();
  expect(gameCount).toBeGreaterThan(0);

  await gameLinks.first().click();
  await page.waitForURL('**/game/*', { timeout: 5000 });

  const currentUrl = page.url();
  expect(currentUrl).toMatch(/\/game\/[a-zA-Z0-9-]+/);
});
