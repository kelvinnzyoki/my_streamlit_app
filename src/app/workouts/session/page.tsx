"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ExternalLink,
  Pause,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { getWorkoutById, logWorkout } from "@/lib/api";
import { formatTime, imageUrl } from "@/lib/utils";
import type { Workout } from "@/types/workout";

type SetRow = { reps: string; load: string; done: boolean };

const YOUTUBE_BY_WORKOUT_KEY: Record<string, string> = {
  pushups: "IODxDxX7oi4",
  squats: "aclHkVaku9U",
  plank: "pSHjTRCQxIw",
  burpees: "dZgVxmf6jkA",
  mountainclimbers: "nmwgirgXLYM",
  boxjumps: "k7dmYdknbac",
  buttkicks: "oMW59TKZvaI",
  childpose: "kH12QrSGedM",
  crunches: "O0pIQ2UqeCY",
  downwarddog: "ayQoxw8sRTk",
  glutebridges: "Xp33YgPZgns",
  highknees: "ZNDHivUg7vA",
  hipflexor: "DXuStgWuJV8",
  jumpsquats: "BRfxI2Es2lE",
  jumpingjacks: "XR0xeuK5zBU",
  legraises: "U4L_6JEv9Jg",
  lunges: "ASdqJoDPMHA",
  pikepushups: "x7_I5SUAd00",
  russiantwists: "VfWoNC-NMII",
  sprintintervals: "Bf-ccdE5aSU",
  sprints: "Bf-ccdE5aSU",
  tricepdips: "89_spgcdQlw",
};

const IMAGE_CANDIDATES_BY_WORKOUT_KEY: Record<string, string[]> = {
  pushups: ["pushups.webp", "push-ups.webp", "push up.webp"],
  squats: ["squats.webp", "squat.webp"],
  plank: ["plank.webp"],
  burpees: ["burpees.webp", "burpees1 (1).webp", "burpee.webp"],
  mountainclimbers: [
    "mountainclimbers.webp",
    "mountain climbers.webp",
    "mountain-climbers.webp",
  ],
  boxjumps: ["boxjumps.webp", "box jumps.webp", "box-jumps.webp"],
  buttkicks: ["buttkicks.webp", "butt kicks.webp", "butt-kicks.webp"],
  childpose: [
    "childpose.webp",
    "child pose.webp",
    "child's pose.webp",
    "child-pose.webp",
  ],
  crunches: ["crunches.webp", "crunch.webp"],
  downwarddog: ["downwarddog.webp", "downward dog.webp", "downward-dog.webp"],
  glutebridges: [
    "glutebridges.webp",
    "glute bridges.webp",
    "glute-bridges.webp",
  ],
  highknees: ["highknees.webp", "high knees.webp", "high-knees.webp"],
  hipflexor: ["hipflexor.webp", "hip flexor.webp", "hip-flexor.webp"],
  jumpsquats: ["jumpsquats.webp", "jump squats.webp", "jump-squats.webp"],
  jumpingjacks: [
    "jumpingjacks.webp",
    "jumping jacks.webp",
    "jumping-jacks.webp",
  ],
  legraises: ["legraises.webp", "leg raises.webp", "leg-raises.webp"],
  lunges: ["lunges.webp", "lunge.webp"],
  pikepushups: [
    "pikepushups.webp",
    "pike pushups.webp",
    "pike push-ups.webp",
    "pike-pushups.webp",
  ],
  russiantwists: [
    "russiantwists.webp",
    "russian twists.webp",
    "russian-twists.webp",
  ],
  sprintintervals: [
    "sprints.webp",
    "sprints (1).webp",
    "sprint intervals.webp",
    "sprint-intervals.webp",
  ],
  sprints: ["sprints.webp", "sprints (1).webp"],
  tricepdips: ["tricepdips.webp", "tricep dips.webp", "tricep-dips.webp"],
};

