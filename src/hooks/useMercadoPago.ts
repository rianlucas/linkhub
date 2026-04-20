"use client";

import { useCallback, useState } from "react";

export type CheckoutPayload = {
  founderId?: string;
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  cpf?: string;
};

type CreateCheckoutResponse = {
  preferenceId?: string;
  initPoint?: string;
  error?: string;
};

export function useMercadoPago() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMercadoPagoCheckout = useCallback(
    async (checkoutData: CheckoutPayload = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/mercadopago/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutData),
        });

        const data = (await response.json()) as CreateCheckoutResponse;

        if (!response.ok || !data.initPoint) {
          throw new Error(data.error ?? "Não foi possível abrir o checkout.");
        }

        window.location.assign(data.initPoint);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao abrir o checkout.";
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return { createMercadoPagoCheckout, loading, error };
}

export default useMercadoPago;
