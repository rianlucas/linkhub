import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type FounderEntry = {
  id: string;
  email: string;
  createdAt: string;
};

function resolveDataDir() {
  const configured = process.env.DATA_DIR?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return "/tmp/linkhub-data";
  return path.join(process.cwd(), "data");
}

const FOUNDERS_FILE_PATH = path.join(resolveDataDir(), "founders.json");

async function readAll(): Promise<FounderEntry[]> {
  try {
    const content = await fs.readFile(FOUNDERS_FILE_PATH, "utf8");
    if (!content.trim()) return [];
    const parsed = JSON.parse(content) as FounderEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return [];
    if (err instanceof SyntaxError) {
      console.warn(
        "[Founders] JSON inválido em founders.json; ignorando conteúdo atual."
      );
      return [];
    }
    throw error;
  }
}

async function writeAll(entries: FounderEntry[]) {
  await fs.mkdir(path.dirname(FOUNDERS_FILE_PATH), { recursive: true });
  await fs.writeFile(
    FOUNDERS_FILE_PATH,
    JSON.stringify(entries, null, 2),
    "utf8"
  );
}

export type UpsertResult = {
  status: "created" | "existing";
  founder: FounderEntry;
};

/**
 * Registra um email no "acesso antecipado" (founders). Se o email já existir,
 * retorna o registro atual sem duplicar.
 */
export async function upsertFounder(email: string): Promise<UpsertResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const entries = await readAll();

  const existing = entries.find((entry) => entry.email === normalizedEmail);
  if (existing) {
    return { status: "existing", founder: existing };
  }

  const created: FounderEntry = {
    id: randomUUID(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  };
  await writeAll([...entries, created]);
  return { status: "created", founder: created };
}
