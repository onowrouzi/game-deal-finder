/* currently borked because AuthSession doesnt close on its own. */

import { AuthSession } from "expo";
import { AUTH_URL, CLIENT_ID } from "react-native-dotenv";
import { AsyncStorage } from "react-native";
import { Token } from "../types/token";

export default class AuthService {
  private static _token: Token;

  async authorize() {
    const token = await AsyncStorage.getItem("token", (err, res) => res).then(
      res => JSON.parse(res) as Token
    );

    if (
      token &&
      token.expires_at &&
      token.expires_at < new Date().getUTCMilliseconds()
    ) {
      AuthService._token = token;
      return;
    }

    const itadToken = await this._getItadToken();

    if (!itadToken) {
      throw new Error("Authentication Failed");
    }

    AuthService._token = itadToken;

    await AsyncStorage.setItem("token", JSON.stringify(AuthService._token));
  }

  static getToken() {
    return this._token;
  }

  static async isAuthenticated() {
    return AsyncStorage.getItem("token", (err, res) => res).then(res => {
      const token = JSON.parse(res) as Token;
      return (
        token != null &&
        token.expires_at &&
        token.expires_at < new Date().getUTCMilliseconds()
      );
    });
  }

  private async _getItadToken(): Promise<Token> {
    const redirectUrl = encodeURIComponent(AuthSession.getRedirectUrl());
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&scope=wait_read%20wait_write&response_type=token&state=asdf&redirect_uri=${redirectUrl}`;
    const results = await AuthSession.startAsync({
      authUrl
    });

    if (results.type !== "success") {
      return;
    }

    const expires_at = new Date();
    expires_at.setFullYear(expires_at.getFullYear() + 1);

    return {
      access_token: results.params.access_token,
      expires_at: expires_at.getUTCMilliseconds(),
      token_type: results.params.token_type
    };
  }
}
