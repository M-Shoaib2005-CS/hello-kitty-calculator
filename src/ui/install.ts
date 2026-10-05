type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();

export function watchInstall(): void {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

export function canInstall(): boolean {
  return deferred !== null;
}

export function onInstallChange(fn: () => void): void {
  listeners.add(fn);
}

export async function promptInstall(): Promise<void> {
  if (!deferred) return;
  const d = deferred;
  deferred = null;
  await d.prompt();
  await d.userChoice.catch(() => undefined);
  listeners.forEach((l) => l());
}
