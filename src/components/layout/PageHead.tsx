import type { ReactNode } from "react";

// Title block that sits straight on the sky, under the top row.
export function PageHead({ title, sub, right, lead }: { title: string; sub?: string; right?: ReactNode; lead?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 px-2 pt-4 pb-5">
      <div className="flex items-center gap-3 min-w-0">
        {lead}
        <div className="min-w-0">
          <h1 className="th-display th-on-sky text-[1.7rem] font-normal leading-tight break-words">{title}</h1>
          {sub && <p className="th-on-sky text-[0.88rem] opacity-90 mt-1">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
