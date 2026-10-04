import type { IconName } from "../ui/icons";
import type { PathId } from "./generators";

export type Story = { title: string; intro: string; outro: string };

export type QuestPath = {
  id: PathId;
  name: string;
  icon: IconName;
  blurb: string;
  /** exactly three chapters of ten levels (the last level of each is a boss) */
  chapters: [Story, Story, Story];
};

export const LEVELS_PER_PATH = 30;
export const CHAPTER_SIZE = 10;
export const QUESTIONS_PER_LEVEL = 8;
export const QUESTIONS_PER_BOSS = 10;

export const PATHS: QuestPath[] = [
  {
    id: "add",
    name: "Paw Plus",
    icon: "circle-plus",
    blurb: "Adding and subtracting",
    chapters: [
      {
        title: "The Cookie Jar Caper",
        intro: "Mochi the kitten found a jar of fish cookies — but the numbers on the lid are all jumbled! Count carefully and the lid pops open.",
        outro: "Pop! The jar opens. Mochi shares the cookies with everyone. Sweet whiskers!",
      },
      {
        title: "Market Street Mix-up",
        intro: "The Sunday market is busy. Stall owners need help adding up bigger piles of treats before the bell rings.",
        outro: "Every stall is balanced and the bell rings on time. The market cats cheer!",
      },
      {
        title: "The Tower of Totals",
        intro: "At the top of the old clock tower sits the Golden Ledger. Climb with big sums and take-aways to reach it.",
        outro: "You reach the Golden Ledger and read the final line: “well added, friend.”",
      },
    ],
  },
  {
    id: "mul",
    name: "Times Trail",
    icon: "x",
    blurb: "Multiplying and dividing",
    chapters: [
      {
        title: "Yarn Ball Factory",
        intro: "Rows and rows of yarn balls roll along the belt. Count them in groups to keep the factory purring.",
        outro: "The belt hums smoothly. Biscuit gets a scarf as thanks!",
      },
      {
        title: "The Sharing Picnic",
        intro: "Twelve friends, a mountain of snacks. Time to share fairly — that means dividing!",
        outro: "Everyone gets a fair share, with tummies full and tails up.",
      },
      {
        title: "Dragon of the Big Products",
        intro: "A sleepy dragon guards a treasure of huge products. Beat its riddles with clever multiplying.",
        outro: "The dragon yawns, smiles, and lets you pass. It only wanted a friend who counts!",
      },
    ],
  },
  {
    id: "frac",
    name: "Slice Valley",
    icon: "pizza",
    blurb: "Fractions, decimals and percent",
    chapters: [
      {
        title: "Pizza Night",
        intro: "Pumpkin ordered one big pizza and must cut it fairly. Halves, quarters, eighths: every slice counts!",
        outro: "Perfect slices all round. Not a crumb left!",
      },
      {
        title: "The Decimal Dock",
        intro: "Fishing boats come in with weights like 2.5 and 0.75. Help the dock master match fractions to decimals.",
        outro: "The catch is weighed and everyone's paid. The dock master gives you a fish-shaped badge.",
      },
      {
        title: "Percent Palace",
        intro: "The palace is having a sale: 10% off, 25% off, even 75% off! Work out the real prices.",
        outro: "You saved the queen a fortune. She names you Royal Slice-Master.",
      },
    ],
  },
  {
    id: "alg",
    name: "Mystery Mountain",
    icon: "variable",
    blurb: "Algebra: find the secret x",
    chapters: [
      {
        title: "The Hidden Number",
        intro: "A mystery box hides a number called x. Balance both sides of the scale and the box reveals itself.",
        outro: "Click! The box opens. x was hiding the whole time.",
      },
      {
        title: "Two-Step Bridge",
        intro: "The bridge needs two moves to cross: undo the plus, then undo the times. Steady paws!",
        outro: "You cross without a wobble. The bridge troll tips his hat.",
      },
      {
        title: "The Summit of Squares",
        intro: "Near the top, the puzzles square up: brackets, products and roots. The view is worth it.",
        outro: "At the summit you can see the whole map. Solving for x feels like magic now.",
      },
    ],
  },
  {
    id: "geo",
    name: "Shape Shore",
    icon: "triangle-right",
    blurb: "Geometry: shapes, angles, area",
    chapters: [
      {
        title: "Sandcastle Corners",
        intro: "Luna is building a sandcastle with square towers and rectangle walls. How much sand and how much fence?",
        outro: "The castle stands tall. Not even the tide can knock it over!",
      },
      {
        title: "Round Island",
        intro: "Everything on this island is round: lakes, fountains, tunnels. Time to meet π.",
        outro: "You measured the whole island. π is officially your friend.",
      },
      {
        title: "Pythagoras Lighthouse",
        intro: "The lighthouse keeper needs the exact length of the ropes. Right triangles to the rescue.",
        outro: "The light shines, the ships are safe, and the keeper gives you a shiny telescope.",
      },
    ],
  },
  {
    id: "trig",
    name: "Wave Peak",
    icon: "audio-waveform",
    blurb: "Trigonometry: sin, cos, tan",
    chapters: [
      {
        title: "SOH CAH TOA Cove",
        intro: "Three sleepy seals teach the oldest rhyme in the bay: SOH, CAH, TOA. Learn their ratios.",
        outro: "The seals clap their flippers. You know the three ratios by heart now.",
      },
      {
        title: "Angles and Radians",
        intro: "A surfer glides along waves of known angles. Swap degrees for radians and ride on.",
        outro: "You ride the last wave and land softly. Radians are no mystery any more.",
      },
      {
        title: "The Unit Circle Crown",
        intro: "At the peak waits the unit circle, with every sine and cosine in its place. Take the crown.",
        outro: "You wear the crown. Mochi bows: “Maths Master of the Meowniverse.”",
      },
    ],
  },
];

export function pathIndex(id: PathId): number {
  return PATHS.findIndex((p) => p.id === id);
}

export function chapterOf(level: number): number {
  return Math.min(2, Math.floor((level - 1) / CHAPTER_SIZE));
}

export function isBoss(level: number): boolean {
  return level % CHAPTER_SIZE === 0;
}
