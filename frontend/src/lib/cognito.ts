"use client";

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  type ICognitoUserData,
  type ICognitoUserPoolData,
} from "amazon-cognito-identity-js";
import { authConfig } from "./auth-config";

function getUserPool() {
  const { userPoolId, userPoolWebClientId, region } = authConfig;
  if (!userPoolId || !userPoolWebClientId) {
    throw new Error("Cognito User Pool ID and Client ID must be set");
  }
  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: userPoolWebClientId,
  } as ICognitoUserPoolData);
}

export function signUp(email: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    pool.signUp(email, password, [], [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result?.user.getUsername() ?? email);
    });
  });
}

export function signIn(email: string, password: string): Promise<{ idToken: string; accessToken: string; refreshToken: string }> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const user = new CognitoUser({
      Username: email,
      Pool: pool,
    } as ICognitoUserData);
    const details = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    user.authenticateUser(details, {
      onSuccess: (session) => {
        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();
        resolve({ idToken, accessToken, refreshToken });
      },
      onFailure: reject,
    });
  });
}

export function getCurrentUser(): CognitoUser | null {
  const pool = getUserPool();
  return pool.getCurrentUser();
}

export function signOut(): void {
  const user = getCurrentUser();
  if (user) {
    user.signOut();
  }
}
