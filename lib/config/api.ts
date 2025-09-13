export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: {
    DEFAULT: 10000,
    LONG: 30000,
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
};