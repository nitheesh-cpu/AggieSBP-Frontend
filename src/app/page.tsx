import { HomePageMotion } from "@/components/home/home-page";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function HomePage() {
  return (
    <div className={ibmPlexMono.className}>
      <HomePageMotion />
    </div>
  );
}
