import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

const BASE_URL = process.env.CORE_BASE_URL;

async function createDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage');
  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

async function getJson(driver: WebDriver, url: string): Promise<unknown> {
  await driver.get(url);
  await driver.wait(until.elementLocated(By.tagName('body')), 10000);
  const text = await driver.executeScript<string>(
    'return document.body.innerText || document.documentElement.textContent',
  );

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

describe('Comments API (E2E)', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 30000);

  afterAll(async () => {
    await driver.quit();
  });

  it('GET /comments without auth should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/comments`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'UnauthorizedException');
  }, 30000);

  it('GET /comments/:id without auth should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/comments/99999`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'UnauthorizedException');
  }, 30000);

  it('GET /posts/:postId/comments without auth should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/posts/99999/comments`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'UnauthorizedException');
  }, 30000);
});

describe('Users additional endpoints (E2E)', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 30000);

  afterAll(async () => {
    await driver.quit();
  });

  it('GET /users/:id/posts should return a JSON array or error', async () => {
    const data = await getJson(driver, `${BASE_URL}/users/1/posts`);
    expect(
      Array.isArray(data) || (data !== null && typeof data === 'object' && 'success' in data),
    ).toBe(true);
  }, 30000);

  it('GET /users/:id/posts with invalid id should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/users/abc/posts`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'BadRequestException');
  }, 30000);
});

describe('Error response format (E2E)', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 30000);

  afterAll(async () => {
    await driver.quit();
  });

  it('error response should contain success, error, and path', async () => {
    const data = await getJson(driver, `${BASE_URL}/users/999999`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('path');
    expect(data).toHaveProperty('error.code');
    expect(data).toHaveProperty('error.message');
  }, 30000);

  it('error path should match the request URL', async () => {
    const data = await getJson(driver, `${BASE_URL}/users/abc`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('path', '/users/abc');
  }, 30000);
});
