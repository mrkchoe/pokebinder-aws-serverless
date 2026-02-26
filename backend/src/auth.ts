/**
 * Extract and validate Cognito JWT identity from API Gateway request context.
 * With HTTP API + JWT authorizer, the decoded claims are in requestContext.authorizer.jwt.claims.
 */

import type { APIGatewayProxyEventV2 } from "aws-lambda";

export interface AuthResult {
  userId: string;
  email?: string;
}

type RequestContextWithJwt = APIGatewayProxyEventV2["requestContext"] & {
  authorizer?: { jwt?: { claims?: Record<string, string> } };
};

/**
 * Get the authenticated user ID from the request.
 * API Gateway HTTP API JWT authorizer injects claims into event.requestContext.authorizer.jwt.claims.
 */
export function getAuthFromEvent(event: APIGatewayProxyEventV2): AuthResult | null {
  const ctx = event.requestContext as RequestContextWithJwt | undefined;
  const claims = ctx?.authorizer?.jwt?.claims as
    | Record<string, string>
    | undefined;
  if (!claims || typeof claims.sub !== "string") {
    return null;
  }
  return {
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
  };
}

/**
 * Assert auth is present; throws if not (caller should return 401).
 */
export function requireAuth(event: APIGatewayProxyEventV2): AuthResult {
  const auth = getAuthFromEvent(event);
  if (!auth) {
    const err = new Error("Unauthorized");
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }
  return auth;
}
