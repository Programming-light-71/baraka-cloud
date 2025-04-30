import { create } from "zustand";
import { persist } from "zustand/middleware";

type Store = {
  isAppearUpgradeBanner: boolean;
  isAppearExpireBanner: number | null; // Store timestamp instead of Date object
  setIsAppearUpgradeBanner: () => void;
  checkAndResetBanner: () => void;
};

export const useDisappearUpgradeBanner = create<Store>()(
  persist(
    (set, get) => ({
      isAppearUpgradeBanner: true,
      isAppearExpireBanner: null, // Initially null

      setIsAppearUpgradeBanner: () => {
        const now = Date.now(); // Store timestamp instead of Date object
        const expireTime = now + 7 * 24 * 60 * 60 * 1000; // 1 minute in milliseconds

        set({
          isAppearUpgradeBanner: false, // Hiding the banner
          isAppearExpireBanner: expireTime, // Store expiration time
        });
      },

      checkAndResetBanner: () => {
        const state = get();

        if ("isAppearExpireBanner" in state) {
          const now = Date.now();
          const expiryDate = new Date(
            state?.isAppearExpireBanner || Date.now()
          );

          if (now > expiryDate.getTime()) {
            localStorage.removeItem("isAppearUpgradeBannerStore"); // Remove from localStorage

            set({
              isAppearUpgradeBanner: true, // Show banner again after expiration
              isAppearExpireBanner: null,
            });
          }
        }
      },
    }),
    {
      name: "isAppearUpgradeBannerStore",
    }
  )
);
