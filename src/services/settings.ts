import { AsyncStorage } from "react-native";

import { SettingTypes } from "../types/setting-types.enum";

import { DealListStyle } from "../types/deal-list-style";
import { Settings } from "../types/settings";

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
    this._shouldRefresh = !this._shouldRefresh;
    return !this._shouldRefresh;
  }

  private static async _init(): Promise<Settings> {
    const promises = [];
    promises.push(
      AsyncStorage.getItem(SettingTypes.CURRENCY, (err, res) => res).then(res =>
        JSON.parse(res)
      )
    );
    promises.push(AsyncStorage.getItem(SettingTypes.REGION, (err, res) => res));
    promises.push(
      AsyncStorage.getItem(SettingTypes.COUNTRY, (err, res) => res)
    );
    promises.push(
      AsyncStorage.getItem(SettingTypes.SHOPS, (err, res) => res).then(
        res => JSON.parse(res) || []
      )
    );
    promises.push(
      AsyncStorage.getItem(
        SettingTypes.INCLUDE_BUNDLES,
        (err, res) => res
      ).then(res => res !== "false")
    );
    promises.push(
      AsyncStorage.getItem(SettingTypes.INCLUDE_DLC, (err, res) => res).then(
        res => res !== "false"
      )
    );
    promises.push(
      AsyncStorage.getItem(SettingTypes.LIST_STYLE, (err, res) => res).then(
        res => res as DealListStyle
      )
    );
    promises.push(
      AsyncStorage.getItem(SettingTypes.DARK_MODE, (err, res) => res).then(
        res => res === "true"
      )
    );

    const resolved = await Promise.all(promises);

    return (SettingsUtility._settings = {
      currency: resolved[0],
      region: resolved[1],
      country: resolved[2],
      shops: resolved[3],
      includeBundles: resolved[4],
      includeDlc: resolved[5],
      listStyle: resolved[6],
      darkMode: resolved[7]
    });
  }
}
