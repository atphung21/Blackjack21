let ctx = null;
let enabled = true;

function getContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function tone({ frequency = 440, duration = 0.08, type = "sine", volume = 0.12, ramp = true }) {
  if (!enabled) return;
  try {
    const audio = getContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    if (ramp) {
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    }
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + duration);
  } catch {
    /* Audio optional */
  }
}

export function setSoundEnabled(value) {
  enabled = value;
  try {
    localStorage.setItem("atp-blackjack-sound", value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function loadSoundPreference() {
  try {
    enabled = localStorage.getItem("atp-blackjack-sound") !== "0";
  } catch {
    enabled = true;
  }
  return enabled;
}

export function isSoundEnabled() {
  return enabled;
}

export const sounds = {
  chip: () => tone({ frequency: 880, duration: 0.05, type: "triangle", volume: 0.08 }),
  deal: () => {
    tone({ frequency: 320, duration: 0.06, volume: 0.1 });
    setTimeout(() => tone({ frequency: 420, duration: 0.06, volume: 0.08 }), 50);
  },
  card: () => tone({ frequency: 520, duration: 0.05, type: "triangle", volume: 0.07 }),
  stand: () => tone({ frequency: 280, duration: 0.1, type: "square", volume: 0.06 }),
  win: () => {
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => tone({ frequency: f, duration: 0.12, volume: 0.1 }), i * 90);
    });
  },
  lose: () => tone({ frequency: 180, duration: 0.25, type: "sawtooth", volume: 0.08 }),
  blackjack: () => {
    [392, 494, 587, 784].forEach((f, i) => {
      setTimeout(() => tone({ frequency: f, duration: 0.14, volume: 0.11 }), i * 80);
    });
  },
  bust: () => tone({ frequency: 120, duration: 0.2, type: "sawtooth", volume: 0.09 }),
  insurance: () => tone({ frequency: 660, duration: 0.08, type: "triangle", volume: 0.09 }),
  button: () => tone({ frequency: 400, duration: 0.04, volume: 0.05 }),
};
