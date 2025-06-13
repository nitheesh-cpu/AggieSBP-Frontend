"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const MissionSection = () => {
  return (
    <section className="w-full px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px]">
            {/* Left Column - Copy (40%) */}
            <div className="lg:col-span-2 p-12 flex flex-col justify-center">
              <h2 className="text-text-heading text-2xl font-semibold mb-6 leading-tight">
                Our mission
              </h2>
              <p className="text-text-body text-lg mb-8 leading-relaxed max-w-sm">
                We believe every Aggie deserves transparent, data-backed guidance to shape their academic journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-button-primary text-button-primary-text hover:bg-button-primary/90 transition-colors duration-[220ms] ease-out px-6 py-3 rounded-full font-medium text-sm"
                >
                  Meet the team
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-text-body hover:bg-button-hover transition-colors duration-[220ms] ease-out px-6 py-3 rounded-full font-medium text-sm border border-border"
                >
                  Careers
                </Button>
              </div>
            </div>

            {/* Right Column - Mosaic (60%) */}
            <div className="lg:col-span-3 h-[400px] lg:h-auto">
              <div className="h-full grid grid-cols-6 grid-rows-5 gap-0">
                {/* Row 1 */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Campus scene" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Student life" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Academic building" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Library scene" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Research lab" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Campus quad" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>

                {/* Row 2 */}
                <div className="bg-gradient-to-br from-pink-500 to-pink-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Graduation ceremony" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Kyle Field" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Engineering complex" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Student center" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Classroom scene" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Memorial Student Center" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>

                {/* Row 3 */}
                <div className="bg-gradient-to-br from-teal-500 to-blue-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Reveille mascot" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Corps of Cadets" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Bush Library" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-yellow-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Aggie Ring" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Muster ceremony" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Bonfire tradition" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>

                {/* Row 4 */}
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Academic Plaza" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-emerald-400 to-green-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Research facility" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-sky-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Gig 'em hand sign" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Student organizations" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Howdy Week" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-700 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="George H.W. Bush statue" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>

                {/* Row 5 */}
                <div className="bg-gradient-to-br from-cyan-400 to-blue-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Century Tree" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-lime-400 to-green-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Fish Camp" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-yellow-500 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Spirit of Aggieland" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-fuchsia-500 to-pink-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Big Event volunteer" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="Aggie Network" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 relative overflow-hidden">
                  <img src="/api/placeholder/80/80" alt="12th Man tradition" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};