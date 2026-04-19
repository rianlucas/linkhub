import { MercadoPagoConfig, Preference } from "mercadopago";

function getAccessToken() {
  return (
    process.env.MERCADOPAGO_ACCESS_TOKEN ??
    process.env.MP_ACCESS_TOKEN ??
    ""
  );
}

export function getMercadoPagoConfig() {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Configure MERCADOPAGO_ACCESS_TOKEN (ou MP_ACCESS_TOKEN) no .env"
    );
  }

  return new MercadoPagoConfig({ accessToken });
}

export function getMercadoPagoPreferenceClient() {
  return new Preference(getMercadoPagoConfig());
}

export function getMercadoPagoPublicKey() {
  const publicKey =
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ??
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ??
    "";

  if (!publicKey) {
    throw new Error(
      "Configure NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY (ou NEXT_PUBLIC_MP_PUBLIC_KEY) no .env"
    );
  }

  return publicKey;
}
