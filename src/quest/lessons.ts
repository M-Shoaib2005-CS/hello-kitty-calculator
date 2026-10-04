import type { PathId } from "./generators";

export type LessonCard = { title: string; body: string; example: string };
export type Lesson = {
  /** one line shown on the map: what this chapter teaches */
  skills: string;
  cards: [LessonCard, LessonCard, LessonCard];
};

/** LESSONS[path][chapterIndex]: shown before the first level of each chapter and reachable from the map. */
export const LESSONS: Record<PathId, [Lesson, Lesson, Lesson]> = {
  add: [
    {
      skills: "Adding and subtracting up to 20",
      cards: [
        { title: "Adding is joining", body: "Start at the bigger number and count on. That is quicker than counting both piles.", example: "8 + 3: start at 8, then say 9, 10, 11. The answer is 11." },
        { title: "Subtracting is taking away", body: "Count back, or ask what you must add to the small number to reach the big one.", example: "13 − 5: 5 + 8 = 13, so 13 − 5 = 8." },
        { title: "Make a ten", body: "Split one number so that you reach 10 first. Tens are easy to work with.", example: "8 + 6 = 8 + 2 + 4 = 10 + 4 = 14." },
      ],
    },
    {
      skills: "Two-digit sums, carrying, three numbers",
      cards: [
        { title: "Tens and ones", body: "Split each number into tens and ones. Add the tens, add the ones, then join them.", example: "47 + 28: 40 + 20 = 60, 7 + 8 = 15, so 60 + 15 = 75." },
        { title: "Carrying", body: "If the ones add up to more than 9, carry a ten into the tens column.", example: "38 + 27: ones 8 + 7 = 15, write 5 and carry 1. Tens 3 + 2 + 1 = 6. Answer 65." },
        { title: "Subtract by counting up", body: "To find 82 − 47, count up from 47 to 82 in easy jumps and add the jumps.", example: "47 → 50 is 3, 50 → 80 is 30, 80 → 82 is 2. Total 3 + 30 + 2 = 35." },
      ],
    },
    {
      skills: "Three-digit sums, missing numbers, below zero",
      cards: [
        { title: "Column by column", body: "Line up hundreds, tens and ones. Work from the ones, carrying or borrowing as you go.", example: "256 + 187: ones 13 (carry 1), tens 5 + 8 + 1 = 14 (carry 1), hundreds 2 + 1 + 1 = 4. Answer 443." },
        { title: "Missing numbers", body: "A question mark is a mystery number. Use the opposite operation to find it.", example: "? + 237 = 512 → 512 − 237 = 275." },
        { title: "Going below zero", body: "If you take away more than you have, you pass zero and the answer is negative.", example: "5 − 9: take 5 to reach 0, then 4 more. The answer is −4." },
      ],
    },
  ],
  mul: [
    {
      skills: "Times tables 2 to 7, simple division",
      cards: [
        { title: "Groups of", body: "Multiplying is adding equal groups. The first number is how many groups, the second is how many in each.", example: "4 × 3 means 4 groups of 3: 3 + 3 + 3 + 3 = 12." },
        { title: "Easy tricks", body: "×2 doubles. ×5 ends in 0 or 5. ×10 adds a zero. Use them as stepping stones.", example: "6 × 5 = 30. 7 × 10 = 70. 7 × 2 = 14." },
        { title: "Division is the reverse", body: "To work out 24 ÷ 6, ask: what times 6 makes 24?", example: "6 × 4 = 24, so 24 ÷ 6 = 4." },
      ],
    },
    {
      skills: "Tables up to 12, word problems, two-digit × one-digit",
      cards: [
        { title: "The tricky ones", body: "Most mistakes happen with 6, 7, 8 and 9. Say them out loud and notice patterns.", example: "7 × 8 = 56 (think 5, 6, 7, 8: 56 = 7 × 8). 9 × 6 = 54." },
        { title: "Split the tens", body: "Break the bigger number into tens and ones, multiply each part, then add.", example: "34 × 6 = 30 × 6 + 4 × 6 = 180 + 24 = 204." },
        { title: "Word problems", body: "Find the number of groups and the size of each group, then multiply.", example: "5 boxes with 8 treats each: 5 × 8 = 40 treats." },
      ],
    },
    {
      skills: "Bigger products, remainders, order of operations",
      cards: [
        { title: "Times ten, then the rest", body: "For numbers in the teens, multiply by 10, then by the leftover, then add.", example: "17 × 12 = 17 × 10 + 17 × 2 = 170 + 34 = 204." },
        { title: "Remainders", body: "Find the biggest multiple that fits. What is left over is the remainder.", example: "23 ÷ 5: 5 × 4 = 20, and 23 − 20 = 3. Answer: 4 remainder 3." },
        { title: "Order of operations", body: "Multiply and divide before you add and subtract (BODMAS).", example: "3 + 4 × 2 = 3 + 8 = 11, not 14." },
      ],
    },
  ],
  frac: [
    {
      skills: "Fraction of an amount, same-bottom sums, equivalents",
      cards: [
        { title: "A fraction of an amount", body: "The bottom number says how many equal parts. Divide by it, then multiply by the top.", example: "3/4 of 12: 12 ÷ 4 = 3, then 3 × 3 = 9." },
        { title: "Same bottom, just add", body: "When the bottom numbers match, add the tops and keep the bottom.", example: "2/9 + 4/9 = 6/9." },
        { title: "Equivalent fractions", body: "Multiply the top and bottom by the same number. The value stays the same. Bigger bottoms mean smaller slices.", example: "1/2 = 2/4 = 4/8. And 1/3 is bigger than 1/5." },
      ],
    },
    {
      skills: "Simplifying, unlike bottoms, decimals",
      cards: [
        { title: "Simplify", body: "Divide the top and the bottom by a number that goes into both.", example: "12/18: divide both by 6 to get 2/3." },
        { title: "Different bottoms", body: "Make the bottoms the same first, then add the tops.", example: "1/2 + 1/3 = 3/6 + 2/6 = 5/6." },
        { title: "Decimals and fractions", body: "Decimals are fractions of 10, 100 and so on. Learn the common ones, and line up the point when adding.", example: "0.5 = 1/2, 0.25 = 1/4, 0.75 = 3/4, 0.2 = 1/5." },
      ],
    },
    {
      skills: "Multiplying and dividing fractions, percent",
      cards: [
        { title: "Multiply fractions", body: "Tops times tops, bottoms times bottoms. Then simplify.", example: "2/3 × 3/4 = 6/12 = 1/2." },
        { title: "Divide fractions", body: "Keep the first, flip the second, then multiply.", example: "1/2 ÷ 1/4 = 1/2 × 4/1 = 4/2 = 2." },
        { title: "Percent", body: "Percent means out of a hundred. 10% is ÷ 10, 50% is ÷ 2, 25% is ÷ 4.", example: "25% of 80 = 80 ÷ 4 = 20." },
      ],
    },
  ],
  alg: [
    {
      skills: "One-step equations",
      cards: [
        { title: "x is a mystery number", body: "A letter stands for a number you do not know yet. Your job is to find it.", example: "x + 3 = 8 means: what number plus 3 makes 8?" },
        { title: "Keep the balance", body: "An equation is a balanced scale. Whatever you do to one side, do to the other.", example: "x + 3 = 8 → take 3 from both sides → x = 5." },
        { title: "Use the opposite", body: "Plus and minus undo each other. Times and divide undo each other.", example: "4x = 20 → divide both sides by 4 → x = 5." },
      ],
    },
    {
      skills: "Two-step equations, substituting, brackets",
      cards: [
        { title: "Two steps", body: "Undo the plus or minus first, then undo the times or divide.", example: "2x + 3 = 11 → 2x = 8 → x = 4." },
        { title: "Substitute", body: "To evaluate an expression, replace the letter with its number. Multiply before you add.", example: "If x = 3, then 4x + 2 = 4 × 3 + 2 = 14." },
        { title: "Brackets", body: "Multiply everything inside the bracket by the number outside.", example: "3(x + 4) = 3x + 12." },
      ],
    },
    {
      skills: "x on both sides, two brackets, factorising",
      cards: [
        { title: "x on both sides", body: "Collect the x terms on one side and the numbers on the other.", example: "3x + 2 = x + 10 → 2x = 8 → x = 4." },
        { title: "Two brackets", body: "Multiply each part of the first bracket by each part of the second, then collect.", example: "(x + 2)(x + 3) = x² + 5x + 6." },
        { title: "Solve by factorising", body: "Find two numbers that multiply to the last number and add to the middle one.", example: "x² − 5x + 6 = 0 → (x − 2)(x − 3) = 0 → x = 2 or 3." },
      ],
    },
  ],
  geo: [
    {
      skills: "Perimeter, area, angle facts",
      cards: [
        { title: "Perimeter and area", body: "Perimeter is the distance around a shape. Area is the space inside it.", example: "A 5 by 3 rectangle: perimeter 5 + 3 + 5 + 3 = 16, area 5 × 3 = 15." },
        { title: "Area of rectangles and squares", body: "Multiply the length by the width. A square just multiplies its side by itself.", example: "A square with side 6 has area 6 × 6 = 36." },
        { title: "Angle facts", body: "Angles in a triangle add up to 180°. Angles on a straight line also add up to 180°.", example: "A triangle with 60° and 70° has a third angle of 180 − 130 = 50°." },
      ],
    },
    {
      skills: "Triangles, circles and π, volume",
      cards: [
        { title: "Triangle area", body: "A triangle is half of a rectangle with the same base and height.", example: "Base 6, height 4: ½ × 6 × 4 = 12." },
        { title: "Circles and π", body: "Circumference is 2πr and area is πr². We usually leave π in the answer.", example: "r = 3: circumference 6π, area 9π." },
        { title: "Volume", body: "Volume is the space inside a solid. For a box, multiply length × width × height.", example: "2 × 3 × 4 = 24 cubic units." },
      ],
    },
    {
      skills: "Pythagoras, polygon angles, cylinders and spheres",
      cards: [
        { title: "Pythagoras", body: "In a right-angled triangle, a² + b² = c², where c is the longest side (the hypotenuse).", example: "Legs 3 and 4: 9 + 16 = 25, so the hypotenuse is 5. Try 5, 12, 13 as well." },
        { title: "Polygon angles", body: "The angles inside a polygon add up to (n − 2) × 180°, where n is the number of sides.", example: "A hexagon has 6 sides: 4 × 180° = 720°." },
        { title: "Round solids", body: "Cylinder volume is πr²h. Sphere volume is ⁴⁄₃πr³.", example: "Cylinder r = 2, h = 5: π × 4 × 5 = 20π." },
      ],
    },
  ],
  trig: [
    {
      skills: "SOH-CAH-TOA and special values",
      cards: [
        { title: "Name the sides", body: "The hypotenuse is opposite the right angle. The opposite is across from your angle θ. The adjacent is next to it.", example: "In a 3-4-5 triangle the hypotenuse is 5." },
        { title: "SOH-CAH-TOA", body: "sin = opposite ÷ hypotenuse. cos = adjacent ÷ hypotenuse. tan = opposite ÷ adjacent.", example: "Opposite 3, adjacent 4, hypotenuse 5: sin θ = 3/5, cos θ = 4/5, tan θ = 3/4." },
        { title: "Values to remember", body: "A few angles have neat answers. Learn them once and they save you time.", example: "sin 30° = 1/2, cos 60° = 1/2, sin 90° = 1, cos 0° = 1." },
      ],
    },
    {
      skills: "Finding sides, radians, exact values",
      cards: [
        { title: "Find a side", body: "Rearrange sin, cos or tan to get the side you want.", example: "Hypotenuse 10, angle 30°: opposite = 10 × sin 30° = 10 × 1/2 = 5." },
        { title: "Radians", body: "Half a turn is 180° and also π radians. Multiply degrees by π ÷ 180 to convert.", example: "90° = π/2, 60° = π/3, 45° = π/4." },
        { title: "The special-angle table", body: "sin of 30°, 45°, 60° is 1/2, √2/2, √3/2. For cos, read the list backwards.", example: "cos 30° = √3/2 and tan 45° = 1." },
      ],
    },
    {
      skills: "Unit circle, identities, law of sines",
      cards: [
        { title: "The unit circle", body: "For angles past 90°, find the reference angle (the gap to the x-axis), then fix the sign by quadrant: All, Sin, Tan, Cos.", example: "sin 150°: reference angle 30°, sine is positive in quadrant 2, so 1/2." },
        { title: "The big identity", body: "For every angle, sin²θ + cos²θ = 1.", example: "sin²30° + cos²30° = 1/4 + 3/4 = 1." },
        { title: "Law of sines", body: "In any triangle, a ÷ sin A = b ÷ sin B. Cross-multiply to find a missing side.", example: "A = 30°, a = 5, B = 90°: b = 5 × 1 ÷ 1/2 = 10." },
      ],
    },
  ],
};
