import type { IconName } from "../ui/icons";

export type Category = "arithmetic" | "fractions" | "algebra" | "geometry" | "trig" | "speed" | "stats";

export type Formula = {
  id: string;
  cat: Category;
  title: string;
  formula: string;
  note: string;
  example: string;
};

export const CATEGORIES: { id: Category; label: string; icon: IconName }[] = [
  { id: "arithmetic", label: "Arithmetic", icon: "plus" },
  { id: "fractions", label: "Fractions", icon: "pizza" },
  { id: "algebra", label: "Algebra", icon: "variable" },
  { id: "geometry", label: "Geometry", icon: "triangle-right" },
  { id: "trig", label: "Trig", icon: "audio-waveform" },
  { id: "speed", label: "Speed & time", icon: "gauge" },
  { id: "stats", label: "Statistics", icon: "chart-column" },
];

export const FORMULAS: Formula[] = [
  /* arithmetic */
  { id: "ar-order", cat: "arithmetic", title: "Order of operations", formula: "Brackets → Powers → × ÷ → + −", note: "Work left to right within each level (BODMAS / PEMDAS).", example: "2 + 3 × 4 = 2 + 12 = 14" },
  { id: "ar-percent", cat: "arithmetic", title: "Percent of a number", formula: "p% of n = p ÷ 100 × n", note: "Turn the percent into a fraction out of 100 first.", example: "25% of 80 = 0.25 × 80 = 20" },
  { id: "ar-pchange", cat: "arithmetic", title: "Percent change", formula: "change % = (new − old) ÷ old × 100", note: "Positive = increase, negative = decrease.", example: "50 → 60 : 10 ÷ 50 × 100 = 20% up" },
  { id: "ar-avg", cat: "arithmetic", title: "Average (mean)", formula: "mean = sum of values ÷ number of values", note: "Add everything up, divide by how many.", example: "2, 4, 9 → 15 ÷ 3 = 5" },
  { id: "ar-ratio", cat: "arithmetic", title: "Sharing in a ratio", formula: "part = total ÷ (sum of ratio) × share", note: "Find one 'part' first, then multiply.", example: "20 in ratio 1:3 → 20 ÷ 4 = 5 → 5 and 15" },
  { id: "ar-div", cat: "arithmetic", title: "Division with remainder", formula: "dividend = divisor × quotient + remainder", note: "Remainder is always smaller than the divisor.", example: "17 = 5 × 3 + 2" },
  { id: "ar-simple-int", cat: "arithmetic", title: "Simple interest", formula: "I = P × r × t", note: "P = money, r = rate per year (as a decimal), t = years.", example: "100 at 5% for 2 years → 100 × 0.05 × 2 = 10" },
  { id: "ar-sqrt", cat: "arithmetic", title: "Squares and roots", formula: "n² = n × n   and   √(n²) = n", note: "Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.", example: "√49 = 7" },
  { id: "ar-prime", cat: "arithmetic", title: "Divisibility tests", formula: "2: ends even · 3: digits sum ÷ 3 · 5: ends 0/5 · 9: digits sum ÷ 9", note: "Quick checks without dividing.", example: "126 → 1+2+6 = 9, so ÷ 3 and ÷ 9" },

  /* fractions */
  { id: "fr-add", cat: "fractions", title: "Add fractions", formula: "a/b + c/d = (ad + bc) / bd", note: "Or find a common denominator first.", example: "1/2 + 1/3 = (3 + 2)/6 = 5/6" },
  { id: "fr-mul", cat: "fractions", title: "Multiply fractions", formula: "a/b × c/d = ac / bd", note: "Tops with tops, bottoms with bottoms.", example: "2/3 × 3/4 = 6/12 = 1/2" },
  { id: "fr-div", cat: "fractions", title: "Divide fractions", formula: "a/b ÷ c/d = a/b × d/c", note: "Keep, change, flip.", example: "1/2 ÷ 1/4 = 1/2 × 4 = 2" },
  { id: "fr-simplify", cat: "fractions", title: "Simplify", formula: "divide top and bottom by their GCD", note: "Stop when no number divides both.", example: "12/18 ÷ 6 = 2/3" },
  { id: "fr-mixed", cat: "fractions", title: "Mixed to improper", formula: "w n/d = (w × d + n) / d", note: "Multiply the whole by the bottom, then add the top.", example: "2 1/3 = (6 + 1)/3 = 7/3" },
  { id: "fr-dec", cat: "fractions", title: "Fraction to decimal and percent", formula: "a/b = a ÷ b   → × 100 for %", note: "Divide top by bottom.", example: "3/4 = 0.75 = 75%" },
  { id: "fr-of", cat: "fractions", title: "Fraction of a quantity", formula: "a/b of n = n ÷ b × a", note: "Split into b equal parts, take a of them.", example: "3/4 of 20 = 5 × 3 = 15" },

  /* algebra */
  { id: "al-linear", cat: "algebra", title: "Solve ax + b = c", formula: "x = (c − b) ÷ a", note: "Undo the plus/minus, then undo the times.", example: "2x + 3 = 11 → x = 4" },
  { id: "al-quad", cat: "algebra", title: "Quadratic formula", formula: "x = (−b ± √(b² − 4ac)) ÷ 2a", note: "For ax² + bx + c = 0.", example: "x² − 5x + 6 = 0 → x = 2 or 3" },
  { id: "al-disc", cat: "algebra", title: "Discriminant", formula: "Δ = b² − 4ac", note: "Δ > 0: two roots · Δ = 0: one root · Δ < 0: none (real).", example: "x² + 2x + 5 → 4 − 20 < 0" },
  { id: "al-diffsq", cat: "algebra", title: "Difference of squares", formula: "a² − b² = (a − b)(a + b)", note: "Great for factorising.", example: "x² − 9 = (x − 3)(x + 3)" },
  { id: "al-sqplus", cat: "algebra", title: "Square of a sum", formula: "(a + b)² = a² + 2ab + b²", note: "Don't forget the middle term!", example: "(x + 3)² = x² + 6x + 9" },
  { id: "al-sqminus", cat: "algebra", title: "Square of a difference", formula: "(a − b)² = a² − 2ab + b²", note: "Same pattern, middle term is negative.", example: "(x − 2)² = x² − 4x + 4" },
  { id: "al-foil", cat: "algebra", title: "Expand two brackets", formula: "(x + p)(x + q) = x² + (p + q)x + pq", note: "First, Outer, Inner, Last.", example: "(x + 2)(x + 3) = x² + 5x + 6" },
  { id: "al-slope", cat: "algebra", title: "Slope of a line", formula: "m = (y₂ − y₁) ÷ (x₂ − x₁)", note: "Rise over run.", example: "(1,2) to (3,6): 4 ÷ 2 = 2" },
  { id: "al-line", cat: "algebra", title: "Line equation", formula: "y = mx + c", note: "m = slope, c = where it crosses the y-axis.", example: "y = 2x + 1 passes (0, 1)" },
  { id: "al-index", cat: "algebra", title: "Index laws", formula: "aᵐ × aⁿ = aᵐ⁺ⁿ   ·   aᵐ ÷ aⁿ = aᵐ⁻ⁿ   ·   (aᵐ)ⁿ = aᵐⁿ", note: "Same base only.", example: "2³ × 2⁴ = 2⁷ = 128" },
  { id: "al-seq", cat: "algebra", title: "Arithmetic sequence", formula: "aₙ = a₁ + (n − 1)d", note: "d = common difference.", example: "3, 7, 11… → a₅ = 3 + 4×4 = 19" },
  { id: "al-sum", cat: "algebra", title: "Sum 1 to n", formula: "1 + 2 + … + n = n(n + 1) ÷ 2", note: "Gauss's trick.", example: "1 + … + 100 = 5050" },

  /* geometry */
  { id: "ge-rect-a", cat: "geometry", title: "Rectangle area", formula: "A = l × w", note: "Length times width.", example: "5 × 3 = 15" },
  { id: "ge-rect-p", cat: "geometry", title: "Rectangle perimeter", formula: "P = 2(l + w)", note: "Add all four sides.", example: "2(5 + 3) = 16" },
  { id: "ge-tri", cat: "geometry", title: "Triangle area", formula: "A = ½ × b × h", note: "Height is the straight-up distance, not a slanted side.", example: "½ × 6 × 4 = 12" },
  { id: "ge-para", cat: "geometry", title: "Parallelogram area", formula: "A = b × h", note: "Perpendicular height.", example: "8 × 3 = 24" },
  { id: "ge-trap", cat: "geometry", title: "Trapezium area", formula: "A = ½(a + b) × h", note: "a and b are the parallel sides.", example: "½(4 + 6) × 3 = 15" },
  { id: "ge-circ-a", cat: "geometry", title: "Circle area", formula: "A = πr²", note: "r = radius.", example: "r = 3 → 9π ≈ 28.27" },
  { id: "ge-circ-c", cat: "geometry", title: "Circumference", formula: "C = 2πr = πd", note: "Distance around the circle.", example: "r = 5 → 10π ≈ 31.4" },
  { id: "ge-pyth", cat: "geometry", title: "Pythagoras", formula: "a² + b² = c²", note: "Right triangles only; c is the hypotenuse.", example: "3² + 4² = 5²" },
  { id: "ge-tri-ang", cat: "geometry", title: "Angles in a triangle", formula: "A + B + C = 180°", note: "Straight line = 180°, full turn = 360°.", example: "60° + 70° → third = 50°" },
  { id: "ge-poly", cat: "geometry", title: "Interior angles of a polygon", formula: "sum = (n − 2) × 180°", note: "n = number of sides.", example: "hexagon: 4 × 180° = 720°" },
  { id: "ge-cuboid", cat: "geometry", title: "Cuboid volume", formula: "V = l × w × h", note: "Surface area = 2(lw + lh + wh).", example: "2 × 3 × 4 = 24" },
  { id: "ge-cyl", cat: "geometry", title: "Cylinder volume", formula: "V = πr²h", note: "Area of the circle times height.", example: "r = 2, h = 5 → 20π" },
  { id: "ge-cone", cat: "geometry", title: "Cone volume", formula: "V = ⅓πr²h", note: "A third of the matching cylinder.", example: "r = 3, h = 4 → 12π" },
  { id: "ge-sphere", cat: "geometry", title: "Sphere", formula: "V = ⁴⁄₃πr³   ·   S = 4πr²", note: "Volume and surface area.", example: "r = 3 → V = 36π" },
  { id: "ge-dist", cat: "geometry", title: "Distance between points", formula: "d = √((x₂ − x₁)² + (y₂ − y₁)²)", note: "Pythagoras on a grid.", example: "(0,0) to (3,4) → 5" },
  { id: "ge-arc", cat: "geometry", title: "Arc and sector", formula: "arc = θ/360 × 2πr   ·   sector = θ/360 × πr²", note: "θ in degrees.", example: "θ = 90°, r = 4 → arc 2π" },

  /* trig */
  { id: "tr-sohcahtoa", cat: "trig", title: "SOH CAH TOA", formula: "sin θ = opp/hyp · cos θ = adj/hyp · tan θ = opp/adj", note: "For right-angled triangles.", example: "3-4-5: sin θ = 3/5" },
  { id: "tr-special", cat: "trig", title: "Special angles", formula: "sin 30° = ½ · sin 45° = √2/2 · sin 60° = √3/2", note: "cos is the same list in reverse order.", example: "cos 60° = ½" },
  { id: "tr-tan", cat: "trig", title: "Tangent as a ratio", formula: "tan θ = sin θ ÷ cos θ", note: "tan 45° = 1, tan 90° is undefined.", example: "tan 60° = (√3/2) ÷ (1/2) = √3" },
  { id: "tr-pyth", cat: "trig", title: "Pythagorean identity", formula: "sin²θ + cos²θ = 1", note: "True for every angle.", example: "sin²30° + cos²30° = ¼ + ¾ = 1" },
  { id: "tr-rad", cat: "trig", title: "Degrees ↔ radians", formula: "rad = deg × π/180   ·   deg = rad × 180/π", note: "180° = π radians.", example: "90° = π/2" },
  { id: "tr-sine", cat: "trig", title: "Law of sines", formula: "a/sin A = b/sin B = c/sin C", note: "Any triangle.", example: "A = 30°, a = 5, B = 90° → b = 10" },
  { id: "tr-cosine", cat: "trig", title: "Law of cosines", formula: "c² = a² + b² − 2ab cos C", note: "Pythagoras plus a correction term.", example: "C = 90° → c² = a² + b²" },
  { id: "tr-area", cat: "trig", title: "Triangle area with sine", formula: "A = ½ab sin C", note: "Two sides and the angle between them.", example: "a = 4, b = 5, C = 30° → 5" },
  { id: "tr-quad", cat: "trig", title: "Unit circle signs", formula: "Q1 all + · Q2 sin + · Q3 tan + · Q4 cos +", note: "'All Students Take Calculus'.", example: "sin 150° = +½ ; cos 150° = −√3/2" },
  { id: "tr-co", cat: "trig", title: "Complementary angles", formula: "sin θ = cos(90° − θ)", note: "Why the special-angle tables mirror.", example: "sin 30° = cos 60°" },

  /* speed */
  { id: "sp-speed", cat: "speed", title: "Speed, distance, time", formula: "speed = distance ÷ time", note: "Rearrange: distance = speed × time, time = distance ÷ speed.", example: "150 km in 3 h → 50 km/h" },
  { id: "sp-dist", cat: "speed", title: "Distance", formula: "d = v × t", note: "Keep the units matching (km/h with hours).", example: "60 km/h for 2.5 h → 150 km" },
  { id: "sp-avg", cat: "speed", title: "Average speed", formula: "total distance ÷ total time", note: "Not the average of the speeds!", example: "60 km in 1 h + 60 km in 2 h → 120 ÷ 3 = 40 km/h" },
  { id: "sp-convert", cat: "speed", title: "km/h ↔ m/s", formula: "m/s = km/h ÷ 3.6", note: "Multiply by 3.6 to go back.", example: "72 km/h = 20 m/s" },
  { id: "sp-accel", cat: "speed", title: "Acceleration", formula: "a = (v − u) ÷ t", note: "u = start speed, v = end speed.", example: "0 → 20 m/s in 5 s → 4 m/s²" },
  { id: "sp-rel", cat: "speed", title: "Meeting speed", formula: "approaching: v₁ + v₂   ·   same way: v₁ − v₂", note: "Closing speed of two movers.", example: "40 and 60 km/h towards each other → 100 km/h" },
  { id: "sp-density", cat: "speed", title: "Density", formula: "density = mass ÷ volume", note: "Same pattern as speed = distance ÷ time.", example: "200 g in 50 cm³ → 4 g/cm³" },

  /* stats */
  { id: "st-mean", cat: "stats", title: "Mean", formula: "x̄ = Σx ÷ n", note: "Add them all, divide by how many.", example: "3, 5, 10 → 6" },
  { id: "st-median", cat: "stats", title: "Median", formula: "middle value of the sorted list", note: "Even count: average the two middle values.", example: "2, 4, 7, 9 → (4 + 7) ÷ 2 = 5.5" },
  { id: "st-mode", cat: "stats", title: "Mode and range", formula: "mode = most common · range = max − min", note: "A set can have two modes or none.", example: "2, 3, 3, 8 → mode 3, range 6" },
  { id: "st-var", cat: "stats", title: "Variance and standard deviation", formula: "σ² = Σ(x − x̄)² ÷ n   ·   σ = √σ²", note: "How spread out the data is.", example: "2, 4, 6 → x̄ = 4, σ² = 8/3" },
  { id: "st-prob", cat: "stats", title: "Probability", formula: "P = favourable outcomes ÷ total outcomes", note: "Always between 0 and 1.", example: "rolling a 5 on a die → 1/6" },
  { id: "st-and", cat: "stats", title: "Independent events", formula: "P(A and B) = P(A) × P(B)", note: "P(A or B) = P(A) + P(B) − P(A and B).", example: "two heads: ½ × ½ = ¼" },
  { id: "st-perm", cat: "stats", title: "Permutations and combinations", formula: "nPr = n! ÷ (n − r)!   ·   nCr = n! ÷ (r!(n − r)!)", note: "Order matters for P, not for C.", example: "5C2 = 10" },
  { id: "st-fact", cat: "stats", title: "Factorial", formula: "n! = n × (n − 1) × … × 1", note: "0! = 1.", example: "5! = 120" },
];

export function searchFormulas(query: string, cat: Category | "all" | "fav", favourites: string[]): Formula[] {
  const q = query.trim().toLowerCase();
  return FORMULAS.filter((f) => {
    if (cat === "fav" && !favourites.includes(f.id)) return false;
    if (cat !== "all" && cat !== "fav" && f.cat !== cat) return false;
    if (!q) return true;
    return `${f.title} ${f.formula} ${f.note} ${f.example} ${f.cat}`.toLowerCase().includes(q);
  });
}
