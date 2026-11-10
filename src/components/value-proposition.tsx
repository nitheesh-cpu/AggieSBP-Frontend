import Image from "next/image";

export const ValueProposition = () => {
  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <h2 className="max-w-xl text-[28px] leading-9 text-text-heading sm:text-[32px] sm:leading-10">
              See how students did in each section before you register
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-text-body">
              Grade distributions from official A&amp;M grade reports sit next to
              professor ratings and course difficulty, so you can rank sections by
              outcomes and pick the one that fits your semester.
            </p>
          </div>

          <div className="flex justify-center lg:col-span-2 lg:justify-end">
            <div className="relative h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72">
              <Image
                src="/aggiering.png"
                alt="Pixel-art Aggie Ring"
                fill
                sizes="288px"
                className="object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
