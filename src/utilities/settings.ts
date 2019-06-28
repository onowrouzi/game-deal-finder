import { AsyncStorage } from "react-native";

import { SettingTypes } from "../types/setting-types.enum";

import { DealListStyle } from "../types/deal-list-style";
import { Settings, Currency } from "../types/settings";

export default class SettingsUtility {
  private static _instance: SettingsUtility;
  private static _settings: Settings;
  private static _shouldRefresh: boolean;

  private constructor() {}

  static async init() {
    if (SettingsUtility._instance) {
      return SettingsUtility._instance;
    }

    await this._init();
    return (SettingsUtility._instance = new SettingsUtility());
  }

  static getSettings() {
    return this._settings;
  }

  static getSetting(type: SettingTypes) {
    return this._settings[type];
  }

  static async setSetting(type: SettingTypes, value: any) {
    const val = typeof value == "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(type, val);
    this._settings[type.toString()] = value;

    if (type != SettingTypes.DARK_MODE) {
      this._shouldRefresh = true;
    }
  }

  static shouldRefresh(): boolean {
    if (this._shouldRefresh) {
      this._shouldRefresh = false;
      return true;
    }

    return false;
  }

  private static async _init(): Promise<Settings> {
    await AsyncStorage.multiGet(
      [
        SettingTypes.CURRENCY,
        SettingTypes.REGION,
        SettingTypes.COUNTRY,
        SettingTypes.SHOPS,
        SettingTypes.INCLUDE_BUNDLES,
        SettingTypes.INCLUDE_DLC,
        SettingTypes.LIST_STYLE,
        SettingTypes.DARK_MODE
      ],
      (err, res) => res
    ).then(res => {
      SettingsUtility._settings = {
        currency: JSON.parse(res[0][1]) as Currency,
        region: res[1][1],
        country: res[2][1],
        shops: (JSON.parse(res[3][1]) as string[]) || [],
        includeBundles: res[4][1] !== "false",
        includeDlc: res[5][1] !== "false",
        listStyle: res[6][1] as DealListStyle,
        darkMode: res[7][1] === "true"
      };
    });
    return SettingsUtility._settings;
  }
}
