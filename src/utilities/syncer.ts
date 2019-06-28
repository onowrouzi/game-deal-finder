import { API_KEY, STEAM_API_KEY } from "react-native-dotenv";
import { IsThereAnyDealApi } from "itad-api-client-ts";
import { uniq } from "lodash";
import UserDataUtility from "./user-data";
import { SyncResponse } from "../types/sync-response";

export default class GamesSyncer {
  private readonly PROFILE_URL_REGEX = /((http|https):\/\/?)((www\.)?)(steamcommunity.com\/)/;
  private readonly WISHLIST_VAR_REGEX = /(var g_rgWishlistData = )/;
  private readonly WISHLIST_HTML_REGEX = /(var g_rgWishlistData = \[)(\{"appid":\d*,"priority":\d*,"added":\d*\}(,?))*(\])/;

  private _api: IsThereAnyDealApi;

  constructor() {
    this._api = new IsThereAnyDealApi(API_KEY);
  }

  async syncSteamLibrary(profileUrl: string): Promise<SyncResponse> {
    const profileUri = profileUrl
      .toLowerCase()
      .replace(this.PROFILE_URL_REGEX, "");
    const uriFragments = profileUri.split("/");

    const userId =
      uriFragments[0] === "id"
        ? await this._getSteamUserId(uriFragments[1])
        : uriFragments[1];

    const librarySynced = await this._syncSteamLibrary(userId);
    const wishlistSynced = await this._syncSteamWishlist(profileUri);

    if (librarySynced) {
      UserDataUtility.setSyncInfo({
        shop: "steam",
        profile_url: profileUrl
      });
    }

    return {
      library: librarySynced,
      wishlist: wishlistSynced
    };
  }

  private async _syncSteamLibrary(userId: string): Promise<boolean> {
    try {
      const steamOwned = await fetch(
        `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${userId}&format=json&include_played_free_games=true`
      )
        .then(res => res.json())
        .then(json => json.response.games);
      const gameIds = steamOwned.map(o => `app/${o.appid}`);

      const res = await this._api.getPlainsByExternalId(gameIds, "steam");
      const plains = uniq(
        UserDataUtility.getOwnedGames()
          .concat(Object.values(res) || [])
          .sort((a, b) =>
            a.replace(/[^\w\s]/g, "").toLowerCase() <
            b.replace(/[^\w\s]/g, "").toLowerCase()
              ? -1
              : 1
          )
      );

      await UserDataUtility.setOwnedGames(plains);

      return true;
    } catch {
      return false;
    }
  }

  private async _getSteamUserId(vanityId: string) {
    return await fetch(
      `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${vanityId}`
    )
      .then(res => res.json())
      .then(json => json.response.steamid);
  }

  private async _syncSteamWishlist(profileUri: string): Promise<boolean> {
    try {
      const html = await fetch(
        "https://store.steampowered.com/wishlist/" + profileUri
      ).then(res => res.text());
      const matches = html.match(this.WISHLIST_HTML_REGEX);
      if (matches && matches.length > 0) {
        var gameIds = (
          JSON.parse(matches[0].replace(this.WISHLIST_VAR_REGEX, "")) || []
        ).map(m => `app/${m.appid}`);
        const res = await this._api.getPlainsByExternalId(gameIds, "steam");
        const plains = uniq(
          UserDataUtility.getWatchlist()
            .concat(Object.values(res) || [])
            .filter(plain => plain)
            .sort((a, b) =>
              a.replace(/[^\w\s]/g, "").toLowerCase() <
              b.replace(/[^\w\s]/g, "").toLowerCase()
                ? -1
                : 1
            )
        );

        await UserDataUtility.setWatchlist(plains);

        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
