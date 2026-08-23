import api from "@/lib/axios";
import { ExpiryOption } from "@/types/note.type";

export interface CreateNotePayload {
  secret: string;
  expiry: ExpiryOption;
  passphrase?: string;
}

export interface CreateNoteResponse {
  success: boolean;
  data: {
    token: string;
    expiresAt: string;
  };
  message: string;
}

export interface RevealNoteResponse {
  success: boolean;
  data?: {
    secret?: string;
    attemptsRemaining?: number;
  };
  message: string;
}

export const createNote = async (
  data: CreateNotePayload,
): Promise<CreateNoteResponse> => {
  const response = await api.post<CreateNoteResponse>("/notes", data);
  console.log(response.data);
  return response.data;
};

export const revealNote = async (
  token: string,
  passphrase?: string,
): Promise<RevealNoteResponse> => {
  const response = await api.post<RevealNoteResponse>(
    `/notes/${token}/reveal`,
    {
      passphrase: passphrase?.trim() || undefined,
    },
  );

  console.log("response", response);

  return response.data;
};
