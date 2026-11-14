import type { ReactNode } from "react";

export function Table({ head, children, empty }: { head: ReactNode; children: ReactNode; empty?: string | false }) {
  return (
    <div className="overflow-x-auto border border-divider bg-surface">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-divider bg-muted/60 text-xs uppercase tracking-wide text-foreground/55">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-divider">{children}</tbody>
      </table>
      {empty ? <p className="px-4 py-10 text-center text-sm text-foreground/55">{empty}</p> : null}
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-bold ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
