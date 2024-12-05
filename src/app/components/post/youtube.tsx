"use client";
import YT, { type YouTubeProps } from "react-youtube";

export function YouTubeComponent(props: YouTubeProps) {
  return (
    <div className="relative my-6 h-0 w-full pb-[56.25%]">
      <YT
        opts={{
          height: "100%",
          width: "100%",
        }}
        {...props}
        className="absolute left-0 top-0 h-full w-full"
      />
    </div>
  );
}
