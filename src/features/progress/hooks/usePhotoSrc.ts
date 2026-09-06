import { useEffect, useState } from "react";

import { resolvePhotoSrc } from "@/services/progressPhotoService";

/**
 * Resolve a stored progress-photo reference to a loadable <img> src.
 * Async because the on-device container path is only known at read time.
 */
export function usePhotoSrc(stored?: string): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!stored) {
      setSrc(null);
      return;
    }

    let active = true;

    resolvePhotoSrc(stored)
      .then((resolved) => {
        if (active) setSrc(resolved);
      })
      .catch(() => {
        if (active) setSrc(null);
      });

    return () => {
      active = false;
    };
  }, [stored]);

  return src;
}
