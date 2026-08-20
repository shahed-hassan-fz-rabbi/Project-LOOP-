export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export function successResponse<T>(data: T, message = "Operation successful"): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(error: string, message = "Operation failed"): ApiResponse {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  };
}