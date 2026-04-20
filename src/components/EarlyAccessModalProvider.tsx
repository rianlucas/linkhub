"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import EarlyAccessModal from "@/components/EarlyAccessModal";
import { trackEvent } from "@/lib/analytics";

type EarlyAccessModalContextValue = {
  openEarlyAccessModal: (source?: string) => void;
  closeEarlyAccessModal: () => void;
};

const EarlyAccessModalContext =
  createContext<EarlyAccessModalContextValue | null>(null);

export function EarlyAccessModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openEarlyAccessModal = useCallback((source?: string) => {
    trackEvent("open_early_access_modal", { source: source ?? "unknown" });
    setOpen(true);
  }, []);
  const closeEarlyAccessModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openEarlyAccessModal, closeEarlyAccessModal }),
    [openEarlyAccessModal, closeEarlyAccessModal]
  );

  return (
    <EarlyAccessModalContext.Provider value={value}>
      {children}
      {open ? <EarlyAccessModal onClose={closeEarlyAccessModal} /> : null}
    </EarlyAccessModalContext.Provider>
  );
}

export function useEarlyAccessModal() {
  const ctx = useContext(EarlyAccessModalContext);
  if (!ctx) {
    throw new Error(
      "useEarlyAccessModal precisa ser usado dentro de <EarlyAccessModalProvider>."
    );
  }
  return ctx;
}
