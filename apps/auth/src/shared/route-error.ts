export class RouteError extends Error {
  public readonly code: string;

  public readonly status: number;

  public constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'RouteError';
    this.status = status;
    this.code = code;
  }
}

export const createRouteError = (status: number, code: string, message: string): RouteError =>
  new RouteError(status, code, message);
