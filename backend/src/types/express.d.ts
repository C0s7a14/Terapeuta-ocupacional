declare global {
  namespace Express {
    interface Request {
      therapistId?: string;
      portalAccountId?: string;
    }
  }
}

export {};
