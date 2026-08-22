export type ExpiryOption = "5m" | "1h" | "24h" | "7d";

export interface CreateNoteInput {
  secret: string;
  expiry: ExpiryOption;
  passphrase?: string;
}
