import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MovedSteps } from "./moved-steps";

/**
 * Where the old address's Home Screen app lands (D-053). Installed apps from
 * aggieschedulebuilderplus.vercel.app open its start_url, and the Vercel
 * redirect sends exactly that launch here. The old app can't be moved:
 * notification permission and the install belong to the old address, so the
 * user has to add the app again from aggiesbp.com.
 */
export const metadata: Metadata = {
  title: "AggieSB+ has a new address",
  robots: { index: false, follow: false },
};

export default function MovedPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Navigation />
      <main className="px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-xl">
          <h1 className="text-[28px] font-medium leading-tight text-text-heading sm:text-[32px]">
            AggieSB+ moved to aggiesbp.com
          </h1>
          <p className="mt-4 text-base leading-7 text-text-body">
            The app on your Home Screen still opens the old address. Add it again from
            aggiesbp.com so seat alerts keep reaching you. Your watched sections are saved to
            your account, so nothing is lost.
          </p>
          <MovedSteps />
        </div>
      </main>
      <Footer />
    </div>
  );
}
