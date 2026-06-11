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

describe('Public API (E2E)', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 30000);

  afterAll(async () => {
    await driver.quit();
  });

  it('GET /users should return a JSON array', async () => {
    const data = await getJson(driver, `${BASE_URL}/users`);
    expect(Array.isArray(data)).toBe(true);
  }, 30000);

  it('GET /users/:id with invalid id should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/users/invalid`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'BadRequestException');
  }, 30000);

  it('GET /users/:id with non-existent id should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/users/999999`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'NotFoundException');
  }, 30000);

  it('GET /auth/user with unknown email should return null', async () => {
    const data = await getJson(driver, `${BASE_URL}/auth/user?email=nobody@example.com`);
    expect(data).toBeNull();
  }, 30000);
});

describe('Auth guard (E2E)', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 30000);

  afterAll(async () => {
    await driver.quit();
  });

  it('GET /posts without auth should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/posts`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'UnauthorizedException');
  }, 30000);

  it('GET /posts/1 without auth should return error', async () => {
    const data = await getJson(driver, `${BASE_URL}/posts/1`);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error.code', 'UnauthorizedException');
  }, 30000);
});
