"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  hydrated: boolean;
  add: (
    item: Omit<CartItem, "quantity"> & {
      quantity?: number;
    },
  ) => void;
  remove: (id: string) => void;
  clear: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: () => number;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "cart";

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /*
   * Load cart from localStorage.
   *
   * This intentionally happens after the initial render.
   * That prevents server/client hydration mismatches.
   */
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  /*
   * Save cart whenever it changes.
   */
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [items, hydrated]);

  /*
   * Add product to cart.
   */
  const add = (
    item: Omit<CartItem, "quantity"> & {
      quantity?: number;
    },
  ) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.id === item.id,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + (item.quantity ?? 1),
              }
            : cartItem,
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: item.quantity ?? 1,
        },
      ];
    });
  };

  /*
   * Remove one product completely.
   */
  const remove = (id: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id),
    );
  };

  /*
   * Update quantity.
   */
  const updateQuantity = (
    id: string,
    quantity: number,
  ) => {
    if (quantity < 1) return;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  };

  /*
   * Empty entire cart.
   */
  const clear = () => {
    setItems([]);
  };

  /*
   * Calculate subtotal.
   */
  const total = () => {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.price) * (item.quantity || 1),
      0,
    );
  };

  const value = useMemo(
    () => ({
      items,
      hydrated,
      add,
      remove,
      clear,
      updateQuantity,
      total,
    }),
    [items, hydrated],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
}