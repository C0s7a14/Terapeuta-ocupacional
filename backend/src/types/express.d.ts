declare global {
  namespace Express {
    interface Request {
      therapistId?: string;
    }
  }
}

export {};

