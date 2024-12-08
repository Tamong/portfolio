import Link from "next/link";

export const metadata = {
  title: "Resume",
  description: "Philip Wallis Resume",
};

export default function Resume() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Resume
      </h1>
      <p>
        Click{" "}
        <Link
          className="text-blue-400 hover:text-blue-600 hover:underline"
          href="/Philip_Wallis_Resume.pdf"
        >
          here
        </Link>{" "}
        if pdf does not load.
      </p>

      <embed
        src="/Philip_Wallis_Resume.pdf"
        type="application/pdf"
        className="flex h-[1010px] w-full bg-white"
      />
    </section>
  );
}
