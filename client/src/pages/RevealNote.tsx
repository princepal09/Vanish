import { useState } from "react";

import { useParams } from "react-router-dom";

import axios from "axios";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { AlertTriangle, Eye, Lock, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { revealNote } from "@/api/note.api";

import { z } from "zod";

const revealSchema = z.object({
  passphrase: z.string().optional(),
});

type RevealFormData = z.infer<typeof revealSchema>;

type RevealState = "READY" | "REVEALED" | "GONE" | "ERROR";

const RevealNote = () => {
  const { token } = useParams<{
    token: string;
  }>();

  const [state, setState] = useState<RevealState>("READY");

  const [secret, setSecret] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null,
  );

  //   console.log("geel")
  console.log(attemptsRemaining);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RevealFormData>({
    resolver: zodResolver(revealSchema),
  });

  const onSubmit = async (data: RevealFormData) => {
    if (!token) {
      setState("GONE");
      return;
    }

    try {
      setErrorMessage("");
      setAttemptsRemaining(null);

      const response = await revealNote(token, data.passphrase);
      console.log(response);

      if (response.success && response.data?.secret) {
        setSecret(response.data.secret);

        setState("REVEALED");

        return;
      }

      setErrorMessage(response.message || "Unable to reveal note.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        const data = error.response?.data;

        console.log("data", data);

        // Note gone

        if (status === 404) {
          setState("GONE");
          return;
        }

        // Wrong passphrase

        if (status === 401) {
          setErrorMessage(data?.message || "Incorrect passphrase.");

          if (typeof data?.data?.attemptsRemaining === "number") {
            setAttemptsRemaining(data.data.attemptsRemaining);
          }

          return;
        }

        // Too many attempts

        if (status === 410) {
          setState("GONE");

          setErrorMessage(data?.message || "This note has been destroyed.");

          return;
        }
      }

      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  // ----------------------------------------
  // GONE
  // ----------------------------------------

  if (state === "GONE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4 text-white">
        <Card className="w-full max-w-md border-white/10 bg-[#111111] text-white">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>

            <h1 className="text-2xl font-semibold">This note is gone</h1>

            <p className="mt-3 text-sm text-zinc-500">
              This secret has already been revealed, expired, or destroyed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------
  // REVEALED
  // ----------------------------------------

  if (state === "REVEALED") {
    return (
      <div className="min-h-screen bg-[#080808] px-4 py-10 text-white">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
            </div>

            <h1 className="text-3xl font-semibold">Secret Revealed</h1>

            <p className="mt-2 text-sm text-zinc-500">
              This note has now been destroyed.
            </p>
          </div>

          <Card className="border-white/10 bg-[#111111] text-white">
            <CardContent className="p-6">
              <div className="rounded-lg border border-white/10 bg-[#080808] p-5">
                <p className="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-zinc-200">
                  {secret}
                </p>
              </div>

              <div className="mt-5 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
                <p className="text-xs leading-5 text-zinc-500">
                  This secret was retrieved successfully and the note has been
                  permanently destroyed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // READY
  // ----------------------------------------

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
        <Card className="w-full border-white/10 bg-[#111111] text-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05]">
              <Eye className="h-7 w-7 text-zinc-300" />
            </div>

            <CardTitle className="text-2xl">Reveal Secret</CardTitle>

            <CardDescription className="mt-2 text-zinc-500">
              This secret can only be revealed once.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6 rounded-lg border border-yellow-500/10 bg-yellow-500/[0.03] p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />

                <p className="text-xs leading-5 text-zinc-400">
                  Once revealed, this note will be permanently destroyed. Make
                  sure you are ready to view it.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="passphrase" className="text-zinc-200">
                  Passphrase
                  <span className="ml-1 text-zinc-600">(if required)</span>
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                  <Input
                    id="passphrase"
                    type="password"
                    placeholder="Enter passphrase"
                    {...register("passphrase")}
                    className="border-white/10 bg-[#080808] pl-10 text-white placeholder:text-zinc-700 focus-visible:ring-0"
                    disabled={isSubmitting}
                  />
                </div>

                {errors.passphrase && (
                  <p className="text-sm text-red-400">
                    {errors.passphrase.message}
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/[0.05] p-3">
                  <p className="text-sm text-red-400">{errorMessage}</p>

                  {attemptsRemaining !== null && (
                    <p className="mt-1 text-xs text-red-400/70">
                      {attemptsRemaining} attempts remaining
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full bg-white text-black hover:bg-zinc-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Revealing..." : "Reveal Secret"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevealNote;
