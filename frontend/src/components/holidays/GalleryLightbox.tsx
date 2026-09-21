"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";

/**
 * Photo grid with a keyboard-accessible lightbox. It uses the native <dialog> element, so focus
 * is trapped while open, Esc closes it and the page behind is inert. ← / → move between photos.
 */
export function GalleryLightbox({ images, title }: { images: readonly string[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const count = images.length;

  const open = useCallback((i: number, opener: HTMLElement) => {
    openerRef.current = opener;
    setIndex(i);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + count) % count)),
    [count],
  );

  // Keep state and the native dialog in sync (Esc and backdrop clicks close it natively).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setIndex(null);
      openerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {images.map((img, i) => (
          <Reveal key={img + i} y={24} scale={0.97} delay={i * 0.06}>
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              aria-label={`View ${title} photo ${i + 1} of ${count} full size`}
              className="group relative block h-28 w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light sm:h-40"
            >
              <Image
                src={img}
                alt={`${title} photo ${i + 1}`}
                fill
                sizes="(min-width: 640px) 200px, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-[#080f1c]/0 transition-colors duration-300 group-hover:bg-[#080f1c]/15" />
            </button>
          </Reveal>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${title} photo gallery`}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[#080f1c]/90 backdrop:backdrop-blur-sm"
      >
        {index !== null && (
          <div className="relative flex h-full w-full items-center justify-center px-4 py-16 sm:px-20">
            <div className="relative h-full w-full max-w-5xl">
              <Image
                key={index}
                src={images[index]}
                alt={`${title} photo ${index + 1}`}
                fill
                sizes="90vw"
                priority
                className="animate-[lightbox-in_0.35s_var(--ease-out)] object-contain"
              />
            </div>

            <p className="absolute left-1/2 top-5 -translate-x-1/2 text-xs font-medium tracking-wide text-white/80">
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X size={20} />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
