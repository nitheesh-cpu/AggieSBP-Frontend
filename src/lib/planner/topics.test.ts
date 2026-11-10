import test from "node:test";
import assert from "node:assert/strict";

import {
  canonicalTopic,
  canonicalTopics,
  keyLabel,
  parseTopicKey,
  sameTopic,
  sectionInTopic,
  titleCase,
  topicKey,
  topicLabel,
  topicOf,
} from "./topics.ts";

test("topicOf reads special topics titles", () => {
  assert.equal(topicOf("SPTP: COMPUTER VISION"), "COMPUTER VISION");
  assert.equal(topicOf("SPTP:AGENTIC AI"), "AGENTIC AI");
  assert.equal(topicOf("Special Topics in - Game  Design"), "GAME DESIGN");
});

test("topicOf ignores honors, campus and regular titles", () => {
  assert.equal(topicOf("HNR-ARTIFICIAL INTELLIGENCE"), null);
  assert.equal(topicOf("ARTIFICIAL INTELLIGENCE - GV"), null);
  assert.equal(topicOf("PROGRAM DESIGN AND CONCEPTS"), null);
  assert.equal(topicOf(null), null);
  assert.equal(topicOf("SPTP:"), null);
});

test("topicKey and topicLabel", () => {
  assert.equal(topicKey("CSCE 489", "COMPUTER VISION"), "CSCE 489|COMPUTER VISION");
  assert.equal(topicKey("CSCE 121", null), "CSCE 121");
  assert.equal(topicLabel("CSCE 489", "AI TOOLS FOR INFERENCE"), "CSCE 489: AI Tools for Inference");
  assert.equal(topicLabel("CSCE 121", null), "CSCE 121");
});

test("titleCase keeps short acronyms", () => {
  assert.equal(titleCase("AGENTIC AI"), "Agentic AI");
  assert.equal(titleCase("INTRO TO 3D PRINTING"), "Intro to 3D Printing");
});

test("sameTopic treats truncated titles as one topic", () => {
  assert.equal(sameTopic("MICROELECTROMECH DEV SY", "MICROELECTROMECH DEV SYS"), true);
  assert.equal(sameTopic("COMPUTER VISION", "AGENTIC AI"), false);
  // Short topics aren't cut off, so a longer topic starting with one is different.
  assert.equal(sameTopic("AI", "AI IN BIOLOGY"), false);
  assert.equal(sameTopic(null, null), true);
  assert.equal(sameTopic(null, "AGENTIC AI"), false);
});

test("canonicalTopics keeps the longest of each prefix group", () => {
  const m = canonicalTopics([
    "MICROELECTROMECH DEV SY",
    "MICROELECTROMECH DEV SYS",
    "COMPUTER VISION",
  ]);
  assert.equal(m.get("MICROELECTROMECH DEV SY"), "MICROELECTROMECH DEV SYS");
  assert.equal(m.get("MICROELECTROMECH DEV SYS"), "MICROELECTROMECH DEV SYS");
  assert.equal(m.get("COMPUTER VISION"), "COMPUTER VISION");
  assert.equal(canonicalTopic("AI", ["AI TOOLS", "AGENTIC AI"]), "AI");
});

test("sectionInTopic filters sections by title", () => {
  assert.equal(sectionInTopic("SPTP: COMPUTER VISION", "COMPUTER VISION"), true);
  assert.equal(sectionInTopic("SPTP: AGENTIC AI", "COMPUTER VISION"), false);
  assert.equal(sectionInTopic("SPTP: MICROELECTROMECH DEV SY", "MICROELECTROMECH DEV SYS"), true);
  assert.equal(sectionInTopic("SPTP: AI", "AI IN BIOLOGY"), false);
  assert.equal(sectionInTopic("PROGRAM DESIGN", null), true);
  assert.equal(sectionInTopic("HNR-PROGRAM DESIGN", null), true);
  assert.equal(sectionInTopic("SPTP: AGENTIC AI", null), true);
});

test("parseTopicKey and keyLabel round-trip topicKey", () => {
  assert.deepEqual(parseTopicKey("CSCE 489|COMPUTER VISION"), { code: "CSCE 489", topic: "COMPUTER VISION" });
  assert.deepEqual(parseTopicKey("CSCE 121"), { code: "CSCE 121", topic: null });
  assert.equal(keyLabel(topicKey("CSCE 489", "AGENTIC AI")), "CSCE 489: Agentic AI");
  assert.equal(keyLabel("CSCE 121"), "CSCE 121");
});
