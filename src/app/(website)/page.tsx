import Image from "next/image";

export default async function Home() {
  return (
    <section className="text-md flex flex-col gap-6 py-4">
      <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-4">
          <p>
            {`Hello! I am Philip Wallis, a software engineer based in Texas,
            USA (Currently in Montgomery, Alabama, USA).`}
          </p>

          <p>
            {`My technical interests are in Artificial Intelligence, Computer
            Vision, and modern Web Development.`}
          </p>
          <p>
            {`I recently started a new role at Hyundai Mobis as an IT Specialist,
            where I work on enterprise security platforms, IT asset management,
            and ensuring compliance with global standards.`}
          </p>
          <p>
            {`I am also taking the next step in my academic path by pursuing a Master's
            degree in Computer Science at the Georgia Institute of Technology (Georgia Tech).`}
          </p>
        </div>
        <Image
          src={"/me.png"}
          alt="Philip"
          width={300}
          height={200}
          className="rounded-xl"
        />
      </div>
    </section>
  );
}
