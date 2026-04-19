export type RequestLike = {
  method: string;
  url: string;
};

export type ResponseLike = {
  status: (statusCode: number) => ResponseLike;
  json: (body: unknown) => void;
  statusCode?: number;
};

export type ExceptionResponseBody = {
  message?: string | string[];
  error?: unknown;
};
