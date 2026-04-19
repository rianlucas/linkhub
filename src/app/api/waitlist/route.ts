import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type WaitlistEntry = {
  email: string;
  createdAt: string;
};

type WaitlistRequestBody = {
  email?: string;
};

const WAITLIST_FILE_PATH = path.join(process.cwd(), "data", "waitlist.json");

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const content = await fs.readFile(WAITLIST_FILE_PATH, "utf8");
    const parsed = JSON.parse(content) as WaitlistEntry[];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeWaitlist(entries: WaitlistEntry[]) {
  await fs.mkdir(path.dirname(WAITLIST_FILE_PATH), { recursive: true });
  await fs.writeFile(WAITLIST_FILE_PATH, JSON.stringify(entries, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WaitlistRequestBody;
    const email = normalizeEmail(body.email ?? "");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Informe um email valido." },
        { status: 400 }
      );
    }

    const currentEntries = await readWaitlist();
    const nextEntries = [
      ...currentEntries,
      {
        email,
        createdAt: new Date().toISOString(),
      },
    ];

    await writeWaitlist(nextEntries);

    return NextResponse.json(
      { message: "Voce entrou na lista com sucesso! 🎉" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao salvar waitlist:", error);

    return NextResponse.json(
      { error: "Nao foi possivel salvar seu email agora." },
      { status: 500 }
    );
  }
}
