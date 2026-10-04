import type { PathId } from "./generators";

type Rule = [RegExp, string | ((m: RegExpMatchArray, level: number) => string)];

/** A nudge that never gives the answer away. First matching rule wins. */
const RULES: Record<PathId, Rule[]> = {
  add: [
    [/^\d+ \+ \d+ \+ \d+ = \?$/, "Add the first two numbers, then add the third."],
    [/^\? \+ \d+ = \d+$/, "Use the opposite: take the number you know away from the total."],
    [/^(\d+) − (\d+) = \?$/, (m, L) =>
      Number(m[1]) < Number(m[2])
        ? "The first number is smaller, so the answer is below zero. Work out the gap and add a minus sign."
        : L <= 10
          ? "Count back, or ask: what do I add to the small number to reach the big one?"
          : "Take away the tens first, then the ones. Borrow a ten if you need to."],
    [/^\d+ \+ \d+ = \?$/, (_m, L) =>
      L <= 10 ? "Start at the bigger number and count on. Making a ten first can help." : L <= 20 ? "Add the tens first, then the ones. Carry a ten if the ones pass 9." : "Add hundreds, then tens, then ones. Carry when a column passes 9."],
  ],
  mul: [
    [/^\d+ \+ \d+ × \d+ = \?$/, "Multiply first, then add (BODMAS)."],
    [/ r remainder|\(quotient r remainder\)/, "Find the biggest multiple of the divisor that fits. What is left over is the remainder."],
    [/^\d+ ÷ \d+ = \?$/, "Ask: what times the small number makes the big one?"],
    [/packs|boxes/, "Equal groups: boxes times the amount in each box."],
    [/^\d{3} × \d = \?$/, "Multiply the hundreds, tens and ones separately, then add."],
    [/^\d+ × \d+ = \?$/, (_m, L) =>
      L <= 10 ? "Think of equal groups, or skip count: 3, 6, 9…" : L <= 20 ? "Split the bigger number into tens and ones, multiply each part, then add." : "Break one number into 10 + the rest. Multiply each part and add."],
  ],
  frac: [
    [/^What is \d+\/\d+ of \d+\?$/, "Divide by the bottom number first, then multiply by the top."],
    [/^(\d+)\/(\d+) \+ (\d+)\/(\d+) = \?$/, (m) =>
      m[2] === m[4] ? "Same bottom number: just add the tops and keep the bottom." : "Make the bottoms the same first, then add the tops."],
    [/^\d+\/\d+ = \?\/\d+$/, "Multiply top and bottom by the same number."],
    [/^Which is bigger/, "The bigger the bottom number, the smaller each slice."],
    [/^Simplify/, "Find a number that divides both the top and the bottom."],
    [/\d+\/\d+ × \d+\/\d+/, "Multiply the tops together and the bottoms together, then simplify."],
    [/\d+\/\d+ ÷ \d+\/\d+/, "Keep the first fraction, flip the second, then multiply."],
    [/% of/, "Percent means out of a hundred. Finding 10% is the same as dividing by ten."],
    [/as a fraction/, "Say it as hundredths (0.75 is 75 hundredths), then simplify."],
    [/^\d+(\.\d+)? \+ \d+(\.\d+)? = \?$/, "Line up the decimal points, then add."],
    [/^\d+(\.\d+)? × \d+ = \?$/, "Ignore the decimal point, multiply, then put the point back."],
  ],
  alg: [
    [/^x \+ \d+ =/, "Do the opposite to both sides: subtract."],
    [/^x − \d+ =/, "Do the opposite to both sides: add."],
    [/^x ÷ \d+ =/, "Do the opposite to both sides: multiply."],
    [/^\d+x = \d+$/, "Do the opposite to both sides: divide by the number in front of x."],
    [/^\d+x [+−] \d+ = \d+x \+ \d+$/, "Get all the x terms on one side first, then solve."],
    [/^\d+x [+−] \d+ = \d+$/, "Undo the plus or minus first, then divide by the number in front of x."],
    [/^If x = /, "Swap x for the number. Multiply before you add."],
    [/^Expand \d+\(/, "Multiply everything inside the bracket by the number outside."],
    [/^Expand \(x/, "Multiply each part of the first bracket by each part of the second, then collect."],
    [/x \+ y = .* x − y = /, "Add the two equations so that y cancels out."],
    [/^x² .*= 0/, "Find two numbers that multiply to the last number and add to the middle number."],
    [/^x² = /, "Which number multiplied by itself gives this?"],
  ],
  geo: [
    [/perimeter/, "Perimeter is the distance all the way round. Add every side."],
    [/rectangle .* area|square .* area/, "Area = length × width."],
    [/Two angles of a triangle/, "Angles in a triangle add up to 180°."],
    [/straight line/, "Angles on a straight line add up to 180°."],
    [/^Triangle: base/, "Area of a triangle = ½ × base × height."],
    [/Circle .* Area/, "Area = π × r × r. Keep π in your answer."],
    [/Circumference/, "Circumference = 2 × π × r. Keep π in your answer."],
    [/^A box is/, "Volume = length × width × height."],
    [/^Parallelogram/, "Area = base × height, like a rectangle."],
    [/Hypotenuse\?/, "a² + b² = c². Add the squares, then take the square root."],
    [/Other leg\?/, "c² − a² = b². Subtract the squares, then take the square root."],
    [/interior angles/, "Sum of angles = (number of sides − 2) × 180°."],
    [/^Cylinder/, "Volume = area of the circle (π × r × r) times the height."],
    [/^Sphere/, "Volume = (4/3) × π × r × r × r."],
  ],
  trig: [
    [/^Right triangle: opposite/, "SOH-CAH-TOA: sin = opp ÷ hyp, cos = adj ÷ hyp, tan = opp ÷ adj."],
    [/^Which ratio/, "Think SOH-CAH-TOA."],
    [/^Hypotenuse \d+, angle 30°/, "opposite = hypotenuse × sin 30°, and sin 30° is a half."],
    [/^Hypotenuse \d+, angle 60°/, "adjacent = hypotenuse × cos 60°, and cos 60° is a half."],
    [/° in radians/, "Multiply degrees by π ÷ 180."],
    [/radians in degrees/, "A straight line is π radians. What fraction of a straight line is this angle?"],
    [/^sin θ = /, "Which special angle has this sine value?"],
    [/^sin²θ/, "This is the Pythagorean identity."],
    [/^Law of sines/, "a ÷ sin A = b ÷ sin B. Rearrange for b."],
    [/^(sin|cos|tan) \d+° = \?$/, (_m, L) =>
      L >= 21 ? "Find the reference angle (distance to the x-axis), then check the sign for that quadrant." : "Use the special-angle table for 0°, 30°, 45°, 60° and 90°."],
  ],
};

const FALLBACK: Record<PathId, string> = {
  add: "Take it in small steps: tens first, then ones.",
  mul: "Break the numbers into easier pieces.",
  frac: "Look at the bottom numbers first.",
  alg: "Do the same thing to both sides to get x alone.",
  geo: "Sketch the shape and write down the formula first.",
  trig: "Label opposite, adjacent and hypotenuse, then pick sin, cos or tan.",
};

export function hintFor(path: PathId, level: number, prompt: string): string {
  for (const [re, h] of RULES[path]) {
    const m = prompt.match(re);
    if (m) return typeof h === "function" ? h(m, level) : h;
  }
  return FALLBACK[path];
}
