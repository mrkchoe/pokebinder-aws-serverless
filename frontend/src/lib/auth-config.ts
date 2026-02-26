/**
 * Cognito config. Replace with your deployed values (from sam deploy outputs).
 */
export const authConfig = {
  region: process.env.NEXT_PUBLIC_COGNITO_REGION ?? "us-east-1",
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
  userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
};

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
};
