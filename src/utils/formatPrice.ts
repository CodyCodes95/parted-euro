export const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

export const formatPrice = (price: number) =>
  formatter.format(price).split("A")[1];