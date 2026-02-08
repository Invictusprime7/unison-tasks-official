const DeckCard = ({ badge, title, text }: { badge: string; title: string; text: string }) => (
  <div className="bg-[hsl(252,100%,98%)] border border-[hsl(252,60%,92%)] rounded-xl p-6">
    <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-primary bg-[hsl(252,95%,92%)] px-2.5 py-0.5 rounded-full mb-2.5">
      {badge}
    </span>
    <div className="text-[15px] font-bold text-foreground mb-1.5">{title}</div>
    <div className="text-[13px] text-muted-foreground leading-relaxed">{text}</div>
  </div>
);

export default DeckCard;
