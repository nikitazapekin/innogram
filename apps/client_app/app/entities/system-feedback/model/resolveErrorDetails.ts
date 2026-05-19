type ErrorDetails = {
  description: string;
  title: string;
};

const fallbackErrorDetails: ErrorDetails = {
  title: 'Что-то пошло не так',
  description: 'Попробуйте обновить страницу или повторить действие немного позже.',
};

export function resolveErrorDetails(error?: Error): ErrorDetails {
  if (!error) {
    return fallbackErrorDetails;
  }

  if (error.message) {
    return {
      title: fallbackErrorDetails.title,
      description: error.message,
    };
  }

  return fallbackErrorDetails;
}
