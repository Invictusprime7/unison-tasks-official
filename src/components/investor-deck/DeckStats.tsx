const stats = [
  { value: "40+", label: "Edge Functions" },
  { value: "8", label: "Industry Verticals" },
  { value: "24", label: "Premium Templates" },
  { value: "5", label: "Core Intents" },
];

const DeckStats = () => (
  <div className="grid grid-cols-4 gap-4 mb-12">
    {stats.map((s) => (
      <div
        key={s.label}
        className="text-center rounded-xl py-6 px-4 text-white"
        style={{ background: "linear-gradient(135deg, hsl(252,97%,67%) 0%, hsl(263,86%,73%) 100%)" }}
      >
        <div className="text-[32px] font-black">{s.value}</div>
        <div className="text-xs font-medium opacity-85 mt-1">{s.label}</div>
      </div>
    ))}
  </div>
);

export default DeckStats;
