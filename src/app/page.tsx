import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { DepartmentTabs } from "@/components/department-tabs";
import { ValueProposition } from "@/components/value-proposition";
import { ComparisonSlider } from "@/components/comparison-slider";
import { CourseTable } from "@/components/course-table";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { MissionSection } from "@/components/mission-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <Navigation />

      <main>
        <HeroSection />
        <DepartmentTabs />
        <ValueProposition />
        <ComparisonSlider />
        <CourseTable />
        <TestimonialCarousel />
        <MissionSection />
      </main>

      <Footer />
    </div>
  );
}