function cleanWorkoutKey(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function canonicalWorkoutKeyFromValues(
  values: Array<string | null | undefined>,
) {
  const joined = values.map(cleanWorkoutKey).filter(Boolean).join(" ");

  if (joined.includes("boxjump")) return "boxjumps";
  if (joined.includes("burpee")) return "burpees";
  if (joined.includes("buttkick")) return "buttkicks";
  if (joined.includes("childpose") || joined.includes("childspose"))
    return "childpose";
  if (joined.includes("crunch")) return "crunches";
  if (joined.includes("downwarddog")) return "downwarddog";
  if (joined.includes("glutebridge")) return "glutebridges";
  if (joined.includes("highknee")) return "highknees";
  if (joined.includes("hipflexor")) return "hipflexor";
  if (joined.includes("jumpingjack")) return "jumpingjacks";
  if (joined.includes("jumpsquat")) return "jumpsquats";
  if (joined.includes("legraise")) return "legraises";
  if (joined.includes("lunge")) return "lunges";
  if (joined.includes("mountainclimber")) return "mountainclimbers";
  if (joined.includes("pikepush")) return "pikepushups";
  if (joined.includes("plank")) return "plank";
  if (
    joined.includes("pushup") ||
    joined.includes("pushups") ||
    joined.includes("push")
  )
    return "pushups";
  if (joined.includes("russiantwist")) return "russiantwists";
  if (joined.includes("sprintinterval")) return "sprintintervals";
  if (joined.includes("sprint")) return "sprints";
  if (joined.includes("squat")) return "squats";
  if (joined.includes("tricepdip") || joined.includes("dip"))
    return "tricepdips";

  return "";
}

function imageCandidatesForWorkout(workout: Workout, guide: string) {
  const candidates: string[] = [];
  const key = canonicalWorkoutKeyFromValues([
    workout.slug,
    workout.id,
    workout.name,
    guide,
  ]);

  if (key && IMAGE_CANDIDATES_BY_WORKOUT_KEY[key]) {
    candidates.push(
      ...IMAGE_CANDIDATES_BY_WORKOUT_KEY[key].map(
        (name) => `/images/exercises/${name}`,
      ),
    );
  }

  [workout.image, workout.altImage].forEach((raw) => {
    const value = String(raw || "").trim();
    if (!value) return;
    if (/^https?:\/\//i.test(value) || value.startsWith("/"))
      candidates.push(value);
    else if (value.includes("/"))
      candidates.push(`/${value.replace(/^\/+/, "")}`);
    else candidates.push(`/images/exercises/${value}`);
  });

  candidates.push(
    "/images/fit.webp",
    "/images/fit1.webp",
    "/images/fit1 (1).webp",
  );
  return [...new Set(candidates)];
}

function youtubeEmbedForWorkout(workout: Workout, guide: string) {
  const key = canonicalWorkoutKeyFromValues([
    workout.slug,
    workout.id,
    workout.name,
    guide,
  ]);
  const videoId = key ? YOUTUBE_BY_WORKOUT_KEY[key] : "";
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

type SessionToast = {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
};

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function SessionContent() {
  const params = useSearchParams();
  const router = useRouter();

  const id = params.get("id") || params.get("guide") || "pushups";
  const guide = params.get("guide") || id;
  const programId = params.get("programId") || params.get("program") || "";
  const enrollmentId =
    params.get("enrollmentId") || params.get("enrollment") || "";
  const returnUrl =
    params.get("returnUrl") ||
    (programId
      ? `/programs/${encodeURIComponent(programId)}${enrollmentId ? `?enrollmentId=${encodeURIComponent(enrollmentId)}&logged=1` : "?logged=1"}`
      : "/progress");
  const isProgramSession = Boolean(programId);
  const sessionStorageKey = `flowfit-session:${programId || "library"}:${guide}`;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sets, setSets] = useState<SetRow[]>([
    { reps: "", load: "", done: false },
  ]);
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Moderate" | "Hard">(
    "Moderate",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<SessionToast | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  function showToast(nextToast: SessionToast) {
    setToast(nextToast);
  }

  useEffect(() => {
    try {
      const savedSession = window.localStorage.getItem(sessionStorageKey);
      if (!savedSession) return;
      const parsed = JSON.parse(savedSession) as {
        seconds?: number;
        sets?: SetRow[];
        notes?: string;
        difficulty?: "Easy" | "Moderate" | "Hard";
      };
      if (Number.isFinite(Number(parsed.seconds)))
        setSeconds(Math.max(0, Number(parsed.seconds)));
      if (Array.isArray(parsed.sets) && parsed.sets.length)
        setSets(parsed.sets);
      if (typeof parsed.notes === "string") setNotes(parsed.notes);
      if (
        parsed.difficulty === "Easy" ||
        parsed.difficulty === "Moderate" ||
        parsed.difficulty === "Hard"
      )
        setDifficulty(parsed.difficulty);
    } catch {
      // Ignore corrupted local timer cache.
    }
  }, [sessionStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        sessionStorageKey,
        JSON.stringify({ seconds, sets, notes, difficulty }),
      );
    } catch {
      // Ignore storage failures.
    }
  }, [sessionStorageKey, seconds, sets, notes, difficulty]);

  useEffect(() => {
    setImageIndex(0);
  }, [guide]);

  useEffect(() => {
    let active = true;
    getWorkoutById(guide)
      .then((found) => {
        if (!active) return;
        if (found) {
          setWorkout(found);
          return;
        }
        setWorkout({
          id: guide,
          slug: guide,
          name:
            params.get("name") ||
            (isProgramSession ? "Program Workout" : "Workout Session"),
          category:
            params.get("category") ||
            (isProgramSession ? "Program" : "Exercise"),
          description: isProgramSession
            ? "Workout from your FlowFit program."
            : "FlowFit workout session.",
          image: "fit.webp",
          duration: 10,
          calories: 80,
          level: isProgramSession ? "Program" : "Workout",
          difficulty: isProgramSession ? "Program" : "Workout",
          muscles: [],
          instructions: [],
        } as Workout);
      })
      .catch(() => {
        if (!active) return;
        setWorkout({
          id: guide,
          slug: guide,
          name:
            params.get("name") ||
            (isProgramSession ? "Program Workout" : "Workout Session"),
          category:
            params.get("category") ||
            (isProgramSession ? "Program" : "Exercise"),
          description: isProgramSession
            ? "Workout from your FlowFit program."
            : "FlowFit workout session.",
          image: "fit.webp",
          duration: 10,
          calories: 80,
          level: isProgramSession ? "Program" : "Workout",
          difficulty: isProgramSession ? "Program" : "Workout",
          muscles: [],
          instructions: [],
        } as Workout);
      })
      .finally(() => {
        if (active) setLoadingWorkout(false);
      });

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [guide, params]);

  function toggleTimer() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      intervalRef.current = setInterval(
        () => setSeconds((current) => current + 1),
        1000,
      );
    }
    setRunning((current) => !current);
  }

  function resetTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setSeconds(0);
  }

  function addSet() {
    setSets((previous) => [...previous, { reps: "", load: "", done: false }]);
  }

  function updateSet(
    index: number,
    field: keyof SetRow,
    value: string | boolean,
  ) {
    setSets((previous) =>
      previous.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  function removeSet(index: number) {
    setSets((previous) => previous.filter((_, i) => i !== index));
  }

  const caloriesPerMinute = workout
    ? Number(
        workout.calories ||
          (workout as any).caloriesBurned ||
          params.get("cal") ||
          0,
      ) / Math.max(Number(workout.duration || 10), 1)
    : 0;
  const liveCaloriesExact = Math.max(0, caloriesPerMinute * (seconds / 60));
  const caloriesForSave = Number(liveCaloriesExact.toFixed(2));
  const displayCalories =
    seconds > 0 && caloriesForSave > 0 && caloriesForSave < 1
      ? "<1"
      : String(Math.round(caloriesForSave));

  async function handleLog() {
    if (!workout) return;

    if (seconds < 1) {
      showToast({
        type: "warning",
        title: "Start the timer first",
        message:
          "You need to log some workout time before saving this session.",
      });
      return;
    }

    setSaving(true);
    setToast(null);

    try {
      await logWorkout({
        workoutId: workout.id,
        exerciseId: workout.id,
        workoutSlug: workout.slug || workout.id,
        id: workout.id,
        name: workout.name,
        category: workout.category,
        duration: Math.max(Math.ceil(seconds / 60), 1),
        seconds,
        caloriesBurned: caloriesForSave,
        calories: caloriesForSave,
        difficulty,
        notes,
        sets: sets.filter((row) => row.reps || row.done),
        programId: programId || undefined,
        enrollmentId: enrollmentId || undefined,
        dayIndex: numberParam(params.get("dayIndex")),
        exerciseIndex: numberParam(
          params.get("exerciseIndex") || params.get("exIndex"),
        ),
        dayExerciseCount: numberParam(params.get("dayExerciseCount")),
        currentWeek: numberParam(params.get("currentWeek")),
        currentDay: numberParam(params.get("currentDay")),
        nextWeek: numberParam(params.get("nextWeek")),
        nextDay: numberParam(params.get("nextDay")),
      });

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
      setSaved(true);
      try {
        window.localStorage.removeItem(sessionStorageKey);
      } catch {}

      if (isProgramSession) {
        showToast({
          type: "success",
          title: "Workout logged",
          message:
            "Returning to your program so this workout can be marked as logged.",
        });
        window.setTimeout(() => {
          router.replace(returnUrl);
        }, 550);
        return;
      }

      showToast({
        type: "success",
        title: "Workout saved",
        message:
          "Choose where to go next. Your workout has been recorded successfully.",
        actions: [
          { label: "View Progress", href: "/progress", primary: true },
          { label: "Another Workout", href: "/workouts" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Programs", href: "/programs" },
        ],
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Could not save workout",
        message: err instanceof Error ? err.message : "Could not log workout.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loadingWorkout) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="muted">Loading session…</p>
        </section>
      </DashboardShell>
    );
  }

  if (!workout) {
    return (
      <DashboardShell>
        <section className="page-section">
          <p className="muted">Workout not found.</p>
        </section>
      </DashboardShell>
    );
  }

  const youtubeEmbed = youtubeEmbedForWorkout(workout, guide);
  const imageCandidates = imageCandidatesForWorkout(workout, guide);
  const sessionImage =
    imageCandidates[Math.min(imageIndex, imageCandidates.length - 1)] ||
    "/images/fit.webp";

  return (
    <DashboardShell>
      <section className="page-section">
        {toast && (
          <div className="ff-toast-viewport" role="status" aria-live="polite">
            <div className={`ff-session-toast ff-session-toast-${toast.type}`}>
              <button
                className="ff-toast-close"
                type="button"
                aria-label="Close notification"
                onClick={() => setToast(null)}
              >
                <X size={16} />
              </button>
              <p className="ff-toast-kicker">FlowFit</p>
              <h3>{toast.title}</h3>
              <p>{toast.message}</p>
              {toast.actions?.length ? (
                <div className="ff-toast-actions">
                  {toast.actions.map((action) => (
                    <Link
                      key={`${action.label}-${action.href}`}
                      href={action.href}
                      className={
                        action.primary ? "primary-btn" : "secondary-btn"
                      }
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="session-hero">
          <img
            src={imageUrl(sessionImage)}
            alt={workout.name}
            onError={() =>
              setImageIndex((current) =>
                Math.min(current + 1, imageCandidates.length - 1),
              )
            }
          />
          <div className="session-hero-overlay" />
          <div className="session-hero-content">
            <div className="badge-row">
              <span className="badge badge-cat">{workout.category}</span>
              {isProgramSession && (
                <span className="badge">Program Session</span>
              )}
            </div>
            <h1 style={{ margin: "0 0 0.5rem", color: "#fff" }}>
              {workout.name}
            </h1>
            <p className="muted" style={{ color: "rgba(255,255,255,0.82)" }}>
              {params.get("day") || "Workout Session"}
            </p>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div>
            <div
              className="premium-card session-tutorial-card"
              style={{ marginBottom: "1.25rem" }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <p className="eyebrow">Tutorial Video</p>
                <h2 style={{ margin: "0.35rem 0 0.45rem" }}>
                  Watch form before starting
                </h2>
                <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                  Watch form and technique for {workout.name} directly inside
                  your session.
                </p>
              </div>

              {youtubeEmbed ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    overflow: "hidden",
                    borderRadius: 18,
                    border: "1px solid var(--b1)",
                    background: "var(--ink)",
                  }}
                >
                  <iframe
                    src={youtubeEmbed}
                    title={`${workout.name} tutorial video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </div>
              ) : (
                <div className="mini-link">
                  <span>
                    No embedded tutorial is linked for this workout yet.
                  </span>
                  <ExternalLink size={15} />
                </div>
              )}
            </div>

            <div className="timer-card">
              <p className="timer-label">Session Timer</p>
              <div className={`timer-display ${running ? "running" : ""}`}>
                {formatTime(seconds)}
              </div>
              <div className="timer-controls">
                <button
                  className="timer-btn timer-btn-start"
                  onClick={toggleTimer}
                  disabled={saving || saved}
                >
                  {running ? (
                    <>
                      <Pause size={18} /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={18} /> {seconds > 0 ? "Resume" : "Start"}
                    </>
                  )}
                </button>
                <button
                  className="timer-btn timer-btn-reset"
                  onClick={resetTimer}
                  disabled={saving || saved}
                >
                  <RotateCcw size={16} /> Reset Timer
                </button>
              </div>
              <div className="live-cals">
                <span className="live-cals-label">Calories</span>
                <span className="live-cals-value">{displayCalories} kcal</span>
              </div>
            </div>

            <div className="sets-card">
              <div className="sets-header">
                <div>
                  <p className="sets-title">PERFORMANCE TRACKER</p>
                  <p className="sets-subtitle">
                    {isProgramSession
                      ? "Log sets and reps, then continue your program flow."
                      : "Log sets and reps, then save this workout."}
                  </p>
                </div>
                <button
                  className="sets-add-btn"
                  onClick={addSet}
                  disabled={saving || saved}
                >
                  <Plus size={14} /> Add Set
                </button>
              </div>

              <div className="sets-table-head">
                <span>#</span>
                <span>Reps</span>
                <span>Load</span>
                <span>✓</span>
                <span />
              </div>
              {sets.map((row, index) => (
                <div className="set-row" key={index}>
                  <span className="set-num">{index + 1}</span>
                  <input
                    className="set-input"
                    type="number"
                    min="0"
                    value={row.reps}
                    onChange={(e) => updateSet(index, "reps", e.target.value)}
                    disabled={saving || saved}
                  />
                  <input
                    className="set-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={row.load}
                    placeholder="BW"
                    onChange={(e) => updateSet(index, "load", e.target.value)}
                    disabled={saving || saved}
                  />
                  <button
                    className={`set-done-btn ${row.done ? "done" : ""}`}
                    onClick={() => updateSet(index, "done", !row.done)}
                    disabled={saving || saved}
                  >
                    <Check size={12} />
                  </button>
                  <button
                    className="set-del-btn"
                    disabled={sets.length === 1 || saving || saved}
                    onClick={() => removeSet(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="premium-card">
              <h2 style={{ marginBottom: "1rem" }}>Save Workout</h2>
              <div className="field">
                <label>Difficulty</label>
                <div className="session-difficulty-row">
                  {(["Easy", "Moderate", "Hard"] as const).map((item) => (
                    <button
                      key={item}
                      className={
                        difficulty === item ? "primary-btn" : "secondary-btn"
                      }
                      onClick={() => setDifficulty(item)}
                      disabled={saving || saved}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it go?"
                  disabled={saving || saved}
                />
              </div>
              <button
                className="primary-btn"
                style={{ width: "100%" }}
                onClick={handleLog}
                disabled={saving || saved}
              >
                {saving ? "Saving…" : saved ? "Saved" : "Save Workout"}
              </button>
              <p
                className="muted"
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "0.8rem",
                  textAlign: "center",
                }}
              >
                {isProgramSession
                  ? "Start the timer before saving. After saving, you will return to the program detail page automatically."
                  : "Start the timer before saving. After saving, four navigation options appear as a toast."}
              </p>
            </div>
          </div>

          <div>
            <div className="premium-card" style={{ marginBottom: "1.25rem" }}>
              <p className="eyebrow">About this exercise</p>
              <p className="muted">{workout.description}</p>
              <div className="pill-row">
                {(workout.muscles || []).map((muscle) => (
                  <span className="pill" key={muscle}>
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {workout.instructions?.length ? (
              <div className="premium-card" style={{ marginBottom: "1.25rem" }}>
                <h2 style={{ marginBottom: "1rem" }}>Instructions</h2>
                {workout.instructions.map((step, index) => (
                  <div key={`${step}-${index}`} className="mini-link">
                    <strong>{index + 1}</strong>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function WorkoutSessionPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          <section className="page-section">
            <p className="muted">Loading session…</p>
          </section>
        </DashboardShell>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
