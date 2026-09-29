import heroStudio from "@/assets/hero-studio.jpg";
import portrait from "@/assets/portrait.jpg";
import studioDesk from "@/assets/studio-desk.jpg";
import workBloom from "@/assets/work-bloom.jpg";
import workHalftone from "@/assets/work-halftone.jpg";
import workPapermoon from "@/assets/work-papermoon.jpg";
import workVerdant from "@/assets/work-verdant.jpg";

export const artist = {
  name: "Ariann Norori",
  studio: "ARIA",
  role: "Creative digital designer & artist",
  email: "hello@ariannorori.com",
  portrait,
  studioDesk,
  heroStudio,
  introduction:
    "I’m a versatile image-maker moving between illustrative children’s books, custom portfolio art, character worlds, and digital experiences.",
  approach:
    "I begin with story and character, then choose the medium that can carry the idea most honestly. A commission might become a tactile picture-book spread, an expressive cast of characters, or a cinematic digital world. The visual language changes; my curiosity, clarity, and care remain constant.",
} as const;

export type PortfolioProject = {
  slug: string;
  index: string;
  title: string;
  year: string;
  discipline: string;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  image: string;
  alt: string;
  size: "wide" | "portrait" | "square";
};

export const projects: PortfolioProject[] = [
  {
    slug: "bloom",
    index: "01",
    title: "Bloom",
    year: "2024",
    discipline: "Children’s publishing · Illustration",
    summary:
      "A bright picture-book world where tiny garden characters learn that growing happens at different speeds.",
    challenge:
      "Create a visual language that feels joyful to early readers while giving adults enough detail to discover something new on every reread.",
    approach:
      "I built the cast from simple silhouettes, hand-cut shapes, and expressive eyes. Color scripts mapped the emotional arc before I composed the final spreads.",
    outcome:
      "A complete character family, cover direction, twelve key spreads, and a flexible illustration system for reading materials and launch artwork.",
    image: workBloom,
    alt: "Colorful geometric artwork from the Bloom children’s book project",
    size: "wide",
  },
  {
    slug: "halftone-press",
    index: "02",
    title: "Halftone Press",
    year: "2023",
    discipline: "Editorial · Custom digital art",
    summary:
      "An expressive portfolio edition pairing hand-drawn forms with layered halftone textures and unexpected editorial pacing.",
    challenge:
      "Turn a varied body of commissioned artwork into one coherent object without flattening the personality of each piece.",
    approach:
      "The system uses a restrained grid as a quiet frame, allowing scale, texture, and image sequencing to create the rhythm.",
    outcome:
      "A print-ready artist portfolio, digital companion, and modular page system that can grow with future commissions.",
    image: workHalftone,
    alt: "Layered halftone editorial artwork in a printed portfolio",
    size: "portrait",
  },
  {
    slug: "verdant-motion",
    index: "03",
    title: "Verdant Motion",
    year: "2023",
    discipline: "Character design · Motion",
    summary:
      "A family of botanical characters designed to move, react, and communicate a playful sustainability story.",
    challenge:
      "Make an environmental message feel imaginative and emotionally direct rather than instructional.",
    approach:
      "Each character began with a distinct movement verb. Those gestures informed silhouette, expression, timing, and the final motion language.",
    outcome:
      "Six original characters, a short animated film, social loops, and an adaptable motion toolkit for campaign storytelling.",
    image: workVerdant,
    alt: "Green three-dimensional botanical character from Verdant Motion",
    size: "square",
  },
  {
    slug: "paper-moon",
    index: "04",
    title: "Paper Moon",
    year: "2022",
    discipline: "Art direction · Digital portfolio",
    summary:
      "A cinematic portfolio for a photographer, shaped as a quiet sequence of images, pauses, and close-looking moments.",
    challenge:
      "Present a large image archive without turning the work into a repetitive grid or losing the intimacy of a printed monograph.",
    approach:
      "I treated scrolling as page turning, alternating full-bleed plates with spare captions and unexpected changes in scale.",
    outcome:
      "A responsive portfolio direction, project taxonomy, image sequencing system, and launch-ready visual identity.",
    image: workPapermoon,
    alt: "Editorial monograph and digital portfolio artwork for Paper Moon",
    size: "wide",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const commissionSteps = [
  ["01", "Listen", "A focused conversation about the story, audience, and feeling the work needs to carry."],
  ["02", "Discover", "Visual research, sketches, and character studies reveal the most promising creative route."],
  ["03", "Make", "I develop the chosen direction through considered rounds of drawing, design, and refinement."],
  ["04", "Release", "Final artwork arrives prepared for its real setting, with the files and guidance needed to use it well."],
] as const;