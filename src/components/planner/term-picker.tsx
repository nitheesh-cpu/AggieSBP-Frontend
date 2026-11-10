"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Term } from "@/lib/api";
import { shortTermName, sortTermsForMenu } from "@/lib/terms";

/** Term menu: College Station terms first, then other campuses and sessions. */
export function TermPicker({
  terms,
  value,
  onChange,
}: {
  terms: Term[];
  value: string;
  onChange: (term: string) => void;
}) {
  const { main, other } = sortTermsForMenu(terms);
  const selected = terms.find((t) => t.termCode === value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[12rem]" aria-label="Term">
        <SelectValue placeholder="Loading terms…">{shortTermName(selected)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {main.map((t) => (
            <SelectItem key={t.termCode} value={t.termCode}>
              {shortTermName(t)}
            </SelectItem>
          ))}
        </SelectGroup>
        {other.length > 0 && (
          <SelectGroup>
            <SelectLabel>Other campuses and sessions</SelectLabel>
            {other.map((t) => (
              <SelectItem key={t.termCode} value={t.termCode}>
                {t.termDesc}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
