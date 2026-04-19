export type HeaderValue = string | string[] | undefined;
export type HeadersLike = Record<string, HeaderValue>;

export type NormalizedException = {
  status: number;
  code: string;
  message: string | string[];
  details?: unknown;
};

export type RequestLike = {
  method: string;
  url: string;
  originalUrl?: string;
  headers?: HeadersLike;
  id?: string;
  requestId?: string;
  correlationId?: string;
};

export type ResponseLike = {
  status: (statusCode: number) => ResponseLike;
  json: (body: unknown) => void;
  statusCode?: number;
};

export type ExceptionResponseBody = {
  message?: string | string[];
  error?: unknown;
  code?: unknown;
  details?: unknown;
  status?: number;
  statusCode?: number;
};
