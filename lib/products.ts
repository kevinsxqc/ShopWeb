// lib/products.ts
export type Product = {
  id: string;
  name: string;
  price: number;        // i euro (för visning, Stripe styr egentligen priset)
  stripePriceId: string; // kopplas mot Stripe Price ID
};

export const products: Product[] = [
  {
    id: "oversize-tee-black",
    name: "Oversize Tee – Black",
    price: 29,
    stripePriceId: "price_123_oversize_black", // byts mot riktig från Stripe
  },
  {
    id: "hoodie-white",
    name: "Signature Hoodie – White",
    price: 59,
    stripePriceId: "price_123_hoodie_white",
  },
];
