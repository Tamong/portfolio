"use client";

import React from "react";
import Image, { type ImageProps } from "next/image";

interface ImageWithModalProps extends ImageProps {
  alt: string;
}

export const ImageWithModal: React.FC<ImageWithModalProps> = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const closeModal = () => {
    setIsAnimating(false);
    // Wait for animation to finish before unmounting
    setTimeout(() => setIsOpen(false), 200);
  };

  const openModal = () => {
    setIsOpen(true);
    // Start animation after modal is mounted
    requestAnimationFrame(() => setIsAnimating(true));
  };

  return (
    <>
      <Image
        {...props}
        alt={props.alt || ""}
        className="mx-auto my-4 h-auto max-w-full cursor-pointer rounded-lg drop-shadow-2xl transition-transform hover:scale-[1.02]"
        onClick={openModal}
      />

      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex cursor-pointer items-center justify-center transition-all duration-200 ${
            isAnimating
              ? "bg-black/60 backdrop-blur-sm"
              : "bg-black/0 backdrop-blur-none"
          }`}
          onClick={closeModal}
        >
          <div
            className={`relative transition-all duration-200 ${
              isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <Image
              {...props}
              alt={props.alt || ""}
              className="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};
