export type RequestLike = {
  method: string;
  url: string;
  originalUrl?: string;
  headers: {
    'x-request-id'?: string | string[];
    'x-correlation-id'?: string | string[];
    [key: string]: unknown;
  };
  requestId?: string;
  id?: string;
  correlationId?: string;
};

export type ResponseLike = {
  status: (statusCode: number) => ResponseLike;
  json: (body: unknown) => void;
  statusCode?: number;
};

export type ExceptionResponseBody = {
  statusCode?: number;
  status?: number;
  code?: string;
  details?: unknown;
  message?: string | string[];
  error?: unknown;
};

export type NormalizedException = {
  status: number;
  code: string;
  message: string | string[];
  details?: unknown;
};
