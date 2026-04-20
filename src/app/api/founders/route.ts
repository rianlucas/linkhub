import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validation";
import { sendEarlyAccessWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

type FounderRequestBody = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as FounderRequestBody;
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Email inválido.",
          fieldErrors: { email: "Informe um email válido." },
        },
        { status: 400 }
      );
    }

    // Sem persistência: apenas valida e dispara o email de confirmação.
    try {
      await sendEarlyAccessWelcomeEmail(email);
    } catch (emailError) {
      console.error(
        "[Founders] Falha ao enviar email de boas-vindas (acesso antecipado):",
        emailError
      );
    }

    return NextResponse.json(
      {
        message:
          "Email confirmado! Em instantes você recebe as próximas instruções.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Founders] Falha ao processar acesso antecipado:", error);
    return NextResponse.json(
      { error: "Não foi possível processar seu cadastro agora." },
      { status: 500 }
    );
  }
}
