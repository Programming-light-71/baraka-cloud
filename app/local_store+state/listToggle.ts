import { create } from "zustand";
import { persist } from "zustand/middleware";

type Store = {
  isList: boolean;
  setIsList: () => void;
};

export const useIsListStore = create<Store>()(
  persist(
    (set) => ({
      isList: true,
      setIsList: () => set((state) => ({ isList: !state.isList })),
    }),
    { name: "isListStore" }
  )
);
