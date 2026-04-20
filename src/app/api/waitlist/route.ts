import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { sendWaitlistWelcomeEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/validation";

export const runtime = "nodejs";

type WaitlistEntry = {
  email: string;
  createdAt: string;
};

type WaitlistRequestBody = {
  email?: string;
};

function resolveDataDir() {
  const configured = process.env.DATA_DIR?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return "/tmp/linkhub-data";
  return path.join(process.cwd(), "data");
}

const WAITLIST_FILE_PATH = path.join(resolveDataDir(), "waitlist.json");

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const content = await fs.readFile(WAITLIST_FILE_PATH, "utf8");
    if (!content.trim()) return [];
    const parsed = JSON.parse(content) as WaitlistEntry[];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return [];
    }
    if (err instanceof SyntaxError) {
      console.warn(
        "[Waitlist] JSON inválido em waitlist.json; ignorando conteúdo atual."
      );
      return [];
    }

    throw error;
  }
}

async function writeWaitlist(entries: WaitlistEntry[]) {
  await fs.mkdir(path.dirname(WAITLIST_FILE_PATH), { recursive: true });
  await fs.writeFile(
    WAITLIST_FILE_PATH,
    JSON.stringify(entries, null, 2),
    "utf8"
  );
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

    const currentEntries = await readWaitlist();
    const alreadyRegistered = currentEntries.some((e) => e.email === email);

    if (!alreadyRegistered) {
      const nextEntries = [
        ...currentEntries,
        { email, createdAt: new Date().toISOString() },
      ];
      await writeWaitlist(nextEntries);
    }

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
    console.error("[Waitlist] Erro ao salvar waitlist:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar seu email agora." },
      { status: 500 }
    );
  }
}
