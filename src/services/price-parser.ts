export const parsePriceString = (
  price: string,
  currencySign?: string,
  currencyOnLeft?: boolean
) => {
  return currencyOnLeft
    ? `${currencySign || ""}${price}`
    : `${price}${currencySign || ""}`;
};
