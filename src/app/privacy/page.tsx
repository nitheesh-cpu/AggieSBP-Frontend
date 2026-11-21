import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AnalyticsOptOut } from "@/components/analytics-opt-out";

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-8">
      <h2 className="text-2xl font-medium text-text-heading mb-4">{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-text-body mb-4">{children}</p>;
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 space-y-2 text-text-body mb-4">{children}</ul>;
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-card border border-border rounded-xl p-5 sm:p-8">
            <h1 className="text-[32px] leading-tight font-medium text-text-heading mb-2">
              Privacy Policy
            </h1>
            <p className="text-text-muted text-sm mb-8">Last updated: 2026-11-17</p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8 rounded-lg border border-border p-4">
                <h2 className="text-xl font-medium text-text-heading mb-3">The short version</h2>
                <List>
                  <li>
                    This covers the AggieSB+ website and the AggieSB+ browser extension. We are
                    an independent, student-built project, not Texas A&amp;M University.
                  </li>
                  <li>
                    You can use the site and the extension without an account. An account is
                    only needed for seat alerts and for saving your plan across devices.
                  </li>
                  <li>
                    We count how the site and extension are used with a self-hosted analytics
                    tool. It sets no cookies, and you can turn it off.
                  </li>
                  <li>
                    You can delete your account yourself, any time, from your profile page. It
                    removes your account and the data stored with it right away.
                  </li>
                  <li>
                    The extension&apos;s usage counts never include your name, email, student
                    ID, grades, courses or professors.
                  </li>
                  <li>
                    We do not sell your data, show ads, or use it to decide credit, jobs or
                    anything else about you.
                  </li>
                </List>
              </section>

              <Section title="Who we are">
                <P>
                  Aggie Schedule Builder Plus (AggieSB+) is run by an independent student
                  developer. It is not affiliated with, endorsed by, or operated by Texas A&amp;M
                  University or RateMyProfessors. See also our{" "}
                  <Link href="/terms" className="underline">
                    Terms of Service
                  </Link>
                  . Questions about this policy: <a href="mailto:nckodarapu@gmail.com" className="underline">nckodarapu@gmail.com</a>.
                </P>
              </Section>

              <Section id="website-analytics" title="Website analytics">
                <P>
                  We use Umami, which we host ourselves at stats.nitheeshk.com, to see which pages
                  and features get used. It sets no cookies and is not an advertising or
                  third-party tracking network. Analytics is only collected on the live website,
                  not on local or preview copies.
                </P>
                <P>It records:</P>
                <List>
                  <li>
                    Page views, plus browser, operating system, device type, screen size,
                    language and country, taken from the visit itself.
                  </li>
                  <li>
                    Actions such as searches (how many results), filters, clicks on navigation
                    links and tools, running the schedule builder (counts only, such as how many
                    classes and options), starring courses, comparing courses or professors, and
                    sign-in start and completion.
                  </li>
                  <li>
                    For searches that find nothing, the first 40 characters of what was typed,
                    lowercased, so we can fix missing courses. These are sorted into a rough kind
                    (course code, CRN, a person&apos;s name, or other text).
                  </li>
                  <li>
                    Course codes on actions like starring a course or watching a section, and the
                    names of API requests that failed (with IDs removed).
                  </li>
                  <li>
                    A few coarse yes/no tags on a visit: whether you are signed in, whether you
                    have a saved plan, light or dark theme, and whether you opened the site as a
                    home screen app. We never send your account ID, email or name to analytics.
                  </li>
                </List>
                <P>
                  For a sample of visits, Umami also collects heatmap data: where people click
                  and how far they scroll. We do not record session replays; Umami&apos;s replay
                  feature is turned off for this site. Everything typed into a form field is
                  masked, so typed text is never captured. Admin pages are never recorded. When
                  the extension opens the planner with your Howdy course list, the page moves
                  that list out of the address bar immediately, before any analytics script can
                  see it.
                </P>
                <P>
                  You can turn website analytics and heatmap collection off for this browser. This saves a
                  flag in your browser&apos;s local storage; clearing site data resets it.
                </P>
                <AnalyticsOptOut />
              </Section>

              <Section id="accounts" title="Accounts">
                <P>
                  Signing in is optional. We use SuperTokens (running on our own server) with
                  either email and password or Google sign-in. We store your email address and an
                  account ID. For email sign-in, your password is handled by SuperTokens and is
                  stored only as a hash. If you use Google, we receive your email address from
                  Google; we do not receive your Google password.
                </P>
                <P>
                  You can delete your account yourself from your{" "}
                  <Link href="/profile" className="underline">
                    profile page
                  </Link>{" "}
                  (Delete account). See &quot;Retention and your choices&quot; below for what is
                  removed.
                </P>
                <P>
                  While you are signed in, session tokens are kept in cookies in your browser so
                  you stay signed in. The extension reads and refreshes these tokens from the
                  AggieSB+ website&apos;s cookies, so you do not have to sign in twice. The site
                  may also keep small preference cookies (for example, sidebar state).
                </P>
              </Section>

              <Section id="seat-alerts" title="Seat alerts and notifications">
                <P>When you watch a full section for an open seat, we store:</P>
                <List>
                  <li>Your account ID with the section you watch and its term.</li>
                  <li>
                    If you turn on notifications: your browser&apos;s Web Push subscription (a push
                    service address and encryption keys), an optional device name, and your
                    browser&apos;s user-agent string, with times it was created and last seen. The
                    push service is run by your browser vendor (for example Google or Mozilla),
                    and receives the notification text so it can deliver it.
                  </li>
                  <li>
                    A delivery log of each notification we tried to send: your account ID, the
                    section, course and time, and whether it was sent, failed or the subscription
                    had expired (with a short error reason).
                  </li>
                </List>
                <P>
                  When a seat-alert notification is shown, clicked or dismissed, your browser also
                  sends the course code and term to our analytics. This contains no account
                  information.
                </P>
                <P>
                  You can remove a watched section or a notification device at any time. When a
                  push service reports a subscription as gone, we delete it. Watches are also
                  removed automatically 30 days after the end of their term.
                </P>
              </Section>

              <Section id="planner" title="Saved plans and imported courses">
                <P>
                  If you are signed in, the planner saves your course record (course codes, terms,
                  grades and credit type you entered or imported, and your classification) and
                  your plan to your account so it follows you between devices. We use it only to
                  show it back to you.
                </P>
                <P>
                  Courses imported from Howdy through the extension are passed to the planner in
                  the page address after the &quot;#&quot;, which browsers do not send to servers,
                  and are kept in your browser&apos;s session storage. They reach our servers only
                  if you are signed in and the planner saves them to your account as described
                  above.
                </P>
              </Section>

              <Section id="public-data" title="Public data we show">
                <P>
                  Grade distributions come from public Texas A&amp;M grade data (via anex.us),
                  professor ratings and reviews come from RateMyProfessors, and course and section
                  information comes from the public Texas A&amp;M catalog and schedule. These are
                  public sources about courses and instructors, not data about you. Review
                  summaries may be generated with AI.
                </P>
              </Section>

              <Section id="extension" title="Browser extension">
                <P>The AggieSB+ extension runs on two sites:</P>
                <List>
                  <li>
                    <strong>tamu.collegescheduler.com</strong>: it reads the courses and sections
                    shown on the page (and your College Scheduler cart, to offer seat alerts) so
                    it can show professor ratings and grade information. It asks our server for
                    data about those courses, so course codes and terms are sent to our server. If
                    you choose to watch a section, the section ID and term are sent along with
                    your sign-in token.
                  </li>
                  <li>
                    <strong>howdy.tamu.edu</strong>: only when you use the import helper on the
                    degree planner page, it reads the course table and opens the AggieSB+ planner
                    in a new tab with that list after the &quot;#&quot; in the address. It does
                    not send your Howdy data to our servers.
                  </li>
                </List>
                <P>
                  The extension stores settings (theme, panel options, your usage-stats choice) in
                  your browser&apos;s extension storage and caches some responses locally. It does
                  not read or store your TAMU password.
                </P>
                <h3 className="text-lg font-medium text-text-heading mb-2">
                  Anonymous usage counts
                </h3>
                <P>
                  The extension sends anonymous usage events to our self-hosted Umami server at
                  stats.nitheeshk.com. Each event contains only its name, the extension version,
                  your browser language, an optional screen size, the site it came from
                  (College Scheduler, Howdy, popup or onboarding), and the fields listed below.
                  Requests carry no cookies or account identifiers, and no names, emails, student
                  IDs, grades, course codes, course lists or professor names. Events are limited
                  to this fixed list; anything else is dropped, and sending is rate limited.
                </P>
                <List>
                  <li>ext-installed and ext-updated: browser (chrome or firefox) and, for updates, the previous version number.</li>
                  <li>ext-page-enhanced and ext-panel-open: the kind of page (sections, current schedule, scheduler, curriculum, planner, evaluate, other).</li>
                  <li>ext-professor-action: whether you opened details, RateMyProfessors, or an expanded summary.</li>
                  <li>ext-seat-alert-add: whether the watch was added by a scan or manually.</li>
                  <li>ext-howdy-import: counts of courses imported (total, completed, in progress, planned) and of terms. Counts only.</li>
                  <li>ext-fit-import: the number of busy time blocks imported.</li>
                  <li>ext-popup-open: the popup was opened.</li>
                </List>
                <P>
                  To turn this off, open the extension popup, go to Settings, and switch off
                  &quot;Send anonymous usage stats&quot;. In Firefox, nothing is sent unless you
                  give Firefox&apos;s data collection consent for the extension.
                </P>
              </Section>

              <Section id="sharing" title="Who can see your data">
                <P>
                  We do not sell your data or share it for advertising. It is stored on servers we
                  control and with our hosting providers (including Vercel for the website), who
                  handle it only to run the service. Push notifications pass through your browser
                  vendor&apos;s push service, and Google sign-in is handled by Google. We may
                  disclose information if the law requires it.
                </P>
                <P>
                  We do not use your data for advertising, profiling, or to decide credit,
                  lending, employment or insurance.
                </P>
              </Section>

              <Section id="retention" title="Retention and your choices">
                <P>
                  We keep each kind of data for a set time, then delete it. Deletion is a
                  scheduled job that runs daily.
                </P>
                <List>
                  <li>
                    Your account (email and sign-in), saved plan and schedules, watched sections
                    and notification devices: kept until you delete your account.
                  </li>
                  <li>
                    Watched sections: deleted automatically 30 days after the end of the term
                    they were for, if you have not removed them sooner.
                  </li>
                  <li>
                    Notification delivery log: deleted after 180 days.
                  </li>
                  <li>
                    Analytics: aggregate analytics are kept for site statistics. We do not link
                    analytics to your account. Turn it off with the controls above or in the
                    extension.
                  </li>
                  <li>
                    Browser data (settings, a plan not saved to an account, cached data): clear it
                    in your browser, or uninstall the extension.
                  </li>
                </List>
                <h3 className="text-lg font-medium text-text-heading mb-2">
                  Deleting your account
                </h3>
                <P>
                  Open your{" "}
                  <Link href="/profile" className="underline">
                    profile page
                  </Link>
                  , choose Delete account, and type DELETE to confirm. This immediately and
                  permanently deletes your sign-in account (email and password hash or Google
                  link), your watched sections, your notification devices, your saved course
                  record, plan and schedules, and your notification delivery log. You are signed
                  out everywhere, and it cannot be undone. Analytics are not tied to your account, so there is nothing to delete there.
                </P>
                <P>
                  If you cannot sign in, or the button does not work, email <a href="mailto:nckodarapu@gmail.com" className="underline">nckodarapu@gmail.com</a> and we
                  will delete your account for you.
                </P>
              </Section>

              <Section id="children" title="Children">
                <P>
                  AggieSB+ is meant for university students. It is not directed at children under
                  13 and we do not knowingly collect their information. If you think a child has
                  given us data, contact us and we will delete it.
                </P>
              </Section>

              <Section id="changes" title="Changes to this policy">
                <P>
                  We may update this policy as the site or extension changes. The date at the top
                  shows the latest version. If a change meaningfully expands what we collect, we
                  will say so on the site or in the extension&apos;s update notes.
                </P>
              </Section>

              <Section id="contact" title="Contact">
                <P>
                  Questions, or help deleting your account: <a href="mailto:nckodarapu@gmail.com" className="underline">nckodarapu@gmail.com</a>. You can also reach
                  us through our feedback form.
                </P>
              </Section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
