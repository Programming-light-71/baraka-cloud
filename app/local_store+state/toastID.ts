import { create } from "zustand";
type Store = {
  toastId: string;
  setToastId: (id: string) => void;
};

export const useToastIdStore = create<Store>((set) => ({
  toastId: "",
  setToastId: (id) => set({ toastId: id }),
}));
