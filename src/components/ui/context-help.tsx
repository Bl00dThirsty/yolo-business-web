import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
export function ContextHelp({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip.Provider delayDuration={450}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="bw-help"
            aria-label={label}
            onClick={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          >
            <Info size={15} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={8}
            collisionPadding={16}
            className="z-[120] max-w-[280px] rounded-lg bg-[#191414] px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
          >
            {children}
            <Tooltip.Arrow className="fill-[#191414]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
