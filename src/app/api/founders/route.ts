import { NextResponse } from "next/server";
import { upsertFounder } from "@/server/founders/store";
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

    const result = await upsertFounder(email);

    // Envio de email é best-effort: se falhar, logamos e seguimos.
    // Assim o usuário não perde o cadastro por um problema momentâneo na Resend.
    try {
      await sendEarlyAccessWelcomeEmail(result.founder.email);
    } catch (emailError) {
      console.error(
        "[Founders] Falha ao enviar email de boas-vindas (acesso antecipado):",
        emailError
      );
    }

    return NextResponse.json(
      {
        status: result.status,
        founder: { id: result.founder.id, email: result.founder.email },
        message:
          result.status === "created"
            ? "Email confirmado! Em instantes você recebe as próximas instruções."
            : "Você já estava cadastrado. Reenviamos as instruções para o seu email.",
      },
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
