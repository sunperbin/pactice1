const isDevelopment = process.env.NODE_ENV === 'development';

export const log = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export const error = (...args: any[]) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

