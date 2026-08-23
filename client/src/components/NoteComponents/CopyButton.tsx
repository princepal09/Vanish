import {
  Check,
  Copy,
} from "lucide-react";

import { CopyToClipboard } from "react-copy-to-clipboard";

import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  value: string;
  copied: boolean;
  setCopied: (value: boolean) => void;
}

const CopyButton = ({
  value,
  copied,
  setCopied,
}: CopyButtonProps) => {
  const handleCopy = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <CopyToClipboard
      text={value}
      onCopy={handleCopy}
    >
      <Button
        type="button"
        variant="outline"
        className="border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08] hover:text-white"
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </>
        )}
      </Button>
    </CopyToClipboard>
  );
};

export default CopyButton;