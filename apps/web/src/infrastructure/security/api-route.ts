import { NextRequest, NextResponse } from "next/server";
import { ZodIssue, ZodType } from "zod";
import { reportServerError } from "@/infrastructure/monitoring/report-error";
import { isOriginAllowed } from "@/infrastructure/security/origin";
import { sanitizeUnknown } from "@/infrastructure/security/sanitize";

type RouteContextInput = {
  params?: Promise<unknown> | unknown;
};

type SearchParamsValue = string | string[];
type SearchParamsRecord = Record<string, SearchParamsValue>;

type RequestSchemas<TBody, TQuery, TParams> = {
  body?: ZodType<TBody>;
  query?: ZodType<TQuery>;
  params?: ZodType<TParams>;
};

type ValidatedApiContext<TBody, TQuery, TParams> = {
  request: NextRequest;
  body: TBody;
  query: TQuery;
  params: TParams;
};

type ValidatedApiHandler<TBody, TQuery, TParams> = (
  context: ValidatedApiContext<TBody, TQuery, TParams>,
) => Promise<Response>;

type ValidationErrorPayload = {
  error: string;
  issues?: string[];
};

type ValidationResult<TValue> =
  | {
      success: true;
      data: TValue;
    }
  | {
      success: false;
      response: Response;
    };

function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin) {
    return {
      ...headers,
      "Access-Control-Allow-Origin": origin,
    };
  }

  return headers;
}

function withCors(response: Response, origin: string | null): Response {
  const nextResponse: NextResponse = new NextResponse(response.body, response);
  const corsHeaders: HeadersInit = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]: [string, string]) => {
    nextResponse.headers.set(key, value);
  });

  return nextResponse;
}

function invalidRequest(origin: string | null, payload: ValidationErrorPayload, status: number): Response {
  return withCors(NextResponse.json(payload, { status }), origin);
}

function searchParamsToObject(searchParams: URLSearchParams): SearchParamsRecord {
  const result: SearchParamsRecord = {};

  searchParams.forEach((value: string, key: string) => {
    const existingValue: SearchParamsValue | undefined = result[key];

    if (typeof existingValue === "undefined") {
      result[key] = value;
      return;
    }

    if (Array.isArray(existingValue)) {
      result[key] = [...existingValue, value];
      return;
    }

    result[key] = [existingValue, value];
  });

  return result;
}

async function resolveParams(context: RouteContextInput | undefined): Promise<unknown> {
  if (!context?.params) {
    return {};
  }

  return await context.params;
}

async function parseBody(request: NextRequest): Promise<unknown> {
  const method: string = request.method.toUpperCase();

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return undefined;
  }

  const contentType: string = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData: FormData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  if (contentType.includes("text/plain")) {
    return await request.text();
  }

  return undefined;
}

function validateInput<TValue>(
  schema: ZodType<TValue> | undefined,
  rawValue: unknown,
  origin: string | null,
  errorMessage: string,
): ValidationResult<TValue> {
  if (!schema) {
    return {
      success: true,
      data: undefined as TValue,
    };
  }

  const result = schema.safeParse(rawValue);

  if (!result.success) {
    return {
      success: false,
      response: invalidRequest(
        origin,
        {
          error: errorMessage,
          issues: result.error.issues.map((issue: ZodIssue) => issue.message),
        },
        400,
      ),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export function createPreflightHandler() {
  return async (request: NextRequest): Promise<Response> => {
    const originDecision = isOriginAllowed(request.headers.get("origin"));

    if (!originDecision.allowed) {
      return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(originDecision.origin),
    });
  };
}

export function createApiRoute<TBody = undefined, TQuery = undefined, TParams = undefined>(
  schemas: RequestSchemas<TBody, TQuery, TParams>,
  handler: ValidatedApiHandler<TBody, TQuery, TParams>,
) {
  return async (request: NextRequest, context?: RouteContextInput): Promise<Response> => {
    const originDecision = isOriginAllowed(request.headers.get("origin"));

    if (!originDecision.allowed) {
      return invalidRequest(originDecision.origin, { error: "Origin not allowed." }, 403);
    }

    const rawBody: unknown = sanitizeUnknown(await parseBody(request));
    const rawQuery: unknown = sanitizeUnknown(searchParamsToObject(request.nextUrl.searchParams));
    const rawParams: unknown = sanitizeUnknown(await resolveParams(context));

    const validatedBody = validateInput(schemas.body, rawBody, originDecision.origin, "Invalid request body.");
    if (!validatedBody.success) {
      return validatedBody.response;
    }

    const validatedQuery = validateInput(
      schemas.query,
      rawQuery,
      originDecision.origin,
      "Invalid query parameters.",
    );
    if (!validatedQuery.success) {
      return validatedQuery.response;
    }

    const validatedParams = validateInput(
      schemas.params,
      rawParams,
      originDecision.origin,
      "Invalid route parameters.",
    );
    if (!validatedParams.success) {
      return validatedParams.response;
    }

    try {
      const response: Response = await handler({
        request,
        body: validatedBody.data,
        query: validatedQuery.data,
        params: validatedParams.data,
      });

      return withCors(response, originDecision.origin);
    } catch (error: unknown) {
      reportServerError(error, {
        pathname: request.nextUrl.pathname,
        method: request.method,
      });

      return invalidRequest(originDecision.origin, { error: "Internal server error." }, 500);
    }
  };
}
