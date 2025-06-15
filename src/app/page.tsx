import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { DepartmentTabs } from "@/components/department-tabs";
import { ValueProposition } from "@/components/value-proposition";
import { CourseTable } from "@/components/course-table";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <Navigation />

      <main className="flex flex-col justify-center items-center w-full">
        <HeroSection />
        <DepartmentTabs />
        <ValueProposition />
        <CourseTable />
      </main>

      <Footer />
    </div>
  );
}
