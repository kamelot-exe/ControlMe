import { useQuery, useMutation } from "@tanstack/react-query";

export function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Unable to connect") ||
      error.message.includes("ERR_CONNECTION_REFUSED") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network error")
    );
  }
  return false;
}

export function useApiError<T>(
  query: ReturnType<typeof useQuery<T>> | ReturnType<typeof useMutation<T>>
) {
  const error = query.error;
  const isConnectionErr = isConnectionError(error);
  
  return {
    error,
    isConnectionError: isConnectionErr,
    errorMessage: error instanceof Error ? error.message : undefined,
  };
}

