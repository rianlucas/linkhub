import { NextResponse } from "next/server";
import { sendWaitlistWelcomeEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/validation";

export const runtime = "nodejs";

type WaitlistRequestBody = {
  email?: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as WaitlistRequestBody;
    const email = normalizeEmail(body.email ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Informe um email válido." },
        { status: 400 }
      );
    }

    // Sem persistência: apenas valida e dispara o email de boas-vindas.

    try {
      await sendWaitlistWelcomeEmail(email);
    } catch (emailError) {
      console.error(
        "[Waitlist] Falha ao enviar email de boas-vindas:",
        emailError
      );
    }

    return NextResponse.json(
      { message: "Você entrou na lista com sucesso! 🎉" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Waitlist] Erro ao processar waitlist:", error);

    return NextResponse.json(
      { error: "Não foi possível processar seu cadastro agora." },
      { status: 500 }
    );
  }
}
