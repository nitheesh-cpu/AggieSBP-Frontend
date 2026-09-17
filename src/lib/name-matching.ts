const SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "phd", "md"]);

type ParsedName = {
  given: string[];
  surname: string[];
};

function tokens(value: string): string[] {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z]/g, ""))
    .filter((part) => part.length > 0 && !SUFFIXES.has(part));
}

export function parseProfessorName(name: string): ParsedName {
  if (name.includes(",")) {
    const [surname, ...given] = name.split(",");
    return { given: tokens(given.join(" ")), surname: tokens(surname) };
  }

  const parts = tokens(name);
  if (parts.length <= 1) return { given: [], surname: parts };
  if (parts.at(-1)?.length === 1) {
    return { given: [parts.at(-1)!], surname: parts.slice(0, -1) };
  }
  return { given: parts.slice(0, -1), surname: parts.slice(-1) };
}

export function professorNamesMatch(left: string, right: string): boolean {
  const a = parseProfessorName(left);
  const b = parseProfessorName(right);
  if (a.surname.length === 0 || b.surname.length === 0) return false;

  const surnameMatches = a.surname.some((aName) =>
    b.surname.some((bName) => aName === bName),
  );
  if (!surnameMatches) return false;
  if (a.given.length === 0 || b.given.length === 0) return true;

  return a.given.some((aName) =>
    b.given.some(
      (bName) =>
        aName === bName ||
        (aName.length === 1 && aName[0] === bName[0]) ||
        (bName.length === 1 && aName[0] === bName[0]),
    ),
  );
}
