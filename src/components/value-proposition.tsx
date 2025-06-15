export const ValueProposition = () => {
  return (
    <section className="w-full bg-canvas py-20">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left Column - Copy (60%) */}
          <div className="lg:col-span-3">
            <div className="max-w-2xl">
              <p className="text-lg leading-relaxed text-text-body mb-6">
                Aggies love how effortless it is to stack-rank professors by
                real outcomes—grade distributions, course rigor, and peer
                reviews.
              </p>
              <p className="text-lg leading-relaxed text-text-body">
                Our data engine surfaces the most accurate, up-to-date insights
                to guide your next semester schedule.
              </p>
            </div>
          </div>

          {/* Right Column - Isometric Graphic (40%) */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end">
            <div className="relative w-96 h-96 opacity-20">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Isometric Texas A&M Academic Building Wireframe */}
                {/* Base foundation */}
                <path
                  d="M50 350 L350 350 L380 320 L80 320 Z"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Main building structure - isometric cube */}
                <path
                  d="M80 320 L80 180 L200 180 L200 320 Z"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Right side face */}
                <path
                  d="M200 180 L230 150 L230 290 L200 320 Z"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Top face */}
                <path
                  d="M80 180 L110 150 L230 150 L200 180 Z"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Tower structure */}
                <path
                  d="M120 180 L120 100 L160 100 L160 180 Z"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Tower right face */}
                <path
                  d="M160 100 L180 80 L180 160 L160 180 Z"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Tower top */}
                <path
                  d="M120 100 L140 80 L180 80 L160 100 Z"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Windows grid on main building */}
                <g stroke="#3A3A3A" strokeWidth="0.5" opacity="0.7">
                  {/* Vertical window lines */}
                  <line x1="100" y1="200" x2="100" y2="300" />
                  <line x1="120" y1="200" x2="120" y2="300" />
                  <line x1="140" y1="200" x2="140" y2="300" />
                  <line x1="160" y1="200" x2="160" y2="300" />
                  <line x1="180" y1="200" x2="180" y2="300" />

                  {/* Horizontal window lines */}
                  <line x1="90" y1="220" x2="190" y2="220" />
                  <line x1="90" y1="240" x2="190" y2="240" />
                  <line x1="90" y1="260" x2="190" y2="260" />
                  <line x1="90" y1="280" x2="190" y2="280" />
                </g>

                {/* Steps/entrance */}
                <g stroke="#3A3A3A" strokeWidth="1" fill="none">
                  <path d="M90 320 L90 330 L190 330 L190 320" />
                  <path d="M95 330 L95 340 L185 340 L185 330" />
                  <path d="M100 340 L100 350 L180 350 L180 340" />
                </g>

                {/* Dome/cupola on tower */}
                <ellipse
                  cx="150"
                  cy="90"
                  rx="20"
                  ry="10"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Flag pole */}
                <line
                  x1="150"
                  y1="90"
                  x2="150"
                  y2="60"
                  stroke="#3A3A3A"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
