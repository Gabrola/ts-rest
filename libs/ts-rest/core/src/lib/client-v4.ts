import { z, ZodTypeAny } from 'zod';
import { convertQueryParamsToUrlString } from './query';
import { HTTPStatusCode } from './status-codes';
import { Without, ZodInferOrType } from './type-utils';
import {
  AllPaths,
  AppRouter,
  Methods,
  AppRoute,
  RouteType,
  AppRouteMutation,
} from './type-utils-v4';

type AppRouteMutationType<T> = T extends ZodTypeAny ? z.input<T> : T;

interface DataReturnArgs<TRoute extends AppRoute> {
  body: TRoute extends AppRouteMutation
    ? AppRouteMutationType<TRoute['body']>
    : never;
  query: TRoute['query'] extends ZodTypeAny
    ? AppRouteMutationType<TRoute['query']>
    : never;
}

export type ApiRouteResponse<T> =
  | {
      [K in keyof T]: {
        status: K;
        body: ZodInferOrType<T[K]>;
      };
    }[keyof T]
  | {
      status: Exclude<HTTPStatusCode, keyof T>;
      body: unknown;
    };

export interface ClientArgs {
  baseUrl: string;
  baseHeaders: Record<string, string>;
  api?: ApiFetcher;
  credentials?: RequestCredentials;
}

type ApiFetcher = (args: {
  path: string;
  method: string;
  headers: Record<string, string>;
  body: FormData | string | null | undefined;
  credentials?: RequestCredentials;
}) => Promise<{ status: number; body: unknown }>;

export const defaultApi: ApiFetcher = async ({
  path,
  method,
  headers,
  body,
  credentials,
}) => {
  const result = await fetch(path, { method, headers, body, credentials });

  try {
    return {
      status: result.status,
      body: await result.json(),
    };
  } catch {
    return {
      status: result.status,
      body: await result.text(),
    };
  }
};

export const fetchApi = (
  method: string,
  path: string,
  clientArgs: ClientArgs,
  body: unknown
) => {
  const apiFetcher = clientArgs.api || defaultApi;

  return apiFetcher({
    path,
    method: method,
    credentials: clientArgs.credentials,
    headers: {
      ...clientArgs.baseHeaders,
      'Content-Type': 'application/json',
    },
    body:
      body !== null && body !== undefined ? JSON.stringify(body) : undefined,
  });
};

export const getCompleteUrl = (
  path: string,
  query: unknown,
  baseUrl: string
) => {
  const queryComponent = convertQueryParamsToUrlString(query);
  return `${baseUrl}${path}${queryComponent}`;
};

export type InputArgs<TRoute extends AppRoute | never> = TRoute extends AppRoute
  ? Without<DataReturnArgs<TRoute>, never>
  : never;

type ClientFunction<TRouter extends AppRouter> = <
  Method extends Methods,
  Path extends AllPaths<TRouter, Method>,
  TRoute extends RouteType<TRouter, Method, Path>
>(
  method: Method,
  path: Path,
  inputArgs: InputArgs<TRoute>
) => Promise<ApiRouteResponse<TRoute['responses']>>;

export const initClient = <TRouter extends AppRouter>(
  clientArgs: ClientArgs
): ClientFunction<TRouter> => {
  return (async (
    method: string,
    path: string,
    inputArgs: DataReturnArgs<any>
  ) => {
    const completeUrl = getCompleteUrl(
      path,
      inputArgs.query,
      clientArgs.baseUrl
    );

    return await fetchApi(method, completeUrl, clientArgs, inputArgs.body);
  }) as ClientFunction<TRouter>;
};
