export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  
  const problemDetails = {
    type: err.type || 'https://devpulse.internal/errors/server-error',
    title: err.title || (statusCode >= 500 ? 'Internal Server Error' : 'Client Error'),
    status: statusCode,
    detail: err.message || 'An unexpected error occurred.',
    instance: req.originalUrl,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    problemDetails.stack = err.stack.split('\n').map(s => s.trim());
  }

  console.error(`[ERROR] [${req.method} ${req.originalUrl}] ${statusCode} - ${err.message}`);
  res.status(statusCode).json(problemDetails);
}
