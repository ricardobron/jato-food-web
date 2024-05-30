import { create } from 'zustand';

interface IProductCart {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface IUpdateProductAmount {
  product_id: string;
  quantity: number;
}

interface ICartStore {
  cart: IProductCart[];
  addProduct: (data: IProductCart) => void;
  removeProduct: (product_id: string) => void;
  updateProductAmount: (data: IUpdateProductAmount) => void;
  clearCart: () => void;
}

export const useCart = create<ICartStore>((set, get) => ({
  cart: [],
  addProduct: (product: IProductCart) => {
    const { cart } = get();

    const productCartIndex = cart.findIndex((c) => c.id === product.id);

    if (productCartIndex !== -1) {
      cart[productCartIndex].quantity = product.quantity;
    } else {
      cart.push(product);
    }

    set({ cart });
  },
  removeProduct: (product_id: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== product_id),
    }));
  },
  updateProductAmount: (data: IUpdateProductAmount) => {
    const { cart } = get();

    const productCartIndex = cart.findIndex((c) => c.id === data.product_id);

    if (productCartIndex !== -1) {
      cart[productCartIndex].quantity = data.quantity;
    }

    set({ cart });
  },
  clearCart: () => {
    set({ cart: [] });
  },
}));
