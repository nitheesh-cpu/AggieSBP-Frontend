/**
 * Special topics courses (e.g. CSCE 489) are several different classes under
 * one course number; each section's title names its topic, like
 * "SPTP: COMPUTER VISION". Only that prefix marks a topic: honors
 * ("HNR-ARTIFICIAL INTELLIGENCE") and campus ("… - GV") titles differ too but
 * are the same class.
 *
 * No runtime imports, so `node --test` can run the tests directly.
 */

const TOPIC_RE = /^\s*(?:SPTP|SPECIAL\s+TOPICS(?:\s+IN)?)\s*[:\-–]\s*(.+?)\s*$/i;

/** The topic named by a section title, or null for a regular course. */
export function topicOf(title: string | null | undefined): string | null {
  if (!title) return null;
  const m = TOPIC_RE.exec(title);
  if (!m) return null;
  const topic = m[1].replace(/\s+/g, " ").trim().toUpperCase();
  return topic || null;
}

/** Identity of a course or one of its topics: "CSCE 489" or "CSCE 489|COMPUTER VISION". */
export function topicKey(code: string, topic: string | null | undefined): string {
  return topic ? `${code}|${topic}` : code;
}

/** "CSCE 489: Computer Vision" style label; plain code for regular courses. */
export function topicLabel(code: string, topic: string | null | undefined): string {
  return topic ? `${code}: ${titleCase(topic)}` : code;
}

/** Title case that keeps short all-caps words like AI, ML, UX, 3D as written. */
export function titleCase(text: string): string {
  const small = new Set([
    "and", "or", "of", "in", "for", "the", "to", "a", "an", "on", "with",
    "at", "by", "as", "is", "it", "vs", "be", "do", "go", "my", "we", "us",
  ]);
  return text
    .toLowerCase()
    .split(" ")
    .map((w, i) => {
      const upper = w.toUpperCase();
      if (/^[a-z]{1,2}$/.test(w) && !small.has(w)) return upper; // AI, ML, UX
      if (/\d/.test(w)) return upper; // 3D, IOT2
      if (i > 0 && small.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/**
 * Howdy cuts titles off at about 30 characters ("SPTP: " + 24), and not always
 * at the same spot ("MICROELECTROMECH DEV SYS" vs "... DEV SY"). Only a topic
 * that long can be a cut-off copy of another; a short one like "AI" is its own
 * topic even if another topic starts with it ("AI IN BIOLOGY").
 */
const TRUNCATED_MIN = 20;

function truncatedFrom(short: string, long: string): boolean {
  return short.length >= TRUNCATED_MIN && long.length > short.length && long.startsWith(short);
}

/** Two topics of one course are the same when equal or one is a cut-off copy of the other. */
export function sameTopic(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return !a && !b;
  return a === b || truncatedFrom(a, b) || truncatedFrom(b, a);
}

/**
 * Canonical form of `topic` among the topics seen for one course: the longest
 * one it is a cut-off copy of (itself when none). Ties go to the alphabetically first.
 */
export function canonicalTopic(topic: string, known: Iterable<string>): string {
  let best = topic;
  for (const k of known) {
    if (k !== topic && !truncatedFrom(topic, k)) continue;
    if (k.length > best.length || (k.length === best.length && k < best)) best = k;
  }
  return best;
}

/** Map each topic (of one course) to its canonical form. */
export function canonicalTopics(topics: Iterable<string>): Map<string, string> {
  const all = [...new Set(topics)];
  return new Map(all.map((t) => [t, canonicalTopic(t, all)]));
}

/** Whether a section's title belongs to `topic`; with no topic (a regular course) every section does. */
export function sectionInTopic(
  title: string | null | undefined,
  topic: string | null | undefined,
): boolean {
  if (!topic) return true;
  return sameTopic(topicOf(title), topic);
}

/** Inverse of `topicKey`: "CSCE 489|COMPUTER VISION" -> { code, topic }. */
export function parseTopicKey(key: string): { code: string; topic: string | null } {
  const i = key.indexOf("|");
  return i < 0 ? { code: key, topic: null } : { code: key.slice(0, i), topic: key.slice(i + 1) || null };
}

/** Display label for a key from `topicKey`. */
export function keyLabel(key: string): string {
  const { code, topic } = parseTopicKey(key);
  return topicLabel(code, topic);
}
