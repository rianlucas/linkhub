import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type FounderPaymentStatus = "pending" | "paid" | "refunded" | "failed";

export type FounderPaymentInfo = {
  paymentId: string;
  status: FounderPaymentStatus;
  amount?: number;
  paymentMethodId?: string;
  paymentTypeId?: string;
  paidAt?: string;
  rawStatus?: string;
  statusDetail?: string;
};

export type FounderEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
  payment?: FounderPaymentInfo;
};

const FOUNDERS_FILE_PATH = path.join(process.cwd(), "data", "founders.json");

async function readAll(): Promise<FounderEntry[]> {
  try {
    const content = await fs.readFile(FOUNDERS_FILE_PATH, "utf8");
    const parsed = JSON.parse(content) as FounderEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
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

type UpsertInput = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
};

export type UpsertResult = {
  status: "created" | "existing";
  founder: FounderEntry;
};

/**
 * Persiste um registro de fundador garantindo unicidade por `email` OU `cpf`.
 *
 * Regras:
 * - Se já existir registro com o mesmo `email` ou mesmo `cpf` → retorna o
 *   registro existente SEM modificar o arquivo (o checkout segue normalmente).
 * - Caso contrário → cria um novo registro.
 */
export async function upsertFounder(
  input: UpsertInput
): Promise<UpsertResult> {
  const entries = await readAll();

  const existing = entries.find(
    (entry) => entry.email === input.email || entry.cpf === input.cpf
  );

  if (existing) {
    return { status: "existing", founder: existing };
  }

  const now = new Date().toISOString();
  const created: FounderEntry = {
    id: randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  await writeAll([...entries, created]);
  return { status: "created", founder: created };
}

export async function findFounder(
  predicate: (entry: FounderEntry) => boolean
): Promise<FounderEntry | null> {
  const entries = await readAll();
  return entries.find(predicate) ?? null;
}

/**
 * Atualiza os dados de pagamento de um fundador (chamado pelo webhook do MP).
 * Tenta casar por `founderId` primeiro; se não achar, tenta por `email`.
 * Retorna `null` se não encontrar nenhum registro.
 */
export async function recordFounderPayment(params: {
  founderId?: string;
  email?: string;
  payment: FounderPaymentInfo;
}): Promise<FounderEntry | null> {
  const entries = await readAll();

  const match = entries.find((entry) => {
    if (params.founderId && entry.id === params.founderId) return true;
    if (params.email && entry.email === params.email.toLowerCase()) return true;
    return false;
  });

  if (!match) return null;

  const now = new Date().toISOString();
  const updated: FounderEntry = {
    ...match,
    payment: params.payment,
    updatedAt: now,
  };

  const next = entries.map((entry) => (entry.id === match.id ? updated : entry));
  await writeAll(next);
  return updated;
}
