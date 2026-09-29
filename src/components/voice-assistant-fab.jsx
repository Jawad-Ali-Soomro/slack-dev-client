import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { Loader2, Mic, MicOff, Volume2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth-context";
import { askAssistant } from "../services/assistant-service";
import { PeopleRail } from "./voice-assistant-people";

const BAR_COUNT = 40;
const SILENCE_MS = 1800;

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const speak = (text) =>
  new Promise((resolve) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices.find((v) => v.name.includes("Google US English Male")) || voices[0];
    utterance.rate = 1.08;
    utterance.pitch = 1;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearInterval(keepAlive);
      window.clearTimeout(watchdog);
      window.speechSynthesis.cancel();
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    const keepAlive = window.setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 200);
    const watchdog = window.setTimeout(
      finish,
      Math.min(18000, 1000 + text.length * 55),
    );

    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.resume();
  });

const STATUS = {
  idle: { label: "Ready", hint: "Tap the mic and speak" },
  listening: { label: "Listening", hint: "Speak fully — I'll wait for a pause" },
  thinking: { label: "Thinking", hint: "Working on that" },
  speaking: { label: "Speaking", hint: "Here's what I found" },
};

const VoiceLoop = ({ mode, energy }) => {
  const canvasRef = useRef(null);
  const energyRef = useRef(energy);
  const modeRef = useRef(mode);
  energyRef.current = energy;
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    let frame = 0;
    let width = 0;
    let height = 0;

    const ribbons = [
      { a: 0.92, b: 0.34, pitch: 1.12, yaw: 0.42, speed: 0.00115, hue: 24 },
      { a: 0.88, b: 0.3, pitch: 0.98, yaw: -0.72, speed: -0.00092, hue: 18 },
      { a: 0.9, b: 0.28, pitch: 1.18, yaw: 1.18, speed: 0.00138, hue: 32 },
    ];

    const sparks = Array.from({ length: 56 }, (_, index) => ({
      ribbon: index % ribbons.length,
      u: Math.random() * Math.PI * 2,
      size: 0.6 + Math.random() * 1.8,
      drift: 0.7 + Math.random() * 1.4,
    }));

    const project = (ribbon, u, time) => {
      const spin = time * ribbon.speed;
      const x = ribbon.a * Math.cos(u);
      const y = ribbon.b * Math.sin(u);
      const cy = Math.cos(ribbon.pitch);
      const sy = Math.sin(ribbon.pitch);
      const y1 = y * cy;
      const z1 = y * sy;
      const yaw = ribbon.yaw + spin * 0.18;
      const cz = Math.cos(yaw);
      const sz = Math.sin(yaw);
      const x2 = x * cz - z1 * sz;
      const z2 = x * sz + z1 * cz;
      const cz2 = Math.cos(spin);
      const sz2 = Math.sin(spin);
      return {
        x: x2 * cz2 - y1 * sz2,
        y: x2 * sz2 + y1 * cz2,
        z: z2,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      const modeNow = modeRef.current;
      const live = modeNow === "listening" || modeNow === "speaking";
      const thinking = modeNow === "thinking";
      const pulse = live
        ? 0.55 + Math.min(energyRef.current, 1) * 0.7
        : thinking
          ? 0.38
          : 0.16;

      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.4;

      const bloom = ctx.createRadialGradient(cx, cy, 8, cx, cy, scale * 1.85);
      bloom.addColorStop(0, `rgba(255, 145, 75, ${0.22 * pulse})`);
      bloom.addColorStop(0.45, `rgba(255, 176, 120, ${0.1 * pulse})`);
      bloom.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      ribbons.forEach((ribbon) => {
        const steps = 160;
        ctx.beginPath();
        for (let i = 0; i <= steps; i += 1) {
          const u = (i / steps) * Math.PI * 2;
          const point = project(ribbon, u, time);
          const px = cx + point.x * scale;
          const py = cy + point.y * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `hsla(${ribbon.hue}, 100%, 58%, ${0.28 + pulse * 0.42})`;
        ctx.lineWidth = 2.4 + pulse * 4.2;
        ctx.shadowColor = `hsla(${ribbon.hue}, 100%, 60%, 0.9)`;
        ctx.shadowBlur = 16 + pulse * 26;
        ctx.stroke();
        ctx.lineWidth = 1.1;
        ctx.shadowBlur = 7;
        ctx.strokeStyle = `hsla(${ribbon.hue}, 100%, 72%, ${0.55 + pulse * 0.35})`;
        ctx.stroke();
      });

      sparks.forEach((spark) => {
        const ribbon = ribbons[spark.ribbon];
        spark.u += ribbon.speed * 16 * spark.drift * (live ? 1.6 : 0.7);
        const point = project(ribbon, spark.u, time);
        const px = cx + point.x * scale;
        const py = cy + point.y * scale;
        ctx.beginPath();
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#FF914B";
        ctx.fillStyle = `rgba(255, 224, 196, ${0.35 + pulse * 0.55})`;
        ctx.arc(px, py, spark.size * (0.55 + pulse * 0.7), 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const live = mode === "listening" || mode === "speaking";
  const thinking = mode === "thinking";

  return (
    <span
      className={`voice-halo ${live ? "is-live" : ""} ${thinking ? "is-thinking" : ""}`}
    >
      <canvas ref={canvasRef} className="voice-halo-canvas" />
    </span>
  );
};

function voiceCaption(status, heard, reply) {
  const captionLabel =
    status === "listening" || (heard && !reply)
      ? "You"
      : status === "thinking" || status === "speaking" || reply
        ? "Assistant"
        : "Assistant";

  const captionText =
    status === "listening"
      ? heard || "Speak a command…"
      : status === "thinking"
        ? "Working on it…"
        : reply || "Tap the mic and ask about your team.";

  return { captionLabel, captionText };
}

function VoiceStatusIcon({ status }) {
  if (status === "listening") return <Mic className="h-3.5 w-3.5" />;
  if (status === "speaking") return <Volume2 className="h-3.5 w-3.5" />;
  if (status === "thinking") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  return <MicOff className="h-3.5 w-3.5" />;
}

function VoiceHud({
  open,
  onClose,
  status,
  energy,
  meta,
  captionLabel,
  captionText,
  onOrbClick,
  people,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <m.div
          key="voice-hud"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2147483000] flex flex-col overflow-y-auto bg-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,145,75,0.16),transparent_42%),radial-gradient(circle_at_80%_90%,rgba(255,184,140,0.2),transparent_36%)]" />

          <div className="relative flex items-center justify-between px-5 py-4 md:px-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#FF914B]">
                Slack Dev
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-900 uppercase">
                V o i c e &nbsp; A s s i s t a n t
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-100 bg-white text-[#FF914B] shadow-sm transition hover:bg-orange-50"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center px-6">
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF914B]">
              <VoiceStatusIcon status={status} />
              {meta.label}
            </span>

            <button
              type="button"
              onClick={onOrbClick}
              className="relative flex items-center justify-center rounded-full"
              aria-label="Toggle listening"
            >
              <VoiceLoop mode={status} energy={energy} />
            </button>

            <p className="mt-6 text-sm font-medium text-gray-400">{meta.hint}</p>
            <PeopleRail people={people} />
          </div>

          <div className="relative px-5 pb-8 md:px-8">
            <div className="mx-auto max-w-2xl flex items-center justify-center flex-col rounded-[28px] text-center">
              <p className="text-[10px] font-bold uppercase mb-5 px-5 py-3 bg-orange-50 rounded-full tracking-[0.28em] text-[#FF914B]">
                {captionLabel}
              </p>
              <p className="mt-2 min-h-[48px] text-lg font-medium leading-7 text-gray-900 md:text-xl">
                {captionText}
              </p>
            </div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

const VoiceAssistantFab = () => {
  const { user, isAuthenticated } = useAuth();
  const isTeamAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [people, setPeople] = useState([]);
  const [levels, setLevels] = useState(() => Array(BAR_COUNT).fill(0.08));
  const recognitionRef = useRef(null);
  const busyRef = useRef(false);
  const openRef = useRef(false);
  const startListeningRef = useRef(() => {});
  const analyserRef = useRef(null);
  const audioRef = useRef({ stream: null, ctx: null, raf: 0 });
  const statusRef = useRef("idle");
  const restartTimerRef = useRef(0);
  const speakAnimRef = useRef(0);
  const silenceTimerRef = useRef(0);
  const transcriptRef = useRef("");
  const draftRef = useRef("");
  const sendPromptRef = useRef(async () => {});

  const setMode = (mode) => {
    statusRef.current = mode;
    setStatus(mode);
  };

  const stopMic = useCallback(() => {
    if (audioRef.current.raf) cancelAnimationFrame(audioRef.current.raf);
    audioRef.current.raf = 0;
    analyserRef.current = null;
    audioRef.current.stream?.getTracks().forEach((track) => track.stop());
    audioRef.current.stream = null;
    if (audioRef.current.ctx) {
      audioRef.current.ctx.close().catch(() => {});
      audioRef.current.ctx = null;
    }
  }, []);

  const startMic = useCallback(async () => {
    stopMic();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      audioRef.current = { stream, ctx, raf: 0 };
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        setLevels(
          Array.from({ length: BAR_COUNT }, (_, index) => {
            const sample =
              data[Math.floor((index / BAR_COUNT) * data.length)] || 0;
            return Math.min(1, sample / 180);
          }),
        );
        audioRef.current.raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      toast.error("Microphone access is required for the assistant.");
    }
  }, [stopMic]);

  const stopListening = useCallback(() => {
    window.clearTimeout(restartTimerRef.current);
    window.clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = 0;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }
    stopMic();
  }, [stopMic]);

  const closeOverlay = useCallback(() => {
    openRef.current = false;
    busyRef.current = false;
    stopListening();
    window.speechSynthesis?.cancel();
    if (speakAnimRef.current) window.clearInterval(speakAnimRef.current);
    setOpen(false);
    setMode("idle");
    setHeard("");
    setReply("");
    setPeople([]);
    transcriptRef.current = "";
    draftRef.current = "";
    setLevels(Array(BAR_COUNT).fill(0.08));
  }, [stopListening]);

  const sendPrompt = useCallback(
    async (prompt) => {
      const text = (prompt || "").trim();
      if (!text || busyRef.current) return;

      busyRef.current = true;
      window.clearTimeout(silenceTimerRef.current);
      transcriptRef.current = "";
      draftRef.current = "";
      stopListening();
      setHeard(text);
      setReply("");
      setPeople([]);
      setMode("thinking");

      try {
        const data = await askAssistant(text);
        if (!openRef.current) return;
        const spoken = data.reply || "Done.";
        setReply(spoken);
        setPeople(data.people || []);
        setMode("speaking");
        await speak(spoken);
      } catch (error) {
        if (!openRef.current) return;
        const message =
          error.name === "AbortError"
            ? "The assistant timed out."
            : error.message || "I could not complete that.";
        setReply(message);
        setMode("speaking");
        await speak(message);
      } finally {
        busyRef.current = false;
        if (openRef.current) startListeningRef.current();
      }
    },
    [stopListening],
  );

  sendPromptRef.current = sendPrompt;

  const startListening = useCallback((keepSpeech = false) => {
    if (!SpeechRecognition) {
      const message = "Voice commands are not supported in this browser.";
      toast.error(message);
      speak(message);
      return;
    }
    if (busyRef.current || !openRef.current) return;

    window.speechSynthesis?.cancel();
    window.clearTimeout(restartTimerRef.current);
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }
    if (!keepSpeech) {
      window.clearTimeout(silenceTimerRef.current);
      transcriptRef.current = "";
      draftRef.current = "";
    }
    startMic();
    setMode("listening");

    const begin = () => {
      if (busyRef.current || !openRef.current) return;

      const nextRecognition = new SpeechRecognition();
      nextRecognition.lang = "en-US";
      nextRecognition.interimResults = true;
      nextRecognition.continuous = true;
      nextRecognition.maxAlternatives = 1;

      nextRecognition.onstart = () => setMode("listening");
      nextRecognition.onerror = (event) => {
        if (event.error === "aborted" || event.error === "no-speech") return;
        if (event.error === "not-allowed") {
          toast.error("Microphone access is required for the assistant.");
          setMode("idle");
        }
      };
      nextRecognition.onend = () => {
        recognitionRef.current = null;
        if (!openRef.current || busyRef.current) return;
        if (statusRef.current !== "listening") return;
        restartTimerRef.current = window.setTimeout(() => {
          startListeningRef.current(true);
        }, 180);
      };
      nextRecognition.onresult = (event) => {
        let finalText = "";
        let live = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += chunk;
          else live += chunk;
        }
        if (finalText.trim()) {
          transcriptRef.current = `${transcriptRef.current} ${finalText}`.trim();
        }
        const next = `${transcriptRef.current} ${live}`.trim();
        draftRef.current = next;
        if (next) setHeard(next);

        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = window.setTimeout(() => {
          const ready = (draftRef.current || transcriptRef.current).trim();
          if (!ready || busyRef.current || !openRef.current) return;
          sendPromptRef.current(ready);
        }, SILENCE_MS);
      };

      recognitionRef.current = nextRecognition;
      try {
        nextRecognition.start();
      } catch {
        restartTimerRef.current = window.setTimeout(() => {
          startListeningRef.current(true);
        }, 280);
      }
    };

    restartTimerRef.current = window.setTimeout(begin, 60);
  }, [startMic]);

  startListeningRef.current = startListening;

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    startListeningRef.current();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeOverlay]);

  useEffect(() => {
    if (status !== "speaking" && status !== "thinking") {
      if (speakAnimRef.current) window.clearInterval(speakAnimRef.current);
      speakAnimRef.current = 0;
      return undefined;
    }

    speakAnimRef.current = window.setInterval(() => {
      const now = Date.now() / (status === "thinking" ? 320 : 140);
      setLevels(
        Array.from({ length: BAR_COUNT }, (_, index) => {
          const wave = Math.abs(Math.sin(now + index * 0.28));
          return status === "thinking" ? 0.12 + wave * 0.28 : 0.22 + wave * 0.78;
        }),
      );
    }, 40);

    return () => {
      if (speakAnimRef.current) window.clearInterval(speakAnimRef.current);
    };
  }, [status]);

  useEffect(() => {
    const openFromSidebar = () => {
      if (openRef.current) return;
      openRef.current = true;
      setOpen(true);
      setMode("idle");
    };
    window.addEventListener("voice-assistant:open", openFromSidebar);
    return () => window.removeEventListener("voice-assistant:open", openFromSidebar);
  }, []);

  useEffect(() => {
    return () => {
      openRef.current = false;
      stopListening();
      window.speechSynthesis?.cancel();
    };
  }, [stopListening]);

  const onOrbClick = () => {
    if (statusRef.current === "thinking") return;
    if (statusRef.current === "speaking") {
      window.speechSynthesis?.cancel();
      busyRef.current = false;
      startListening();
      return;
    }
    if (statusRef.current === "listening") {
      stopListening();
      setMode("idle");
      return;
    }
    startListening();
  };

  if (!isAuthenticated || !isTeamAdmin) return null;

  const energy =
    levels.reduce((sum, value) => sum + value, 0) / Math.max(levels.length, 1);

  const meta = STATUS[status] || STATUS.idle;
  const { captionLabel, captionText } = voiceCaption(status, heard, reply);

  const overlay = (
    <VoiceHud
      open={open}
      onClose={closeOverlay}
      status={status}
      energy={energy}
      meta={meta}
      captionLabel={captionLabel}
      captionText={captionText}
      onOrbClick={onOrbClick}
      people={people}
    />
  );

  return typeof document !== "undefined"
    ? createPortal(overlay, document.body)
    : overlay;
};

export default VoiceAssistantFab;
