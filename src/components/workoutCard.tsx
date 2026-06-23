import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Flame, Timer, Dumbbell } from "lucide-react";
import type { Workout } from "@/types/workout";

const WORKOUT_IMAGE_MAP: Record<string, string> = {
  boxjumps: "boxjumps1 (1).webp",
  burpees: "burpees1 (1).webp",
  buttkicks: "buttkicks1 (1).webp",
  childpose: "childpose1 (1).webp",
  crunches: "crunches1 (1).webp",
  downwarddog: "downwarddog.webp",
  glutebridges: "glutebridges.webp",
  highknees: "highknees.webp",
  hipflexor: "hipflexor.webp",
  jumpingjacks: "jumpingjacks.webp",
  jumpsquats: "jumpsquats.webp",
  legraises: "legraises.webp",
  lunges: "lunges (1).webp",
  mountainclimbers: "mountainclimbers (1).webp",
  pikepushups: "pikepushups.webp",
  plank: "plank.webp",
  pushups: "pushups.webp",
  russiantwists: "russiantwists.webp",
  sprints: "sprints (1).webp",
  squats: "squats.webp",
  tricepdips: "tricepdips (1).webp",
};

const WORKOUT_IMAGE_CANDIDATES: Record<string, string[]> = {
  boxjumps: ["boxjumps.webp", "box jumps.webp", "box-jumps.webp"],
  burpees: ["burpees.webp", "burpees1 (1).webp", "burpee.webp"],
  buttkicks: ["butt kicks.webp", "buttkicks.webp", "butt-kicks.webp"],
  childpose: [
    "child pose.webp",
    "childpose.webp",
    "child's pose.webp",
    "child-pose.webp",
  ],
  crunches: ["crunches.webp", "crunch.webp"],
  downwarddog: ["downward dog.webp", "downwarddog.webp", "downward-dog.webp"],
  lunges: ["lunges.webp", "lunge.webp"],
  mountainclimbers: [
    "mountain climbers.webp",
    "mountainclimbers.webp",
    "mountain-climbers.webp",
  ],
  sprintintervals: [
    "sprints.webp",
    "sprints (1).webp",
    "sprint intervals.webp",
    "sprint-intervals.webp",
  ],
  sprints: ["sprints.webp", "sprints (1).webp"],
  tricepdips: ["tricep dips.webp", "tricepdips.webp", "tricep-dips.webp"],
};

function clean(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function canonicalWorkoutKey(workout: Workout) {
  const candidates = [workout.slug, workout.id, workout.name]
    .map(clean)
    .filter(Boolean);
  const joined = candidates.join(" ");

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
  if (joined.includes("pushup") || joined.includes("push")) return "pushups";
  if (joined.includes("russiantwist")) return "russiantwists";
  if (joined.includes("sprintinterval")) return "sprintintervals";
  if (joined.includes("sprint")) return "sprints";
  if (joined.includes("squat")) return "squats";
  if (joined.includes("tricepdip") || joined.includes("dip"))
    return "tricepdips";

  return "";
}

function workoutImageCandidates(workout: Workout) {
  const key = canonicalWorkoutKey(workout);
  const candidates: string[] = [];

  if (key && WORKOUT_IMAGE_CANDIDATES[key]) {
    candidates.push(
      ...WORKOUT_IMAGE_CANDIDATES[key].map(
        (name) => `/images/exercises/${name}`,
      ),
    );
  } else if (key && WORKOUT_IMAGE_MAP[key]) {
    candidates.push(`/images/exercises/${WORKOUT_IMAGE_MAP[key]}`);
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

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageCandidates = workoutImageCandidates(workout);
  const imageSrc =
    imageCandidates[Math.min(imageIndex, imageCandidates.length - 1)] ||
    "/images/fit.webp";
  const href = `/workouts/session?id=${encodeURIComponent(workout.slug || workout.id)}`;
  const duration = Number(workout.duration || 10);
  const calories = Number(workout.calories || 0);
  const category = workout.category || "Exercise";

  return (
    <article className="ff-workout-card premium-card content-card">
      <Link
        href={href}
        className="ff-workout-media"
        aria-label={`Start ${workout.name}`}
      >
        <img
          src={imageSrc}
          alt={workout.name}
          loading="lazy"
          onError={() =>
            setImageIndex((current) =>
              Math.min(current + 1, imageCandidates.length - 1),
            )
          }
        />
        <span className="ff-workout-category">{category}</span>
      </Link>

      <div className="ff-workout-body">
        <div className="ff-workout-title-row">
          <Dumbbell size={18} aria-hidden="true" />
          <h3>{workout.name}</h3>
        </div>

        <p className="muted clamp-3 ff-workout-desc">
          {workout.description || "Guided FlowFit workout session."}
        </p>

        <div className="ff-workout-stats" aria-label="Workout details">
          <span>
            <Timer size={14} /> {duration} min
          </span>
          <span>
            <Flame size={14} /> {calories} kcal
          </span>
        </div>

        <Link href={href} className="primary-btn ff-workout-start">
          Start Session <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
