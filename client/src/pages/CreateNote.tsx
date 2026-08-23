import { useState } from "react";
import { Shield, Lock, Clock, Copy, Check } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createNote } from "@/api/note.api";

import { CreateNoteFormData, createNoteSchema } from "@/types/note.type";

import CopyButton from "@/components/NoteComponents/CopyButton";

const CreateNote = () => {
  const [generatedLink, setGeneratedLink] = useState("");

  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteFormData>({
    resolver: zodResolver(createNoteSchema),

    defaultValues: {
      secret: "",
      expiry: "5m",
      passphrase: "",
    },
  });

  const expiry = watch("expiry");

  const onSubmit = async (data: CreateNoteFormData) => {
    try {
      setGeneratedLink("");
      setCopied(false);
      console.log(data);

      const response = await createNote({
        secret: data.secret,
        expiry: data.expiry,
        passphrase: data.passphrase?.trim() || undefined,
      });

      const token = response.data.token;

      const link = `${window.location.origin}/note/${token}`;

      setGeneratedLink(link);

      // Clear sensitive data
      reset();
    } catch (error) {
      console.error("Create note failed:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080808] text-white">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[500px]  -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10 sm:px-6 lg:py-16">
        {/* Header */}

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Vanish
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400 sm:text-base">
            Create a secret link that disappears after it is revealed.
          </p>
        </header>

        {/* Main Card */}

        <Card className="border-white/10 bg-[#111111] text-white shadow-2xl shadow-black/40">
          <CardHeader className="border-b border-white/[0.06] px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                <Lock className="h-5 w-5 text-zinc-300" strokeWidth={1.7} />
              </div>

              <div>
                <CardTitle className="text-lg font-medium text-white">
                  Create a secret note
                </CardTitle>

                <CardDescription className="mt-1 text-zinc-500">
                  Your secret is encrypted before being stored.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-7 sm:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              {/* Secret */}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="secret"
                    className="text-sm font-medium text-zinc-200"
                  >
                    Secret
                  </Label>

                  <span className="text-xs text-zinc-600">Encrypted</span>
                </div>

                <Textarea
                  id="secret"
                  placeholder="Enter your secret..."
                  rows={8}
                  {...register("secret")}
                  disabled={isSubmitting}
                  className="resize-none border-white/10 bg-[#0b0b0b] text-white placeholder:text-zinc-700 focus-visible:border-white/30 focus-visible:ring-0"
                />

                {errors.secret && (
                  <p className="text-sm text-red-400">
                    {errors.secret.message}
                  </p>
                )}
              </div>

              {/* Options */}

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Expiry */}

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    Expire after
                  </Label>

                  <Select
                    value={expiry}
                    onValueChange={(value) =>
                      setValue(
                        "expiry",
                        value as CreateNoteFormData["expiry"],
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="border-white/10 bg-[#0b0b0b] text-zinc-200 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="border-white/10 bg-[#151515] text-white">
                      <SelectItem value="5m">5 minutes</SelectItem>

                      <SelectItem value="1h">1 hour</SelectItem>

                      <SelectItem value="24h">24 hours</SelectItem>

                      <SelectItem value="7d">7 days</SelectItem>
                    </SelectContent>
                  </Select>

                  {errors.expiry && (
                    <p className="text-sm text-red-400">
                      {errors.expiry.message}
                    </p>
                  )}
                </div>

                {/* Passphrase */}

                <div className="space-y-3">
                  <Label
                    htmlFor="passphrase"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-200"
                  >
                    <Lock className="h-4 w-4 text-zinc-500" />
                    Passphrase
                    <span className="text-xs text-zinc-600">Optional</span>
                  </Label>

                  <Input
                    id="passphrase"
                    type="password"
                    placeholder="Add protection"
                    {...register("passphrase")}
                    disabled={isSubmitting}
                    className="border-white/10 bg-[#0b0b0b] text-white placeholder:text-zinc-700 focus-visible:border-white/30 focus-visible:ring-0"
                  />

                  {errors.passphrase && (
                    <p className="text-sm text-red-400">
                      {errors.passphrase.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Security information */}

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex gap-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                  <p className="text-xs leading-5 text-zinc-500">
                    Your secret is encrypted before storage and permanently
                    destroyed when revealed.
                  </p>
                </div>
              </div>

              {/* Submit */}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-white text-black hover:bg-zinc-200"
              >
                {isSubmitting
                  ? "Creating secure note..."
                  : "Generate Secret Link"}
              </Button>
            </form>

            {/* Generated Link */}

            {generatedLink && (
              <div className="mt-8 border-t border-white/[0.06] pt-7">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />

                    <h3 className="text-sm font-medium text-white">
                      Secret link created
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-zinc-500">
                    Save this link. The secret can only be revealed once.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="border-white/10 bg-[#080808] font-mono text-xs text-zinc-300 focus-visible:ring-0"
                  />

                  <CopyButton
                    value={generatedLink}
                    copied={copied}
                    setCopied={setCopied}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}

        <footer className="mt-8 text-center">
          <p className="text-xs text-zinc-700">
            VANISH • ONE-TIME SECRET SHARING
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CreateNote;
