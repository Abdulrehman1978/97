export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network connection unavailable") {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthError extends ApiError {
  constructor(message = "Authentication required or token expired") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class OfflineQueuedError extends Error {
  mutationId: string;
  constructor(mutationId: string, message = "Saved offline — will synchronize when reconnected") {
    super(message);
    this.name = "OfflineQueuedError";
    this.mutationId = mutationId;
  }
}
