import type { ReactNode } from "react";

const DeckSection = ({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) => (
  <div className="mb-12">
    <h2 className="text-[22px] font-extrabold text-foreground mb-2 pb-2 border-b-[3px] border-primary inline-block">
      {title}
    </h2>
    {desc && <p className="text-[15px] text-muted-foreground mb-6">{desc}</p>}
    {!desc && <div className="mb-6" />}
    {children}
  </div>
);

export default DeckSection;
