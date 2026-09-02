/**
 * Global type declarations for React Native environment.
 * React Native provides these APIs globally via polyfills.
 */

// Fetch API (provided by React Native)
declare function fetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response>;

declare const AbortController: {
  prototype: AbortController;
  new (): AbortController;
};

interface AbortController {
  readonly signal: AbortSignal;
  abort(): void;
}

interface AbortSignal {
  readonly aborted: boolean;
  addEventListener(type: "abort", listener: () => void): void;
  removeEventListener(type: "abort", listener: () => void): void;
}

type RequestInfo = Request | string;

interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

interface Response {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  json(): Promise<any>;
  text(): Promise<string>;
}

interface Request {
  readonly url: string;
}

// Timers (provided by React Native)
declare function setTimeout(
  handler: () => void,
  timeout: number
): number;

declare function clearTimeout(handle: number): void;
