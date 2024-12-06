import { ImageResponse } from "next/og";
import { metaData } from "@/app/config";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@700&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const regex = /src: url\((.+)\) format\('(opentype|truetype)'\)/;
  const resource = regex.exec(css);

  if (resource && resource.length > 1 && resource[1]) {
    const fontUrl = resource[1]; // Now fontUrl is guaranteed to be a string
    const response = await fetch(fontUrl);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") ?? metaData.title;
  const name = "Philip Wallis";

  return new ImageResponse(
    (
      <div tw="flex w-full h-full justify-center items-center bg-[#192b4a] text-white">
        <h1 tw="text-6xl">{title}</h1>
        <h1 tw="absolute bottom-4 left-8 text-4xl">{name}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist Mono",
          data: await loadGoogleFont("Geist Mono", `${title} ${name}`),
          style: "normal",
        },
      ],
    },
  );
}
