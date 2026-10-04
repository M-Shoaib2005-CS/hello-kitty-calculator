let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx || new AC();
    return ctx;
  } catch {
    return null;
  }
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

function tone(f: number, t: number, d: number, type: OscillatorType = "triangle", v = 0.15): void {
  const ac = audio();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = f;
  o.connect(g);
  g.connect(ac.destination);
  const s = ac.currentTime + t;
  g.gain.setValueAtTime(v, s);
  g.gain.exponentialRampToValueAtTime(0.001, s + d);
  o.start(s);
  o.stop(s + d);
}

export function sfx(kind: "ok" | "win" | "bad" | "tap"): void {
  if (kind === "tap") {
    tone(640, 0, 0.06, "triangle", 0.05);
    return;
  }
  const seq =
    kind === "ok"
      ? [523, 659, 784, 1047]
      : kind === "win"
        ? [523, 659, 784, 1047, 784, 1047, 1319]
        : [300, 220];
  seq.forEach((f, i) => tone(f, i * 0.11, 0.25, kind === "bad" ? "sine" : "triangle"));
}

/** Call from a user gesture so iOS/Android allow later tones. */
export function unlockAudio(): void {
  const ac = audio();
  if (ac && ac.state === "suspended") void ac.resume();
}
