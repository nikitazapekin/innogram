type AppRequest = Readonly<{
  method: string;
  path: string;
}>;

type AppResponse = Readonly<{
  json: (statusCode: number, body: unknown) => void;
}>;

export const handleSystemRoute = async (
  request: AppRequest,
  response: AppResponse,
): Promise<boolean> => {
  if (request.method === 'GET' && request.path === '/') {
    response.json(200, {
      message: 'Authentication microservice is running.',
    });

    return true;
  }

  if (request.method === 'GET' && request.path === '/health') {
    response.json(200, {
      status: 'ok',
      timestamp: new Date(),
    });

    return true;
  }

  return false;
};
