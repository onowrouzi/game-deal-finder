import { ItadGameDealSearchParams } from "itad-api-client-ts";
import { DealListStyle } from "./deal-list-style";

export type Settings = ItadGameDealSearchParams & {
  includeDlc: boolean;
  includeBundles: boolean;
  currency?: string;
  listStyle?: DealListStyle;
  darkMode?: boolean;
};
