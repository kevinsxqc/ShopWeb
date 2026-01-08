export type Product = {
  id: string;
  name: string;
  kind: "Hoodie" | "Tee" | "Cap";
  price: number;
  stripePriceId: string;
   variants: {
    colorLabel: string;      // "White", "Purple"
    colorValue: string;      // "white", "purple" (för url/metadata)
    images: string[];        // flera mockups för den färgen
  }[];
  sizes: string[];
};

export const products: Product[] = [
  {
    id: "hoodie-ja-morant",
    name: "Ja Morant Hoodie",
    kind: "Hoodie",
    price: 50,
    stripePriceId: "price_1Sah4yL65pgma3thvJaxssT8",
    variants: [
      {
        colorLabel: "Purple",
        colorValue: "purple",
        images: [
          "/products/JaHoodie/Ja-purple-front.png",
          "/products/JaHoodie/Ja-purple-back.png",
          "/products/JaHoodie/Ja-purple-side1.png",
          "/products/JaHoodie/Ja-purple-side2.png",
        ],
      },
      {
        colorLabel: "White",
        colorValue: "white",
        images: [
          "/products/JaHoodie/Ja-white-front.png",
          "/products/JaHoodie/Ja-white-back.png",
          "/products/JaHoodie/Ja-white-side1.png",
          "/products/JaHoodie/Ja-white-side2.png",
        ],
      },
      {
        colorLabel: "Pink",
        colorValue: "pink",
        images: [
          "/products/JaHoodie/Ja-pink-front.png",
          "/products/JaHoodie/Ja-pink-back.png",
          "/products/JaHoodie/Ja-pink-side1.png",
          "/products/JaHoodie/Ja-pink-side2.png",
        ],
      },
      {
        colorLabel: "Blue",
        colorValue: "blue",
        images: [
          "/products/JaHoodie/Ja-blue-front.png",
          "/products/JaHoodie/Ja-blue-back.png",
          "/products/JaHoodie/Ja-blue-side1.png",
          "/products/JaHoodie/Ja-blue-side2.png",
        ],
      },
      {
        colorLabel: "Sky Blue",
        colorValue: "sky-blue",
        images: [
          "/products/JaHoodie/Ja-skyblue-front.png",
          "/products/JaHoodie/Ja-skyblue-back.png",
          "/products/JaHoodie/Ja-skyblue-side1.png",
          "/products/JaHoodie/Ja-skyblue-side2.png",
        ],
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "lebron-tee",
    name: "LeBron Tee",
    kind: "Tee",
    price: 34,
    stripePriceId: "price_1SnKpKL65pgma3th0hKnzp9B",
    variants: [
      {
        colorLabel: "White",
        colorValue: "white",
        images: [
          "/products/LeBronTee/Lebron-white-front-back.png",
          "/products/LeBronTee/Lebron-white-back.png",
          "/products/LeBronTee/Lebron-white-wholeback.png",
        ],
      },
      {
        colorLabel: "Black",
        colorValue: "black",
        images: [
          "/products/LeBronTee/Lebron-black-front-back.png",
          "/products/LeBronTee/Lebron-black-back.png",
          "/products/LeBronTee/Lebron-black-wholeback.png",
        ],
      },
      {
        colorLabel: "Orange",
        colorValue: "orange",
        images: [
          "/products/LeBronTee/Lebron-orange-front-back.png",
          "/products/LeBronTee/Lebron-orange-back.png",
          "/products/LeBronTee/Lebron-orange-wholeback.png",
        ],
      },
      {
        colorLabel: "Pink",
        colorValue: "pink",
        images: [
          "/products/LeBronTee/Lebron-pink-front-back.png",
          "/products/LeBronTee/Lebron-pink-back.png",
          "/products/LeBronTee/Lebron-pink-wholeback.png",
        ],
      },
      {
        colorLabel: "Blue",
        colorValue: "blue",
        images: [
          "/products/LeBronTee/Lebron-blue-front-back.png",
          "/products/LeBronTee/Lebron-blue-back.png",
          "/products/LeBronTee/Lebron-blue-wholeback.png",
        ],
      }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "sga-hoodie",
    name: "SGA Hoodie",
    kind: "Hoodie",
    price: 50,
    stripePriceId: "price_1SnKmVL65pgma3thRxK9XRQQ",
    variants: [
      {
        colorLabel: "White",
        colorValue: "white",
        images: [
          "/products/SGAhoode/SGA-white-front.png",
          "/products/SGAhoode/SGA-white-front+.png",
          "/products/SGAhoode/SGA-white-back.png",
          "/products/SGAhoode/SGA-white-side.png",
          
        ],
      },
      {
        colorLabel: "Military Green",
        colorValue: "military-green",
        images: [
          "/products/SGAhoode/SGA-militarygreen-front.png",
          "/products/SGAhoode/SGA-militarygreen-front+.png",
          "/products/SGAhoode/SGA-militarygreen-back.png",
          "/products/SGAhoode/SGA-militarygreen-side.png",
        ],
      },
      {
        colorLabel: "Blood Orange",
        colorValue: "blood-orange",
        images: [
          "/products/SGAhoode/SGA-blood-orange-front.png",
          "/products/SGAhoode/SGA-blood-orange-front+.png",
          "/products/SGAhoode/SGA-blood-orange-back.png",
          "/products/SGAhoode/SGA-blood-orange-side.png",
        ],
      },
      {
        colorLabel: "Orange",
        colorValue: "orange",
        images: [
          "/products/SGAhoode/SGA-orange-front.png",
          "/products/SGAhoode/SGA-orange-front+.png",
          "/products/SGAhoode/SGA-orange-back.png",
          "/products/SGAhoode/SGA-orange-side.png",
        ],
      },
      {
        colorLabel: "Blue",
        colorValue: "blue",
        images: [
          "/products/SGAhoode/SGA-blue-front.png",
          "/products/SGAhoode/SGA-blue-front+.png",
          "/products/SGAhoode/SGA-blue-back.png",
          "/products/SGAhoode/SGA-blue-side.png",
        ],
      }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
];
