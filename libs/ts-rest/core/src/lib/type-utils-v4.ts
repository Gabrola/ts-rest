export type Methods = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type PathToTemplate<S extends string> =
  S extends `${infer L}/:${infer _P}/${infer R}`
    ? PathToTemplate<`${L}${string}${R}`>
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    S extends `${infer L}:${infer _R}`
    ? PathToTemplate<`${L}${string}`>
    : S;

export type RouteType<
  T extends AppRouter,
  Method extends Methods,
  Path extends string,
  Key = keyof T
> = Key extends string
  ? T[Key] extends AppRouter
    ? RouteType<T[Key], Method, Path>
    : T[Key]['path'] extends PathToTemplate<Path>
    ? T[Key]['method'] extends Method
      ? T[Key]
      : never
    : never
  : never;

export type AppRouteQuery = {
  method: 'GET';
  path: string;
  query?: unknown;
  responses: Record<number, unknown>;
};

export type AppRouteMutation = {
  method: 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  path: string;
  body?: unknown;
  query?: unknown;
  responses: Record<number, unknown>;
};

export type AppRouter = {
  [key: string]: AppRouter | AppRoute;
};
export type AppRoute = AppRouteQuery | AppRouteMutation;
export type AllPaths<
  TRouter extends AppRouter,
  Method extends Methods,
  TRoute = RouteType<TRouter, Method, any>
> = TRoute extends AppRoute ? TRoute['path'] : never;
