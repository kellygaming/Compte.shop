"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="mb-6 h-[320px] rounded-2xl border border-border-soft bg-media-empty" />
    );
  }

  return (
    <div className="mb-6">
      <div className="relative h-[320px] overflow-hidden rounded-2xl border border-border-soft bg-media-empty">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 680px, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-2.5 flex gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border"
              style={{
                borderColor:
                  index === active
                    ? "var(--color-border-hover)"
                    : "var(--color-border-soft)",
              }}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
