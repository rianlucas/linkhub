import { NextResponse } from "next/server";
import { upsertFounder } from "@/server/founders/store";
import { isValidCpf, isValidEmail, onlyDigits } from "@/lib/validation";

export const runtime = "nodejs";

type FounderRequestBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  cpf?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FounderRequestBody;

    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const cpf = onlyDigits(body.cpf ?? "");

    const fieldErrors: Record<string, string> = {};
    if (!firstName) fieldErrors.firstName = "Informe seu nome.";
    if (!lastName) fieldErrors.lastName = "Informe seu sobrenome.";
    if (!isValidEmail(email)) fieldErrors.email = "Email inválido.";
    if (!isValidCpf(cpf)) fieldErrors.cpf = "CPF inválido.";

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: "Dados inválidos.", fieldErrors },
        { status: 400 }
      );
    }

    const result = await upsertFounder({ firstName, lastName, email, cpf });

    return NextResponse.json(
      { founder: result.founder, status: result.status },
      { status: result.status === "created" ? 201 : 200 }
    );
  } catch (error) {
    console.error("[Founders] Falha ao salvar registro:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar seus dados agora." },
      { status: 500 }
    );
  }
}
