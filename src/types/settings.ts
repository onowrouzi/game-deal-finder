import { ItadGameDealSearchParams } from "itad-api-client-ts";
import { DealListStyle } from "./deal-list-style";

export type Settings = ItadGameDealSearchParams & {
  includeDlc: boolean;
  includeBundles: boolean;
  currency?: Currency;
  listStyle?: DealListStyle;
  darkMode?: boolean;
};

export type Currency = {
  sign: string;
  left: boolean;
  code: string;
};
