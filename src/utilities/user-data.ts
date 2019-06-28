import { uniq } from "lodash";
import { AsyncStorage } from "react-native";
import { UserDataTypes } from "../types/user-data-types.enum";
import { SyncInfo } from "../types/sync-info";

export default class UserDataUtility {
  private static _instance: UserDataUtility;
  private static _watchlist: string[];
  private static _ownedGames: string[];
  private static _syncInfo: SyncInfo[];

  private constructor() {}

  static async init() {
    if (UserDataUtility._instance) {
      return UserDataUtility._instance;
    }

    await this._init();
    return (UserDataUtility._instance = new UserDataUtility());
  }

  private static async _init() {
    await AsyncStorage.multiGet(
      [UserDataTypes.OWNED, UserDataTypes.WATCHLIST, UserDataTypes.SYNC_INFO],
      (err, res) => {
        UserDataUtility._ownedGames = (JSON.parse(res[0][1]) as string[]) || [];
        UserDataUtility._watchlist = (JSON.parse(res[1][1]) as string[]) || [];
        UserDataUtility._syncInfo = (JSON.parse(res[2][1]) as SyncInfo[]) || [];
      }
    );
  }

  static async toggleGameInWatchlist(plain: string): Promise<boolean> {
    let onWatchlist = this._watchlist.includes(plain);
    if (onWatchlist) {
      this._watchlist = uniq(this._watchlist.filter(l => l != plain));
    } else {
      this._watchlist.push(plain);
    }

    await AsyncStorage.setItem(
      UserDataTypes.WATCHLIST,
      JSON.stringify(
        this._watchlist.sort((a, b) =>
          a.replace(/[^\w\s]/g, "").toLowerCase() <
          b.replace(/[^\w\s]/g, "").toLowerCase()
            ? -1
            : 1
        )
      )
    );

    return !onWatchlist;
  }

  static getWatchlist() {
    return this._watchlist;
  }

  static async setWatchlist(plains: string[]) {
    this._watchlist = plains;

    await AsyncStorage.setItem(
      UserDataTypes.WATCHLIST,
      JSON.stringify(this._watchlist)
    );
  }

  static async toggleGameOwned(plain: string): Promise<boolean> {
    let owned = this._ownedGames.includes(plain);
    if (owned) {
      this._ownedGames = uniq(this._ownedGames.filter(l => l != plain));
    } else {
      this._ownedGames.push(plain);
    }

    await AsyncStorage.setItem(
      UserDataTypes.OWNED,
      JSON.stringify(
        this._ownedGames.sort((a, b) =>
          a.replace(/[^\w\s]/g, "").toLowerCase() <
          b.replace(/[^\w\s]/g, "").toLowerCase()
            ? -1
            : 1
        )
      )
    );

    return !owned;
  }

  static getOwnedGames() {
    return this._ownedGames;
  }

  static async setOwnedGames(plains: string[]) {
    this._ownedGames = plains;

    await AsyncStorage.setItem(
      UserDataTypes.OWNED,
      JSON.stringify(this._ownedGames)
    );
  }

  static getSyncInfo() {
    return this._syncInfo;
  }

  static async setSyncInfo(syncInfo: SyncInfo) {
    syncInfo.last_sync = Date.now();

    const existingIndex = this._syncInfo.findIndex(
      i => i.shop == syncInfo.shop
    );

    if (existingIndex > -1) {
      this._syncInfo.splice(existingIndex, 1, syncInfo);
    } else {
      this._syncInfo.push(syncInfo);
    }

    await AsyncStorage.setItem(
      UserDataTypes.SYNC_INFO,
      JSON.stringify(this._syncInfo)
    );
  }
}
