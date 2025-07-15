import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-card border border-border rounded-xl p-8">
            <h1 className="text-3xl font-bold text-text-heading mb-8">
              Terms of Service & Disclaimer
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-heading mb-4">
                  Service Disclaimer
                </h2>
                <p className="text-text-body mb-4">
                  Aggie Schedule Builder Plus (AggieSB+) is provided on an &quot;as-is&quot; basis. 
                  We make no warranties, expressed or implied, and hereby disclaim and 
                  negate all other warranties including, without limitation, implied 
                  warranties or conditions of merchantability, fitness for a particular 
                  purpose, or non-infringement of intellectual property or other violation 
                  of rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-heading mb-4">
                  Affiliation Disclaimer
                </h2>
                <p className="text-text-body mb-4">
                  AggieSB+ is an independent platform and is NOT affiliated with, 
                  endorsed by, or officially associated with Texas A&M University or 
                  Rate My Professor. Any references to Texas A&M University, its courses, 
                  departments, or faculty are for informational purposes only.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-heading mb-4">
                  Data Accuracy
                </h2>
                <p className="text-text-body mb-4">
                  While we strive to provide accurate and up-to-date information, we 
                  cannot guarantee the accuracy, completeness, or reliability of any 
                  data displayed on this platform. Course information, professor ratings, 
                  and other data may be outdated, incorrect, or incomplete.
                </p>
                <p className="text-text-body mb-4">
                  Users are advised to verify all information independently and consult 
                  official university resources before making academic decisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-heading mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-text-body mb-4">
                  In no event shall AggieSB+ or its creators be liable for any special, 
                  direct, indirect, consequential, or incidental damages or any damages 
                  whatsoever, whether in an action of contract, negligence, or other tort, 
                  arising out of or in connection with the use of this service or the 
                  contents of this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-heading mb-4">
                  Use at Your Own Risk
                </h2>
                <p className="text-text-body mb-4">
                  By using this service, you acknowledge and agree that you use the 
                  information provided at your own risk. We reserve the right to make 
                  changes to our service and these terms at any time without notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-heading mb-4">
                  Contact
                </h2>
                <p className="text-text-body mb-4">
                  If you have any questions about these terms or our service, please 
                  contact us through our feedback form.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-text-muted text-sm">
                  Last updated: December 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}