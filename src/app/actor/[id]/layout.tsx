import Image from "next/image";
import { ACTORS } from "@/data/actors";

export default async function ActorLayout({
  params,
  bio,
  awards,
  social,
  knownfor,
  similar,
}: {
  params: Promise<{ id: string }>;
  bio: React.ReactNode;
  awards: React.ReactNode;
  social: React.ReactNode;
  knownfor: React.ReactNode;
  similar: React.ReactNode;
}) {
  const { id } = await params;

  const actor =
    ACTORS.find((a) => a.id === Number(id)) ||
    ACTORS[0];

  return (
    <div className="container mx-auto px-4 py-8">

      {/* HERO */}
      <div className="relative h-[420px] rounded-xl overflow-hidden mb-12">
        <Image
          src={actor.coverImage}
          alt={actor.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90" />

        <div className="relative h-full flex items-end pb-8 px-6">
          <div className="flex gap-8 items-end">
            <Image
              src={actor.image}
              alt={actor.name}
              width={180}
              height={180}
              className="rounded-xl border-4 border-black object-cover"
            />
            <h1 className="text-4xl font-bold">
              {actor.name}
            </h1>
          </div>
        </div>
      </div>

      {/* TOP PANELS */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        {bio}
        {awards}
        {social}
      </section>

      {/* FILMOGRAPHY */}
      <section className="mb-20">
        {knownfor}
      </section>

      {/* SIMILAR ACTORS */}
      <section>
        {similar}
      </section>
    </div>
  );
}
