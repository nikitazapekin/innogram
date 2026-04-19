export type RequestLike = {
  method: string;
  url: string;
};

export type ResponseLike = {
  status: (statusCode: number) => ResponseLike; // проверить статус и json
  json: (body: unknown) => void;
  statusCode?: number;
};

export type ExceptionResponseBody = {
  message?: string | string[]; // проверить юнион и ?
  error?: unknown;
};
