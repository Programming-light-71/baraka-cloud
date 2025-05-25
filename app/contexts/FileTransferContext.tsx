import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { TransferProgress } from "../components/drive/DOWNLOAD/FileTransferProgress";

interface FileTransferContextType {
  transfers: TransferProgress[];
  addTransfer: (transfer: TransferProgress) => void;
  updateTransfer: (fileName: string, update: Partial<TransferProgress>) => void;
  removeTransfer: (fileName: string) => void;
}

const FileTransferContext = createContext<FileTransferContextType | undefined>(
  undefined
);

export function FileTransferProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<TransferProgress[]>([]);

  const addTransfer = useCallback((transfer: TransferProgress) => {
    setTransfers((prev) => [...prev, transfer]);
  }, []);

  const updateTransfer = useCallback(
    (fileName: string, update: Partial<TransferProgress>) => {
      setTransfers((prev) =>
        prev.map((t) => (t.fileName === fileName ? { ...t, ...update } : t))
      );
    },
    []
  );

  const removeTransfer = useCallback((fileName: string) => {
    setTransfers((prev) => prev.filter((t) => t.fileName !== fileName));
  }, []);

  return (
    <FileTransferContext.Provider
      value={{ transfers, addTransfer, updateTransfer, removeTransfer }}
    >
      {children}
    </FileTransferContext.Provider>
  );
}

export function useFileTransfer() {
  const context = useContext(FileTransferContext);
  if (!context) {
    throw new Error(
      "useFileTransfer must be used within a FileTransferProvider"
    );
  }
  return context;
}
