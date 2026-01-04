export type Product = {
  id: string;
  name: string;
  kind: "Hoodie" | "Tee" | "Cap";
  price: number; // only for UI display
  stripePriceId: string; // MUST be price_... from Stripe
};

export const products: Product[] = [
  {
    id: "hoodie-ja-morant",
    name: "Ja Morant Hoodie",
    kind: "Hoodie",
    price: 50,
    stripePriceId: "price_1Sah4yL65pgma3thvJaxssT8",
  },
  {
    id: "tee-midnight-black",
    name: "Oversize Tee – Midnight Black",
    kind: "Tee",
    price: 29,
    stripePriceId: "price_1Sah4yL65pgma3thvJaxssT8",
  },
  {
    id: "cap-black",
    name: "Court Side Cap – Black",
    kind: "Cap",
    price: 24,
    stripePriceId: "price_1Sah4yL65pgma3thvJaxssT8",
  },
];
