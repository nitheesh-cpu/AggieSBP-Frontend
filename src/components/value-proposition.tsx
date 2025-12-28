import Image from "next/image";

export const ValueProposition = () => {
  return (
    <section className="w-full py-20">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left Column - Copy (60%) */}
          <div className="lg:col-span-3">
            <div className="max-w-2xl">
              {/* Heading styled like the reference card */}
              <h2 className="text-[20px] sm:text-[24px] md:text-[26px] text-text-heading dark:text-white text-center leading-relaxed mb-8">
                Aggie students love how effortless it is to stack-rank
                professors by real outcomes.
              </h2>

              {/* Body copy with left accent line */}
              <div className="flex gap-4">
                <div className="w-[2px] rounded-full bg-[#FFCF3F]" />
                <p className="text-[11px] sm:text-[12px] md:text-[13px] leading-relaxed text-text-body">
                  Our data engine surfaces the most accurate, up-to-date
                  insights to guide your next semester schedule. Grade
                  distributions, course rigor, and peer reviews at a glance.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Aggie Ring Pixel Art (40%) */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end">
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
              <Image
                src="/aggiering.png"
                alt="Aggie Ring"
                fill
                className="object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
