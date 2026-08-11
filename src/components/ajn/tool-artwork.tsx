import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ToolArtworkProps {
  toolId: string;
  toolName: string;
  className?: string;
  priority?: boolean;
}

/**
 * Branded artwork for every public AJN PDF tool.
 * The asset filename follows the canonical tool id, so routing, search,
 * category pages and related-tool cards always reference the same artwork.
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
        sizes="(max-width: 640px) 104px, 120px"
        className="object-cover"
      />
    </span>
  );
}
