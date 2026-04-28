import { HttpError } from './errors';

export interface CoreUser {
  id: number;
  email: string;
  passwordHash: string;
}

interface RequestOptions {
  method: 'GET' | 'POST';
  body?: unknown;
  allowNotFound?: boolean;
}

interface UpsertCoreUserInput {
  email: string;
  passwordHash: string;
}

export class CoreClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
  ) {}

  findUserByEmail(email: string): Promise<CoreUser | null> {
    const url = new URL('/internal/auth/users/by-email', this.baseUrl);

    url.searchParams.set('email', email);

    return this.request<CoreUser>(url.toString(), {
      method: 'GET',
      allowNotFound: true,
    });
  }

  createPasswordUser(input: UpsertCoreUserInput): Promise<CoreUser> {
    return this.request<CoreUser>(
      new URL('/internal/auth/users/password', this.baseUrl).toString(),
      {
        method: 'POST',
        body: input,
      },
    ).then(ensureResponseBody);
  }

  upsertOAuthUser(input: UpsertCoreUserInput): Promise<CoreUser> {
    return this.request<CoreUser>(new URL('/internal/auth/users/oauth', this.baseUrl).toString(), {
      method: 'POST',
      body: input,
    }).then(ensureResponseBody);
  }

  private async request<T>(url: string, options: RequestOptions): Promise<T | null> {
    let response: Response;

    try {
      response = await fetch(url, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new HttpError(502, 'Failed to reach core service.', 'CORE_SERVICE_ERROR', {
        cause: readErrorMessage(error),
      });
    }

    if (options.allowNotFound && response.status === 404) {
      return null;
    }

    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      const message =
        readStringProperty(payload, 'message') ??
        `Core service request failed with status ${response.status}.`;

      throw new HttpError(response.status, message, 'CORE_SERVICE_ERROR', {
        payload,
        status: response.status,
      });
    }

    return payload as T;
  }
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    throw new HttpError(
      502,
      'Core service returned an invalid JSON response.',
      'CORE_SERVICE_ERROR',
    );
  }
}

function readStringProperty(payload: unknown, key: string): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidateValue = (payload as Record<string, unknown>)[key];

  return typeof candidateValue === 'string' ? candidateValue : null;
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

function ensureResponseBody<T>(value: T | null): T {
  if (value === null) {
    throw new HttpError(502, 'Core service returned an empty response.', 'CORE_SERVICE_ERROR');
  }

  return value;
}
