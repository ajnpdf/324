import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ToolArtworkProps {
  toolId: string;
  toolName: string;
  className?: string;
  priority?: boolean;
}

/**
 * Lightweight artwork for each public AJN PDF tool.
 * R6 keeps the 4:3 artwork fully visible, removes the old white logo plate,
 * and uses a smaller footprint so horizontal cards stay compact and fast.
 */
export function ToolArtwork({ toolId, toolName, className, priority = false }: ToolArtworkProps) {
  return (
    <span
      className={cn('ajn-tool-artwork relative block shrink-0 overflow-hidden', className)}
      title={toolName}
      aria-hidden="true"
    >
      <Image
        src={`/tool-icons/${toolId}.webp`}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 640px) 64px, 72px"
        className="object-cover"
      />
      <Image
        src="/brand/ajn-logo-transparent.png"
        alt=""
        width={18}
        height={18}
        sizes="18px"
        className="ajn-tool-corner-logo"
      />
    </span>
  );
}
