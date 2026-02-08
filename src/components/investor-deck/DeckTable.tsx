interface DeckTableProps {
  headers: string[];
  rows: string[][];
  centerFrom?: number;
}

const thClass =
  "text-left font-bold text-primary p-2.5 border-b-2 border-[hsl(252,60%,92%)] text-xs uppercase tracking-wide";
const tdClass = "p-2.5 border-b border-border text-sm text-muted-foreground";

const DeckTable = ({ headers, rows, centerFrom }: DeckTableProps) => (
  <table className="w-full border-collapse text-[13px]">
    <thead>
      <tr>
        {headers.map((h, i) => (
          <th
            key={h}
            className={thClass}
            style={centerFrom !== undefined && i >= centerFrom ? { textAlign: "center" } : undefined}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, ri) => (
        <tr key={ri}>
          {row.map((cell, ci) => {
            const isCenter = centerFrom !== undefined && ci >= centerFrom;
            const color =
              cell === "✓"
                ? "text-green-600"
                : cell === "✗"
                  ? "text-red-600"
                  : cell === "$$" || cell === "Partial"
                    ? "text-amber-600"
                    : "";
            return (
              <td
                key={ci}
                className={`${tdClass} ${ci === 0 ? "font-medium" : ""} ${color} ${isCenter ? "text-center font-bold" : ""}`}
              >
                {cell}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
);

export default DeckTable;
