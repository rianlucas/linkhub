"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import CheckoutModal from "@/components/CheckoutModal";

type CheckoutModalContextValue = {
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
};

const CheckoutModalContext = createContext<CheckoutModalContextValue | null>(
  null
);

export function CheckoutModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openCheckoutModal = useCallback(() => setOpen(true), []);
  const closeCheckoutModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openCheckoutModal, closeCheckoutModal }),
    [openCheckoutModal, closeCheckoutModal]
  );

  return (
    <CheckoutModalContext.Provider value={value}>
      {children}
      {open ? <CheckoutModal onClose={closeCheckoutModal} /> : null}
    </CheckoutModalContext.Provider>
  );
}

export function useCheckoutModal() {
  const ctx = useContext(CheckoutModalContext);
  if (!ctx) {
    throw new Error(
      "useCheckoutModal precisa ser usado dentro de <CheckoutModalProvider>."
    );
  }
  return ctx;
}
