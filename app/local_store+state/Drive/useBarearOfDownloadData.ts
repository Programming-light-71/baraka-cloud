import { create } from "zustand";
import { persist } from "zustand/middleware";
import { encryptData } from "~/utils/frontend-utils/DataEncryption";

type Store = {
  downloadFIle: string;
  setFileData: (fileData: {
    fileUrl: string;
    fileName: string;
    type: string;
  }) => void;
};

export const useBarerOfDownloadData = create<Store>()(
  persist(
    (set) => ({
      downloadFIle: "",
      setFileData: (fileData) =>
        set(() => ({ downloadFIle: encryptData(fileData) })),
    }),
    { name: "downloadBearer" }
  )
);
