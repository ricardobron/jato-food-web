import { create } from 'zustand';

export type IButtonOption = 'new_order' | 'my_orders';

interface IGeneralStore {
  buttonOption: IButtonOption;
  handleChangeButtonOption: (option: IButtonOption) => void;
}

export const useGeneral = create<IGeneralStore>((set) => ({
  buttonOption: 'my_orders',
  handleChangeButtonOption: (option: IButtonOption) => {
    set({ buttonOption: option });
  },
}));
