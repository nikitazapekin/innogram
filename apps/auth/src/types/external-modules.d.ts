declare module 'bcrypt' {
  export function hash(data: string, saltOrRounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'axios' {
  export type AxiosResponse<T = unknown> = {
    data: T;
    status: number;
  };

  export type AxiosRequestConfig = {
    params?: Record<string, string>;
  };

  export type AxiosInstance = {
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>>;
  };

  const axios: AxiosInstance;

  export default axios;
}

declare module 'express' {
  export type NextFunction = (error?: unknown) => void;

  export interface Request {
    body: unknown;
    method: string;
    originalUrl: string;
    path: string;
    query: Record<string, unknown>;
  }

  export interface Response {
    status(code: number): Response;
    json(body: unknown): Response;
    redirect(statusCode: number, url: string): Response;
    on(event: 'finish', listener: () => void): Response;
    statusCode: number;
  }

  export type RequestHandler = (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => unknown;

  export type ErrorRequestHandler = (
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction,
  ) => unknown;

  export interface Router {
    (request: any, response: any, next?: NextFunction): unknown;
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    use(...handlers: Array<RequestHandler | ErrorRequestHandler | Router>): Router;
  }

  export interface Express extends Router {}

  type JsonOptions = {
    limit?: string;
  };

  export interface ExpressModule {
    (): Express;
    Router(): Router;
    json(options?: JsonOptions): RequestHandler;
  }

  export function Router(): Router;

  const express: ExpressModule;

  export default express;
}
