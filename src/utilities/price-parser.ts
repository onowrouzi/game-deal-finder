import SettingsUtility from "./settings";
import { SettingTypes } from "../types/setting-types.enum";
import { Currency } from "../types/currency";

export const parsePriceString = (price: string) => {
  const currency = (SettingsUtility.getSetting(
    SettingTypes.CURRENCY
  ) as Currency) || {
    left: true,
    sign: "",
    code: ""
  };
  return currency.left
    ? `${currency.sign || ""}${price}`
    : `${price}${currency.sign || ""}`;
};
