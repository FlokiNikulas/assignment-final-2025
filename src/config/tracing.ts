import tracer, { dogstatsd } from 'dd-trace';
import StatsD from 'hot-shots';

if (typeof window === 'undefined') {
  tracer.init({
    service: process.env.DD_SERVICE_NAME || 'assignment-4-2025',
    env: process.env.NODE_ENV || 'development',
    version: process.env.VERSION || '1.0.0',
  });

  const dogstatsd = new StatsD();

  dogstatsd.increment('page.views');

} else {
  console.warn('Tracing is only available on the server side.');
}

export { tracer, dogstatsd };