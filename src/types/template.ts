// Enhanced Template Model with Data Binding

export type LayoutMode = "fixed" | "hug" | "fill";
export type FlexDirection = "row" | "column";
export type AlignItems = "flex-start" | "center" | "flex-end" | "stretch";
export type JustifyContent = "flex-start" | "center" | "flex-end" | "space-between" | "space-around";

export interface LayoutConstraints {
  width: { mode: LayoutMode; value?: number };
  height: { mode: LayoutMode; value?: number };
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
  gap?: number;
  flexDirection?: FlexDirection;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
}

export interface DataBinding {
  field: string; // e.g., "title", "price", "imageUrl"
  type: "text" | "image" | "number" | "color" | "url";
  defaultValue?: any;
  format?: string; // e.g., "${0}", "$${0.00}"
}

export interface TemplateComponent {
  id: string;
  type: "text" | "image" | "shape" | "container" | "button" | "video";
  name: string;
  constraints: LayoutConstraints;
  dataBinding?: DataBinding;
  style: {
    backgroundColor?: string;
    borderRadius?: number;
    opacity?: number;
    filters?: string[];
  };
  children?: TemplateComponent[];
  fabricProps?: Record<string, any>; // Fabric.js specific properties
}

export interface TemplateSection {
  id: string;
  name: string;
  type: "hero" | "content" | "gallery" | "cta" | "footer" | "custom";
  constraints: LayoutConstraints;
  components: TemplateComponent[];
}

export interface TemplateVariant {
  id: string;
  name: string;
  size: { width: number; height: number };
  format: "web" | "instagram-story" | "instagram-post" | "facebook-post" | "twitter" | "presentation" | "email";
}

export interface TemplateBrandKit {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  logoUrl?: string;
}

export interface TemplateData {
  [key: string]: any; // Dynamic data that can be bound to components
}

export interface AIGeneratedTemplate {
  id: string;
  name: string;
  description: string;
  industry?: string;
  brandKit: TemplateBrandKit;
  sections: TemplateSection[];
  variants: TemplateVariant[];
  data: TemplateData;
  createdAt: string;
  updatedAt: string;
}

export interface AITemplatePrompt {
  industry: string;
  goal: string;
  format: TemplateVariant["format"];
  brandKit?: Partial<TemplateBrandKit>;
  targetAudience?: string;
  keyMessages?: string[];
  preferredStyle?: "modern" | "classic" | "minimal" | "bold" | "playful";
}
