const SUPABASE_FETCH_TIMEOUT_MS = 10000;

function buildNetworkErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Network request failed";

  return new Response(
    JSON.stringify({
      message,
      error: "network_error",
    }),
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" },
    },
  );
}

export function fetchSupabaseWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

  return fetch(input, {
    ...init,
    signal,
  }).catch((error) => buildNetworkErrorResponse(error));
}
