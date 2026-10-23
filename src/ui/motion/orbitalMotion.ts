// SPDX-License-Identifier: MPL-2.0
export type OrbitalStage = "rest" | "dispersing" | "orbiting" | "returning";
interface Point { x: number; y: number }
interface Sample { point: Point; velocity: Point }
interface Particle { element: Pick<HTMLElement, "animate">; home: Point }
interface Track {
  animation: Animation;
  points: Point[];
  duration: number;
  delay: number;
  loop: boolean;
}

const steps = 96;
const still = (point: Point): Sample => ({ point, velocity: { x: 0, y: 0 } });
const periods = [6200, 8100, 9700];

function sample(track: Track | null, home: Point): Sample {
  if (!track) return still(home);
  const time = typeof track.animation.currentTime === "number" ? track.animation.currentTime : 0;
  if (time < track.delay) return still(track.points[0]);
  const elapsed = time - track.delay;
  if (!track.loop && elapsed >= track.duration) return still(track.points.at(-1)!);
  const t = (track.loop ? elapsed % track.duration : elapsed) / track.duration * steps;
  const index = Math.min(steps - 1, Math.floor(t)), fraction = t - index;
  const a = track.points[index], b = track.points[index + 1], dt = track.duration / steps;
  return {
    point: { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction },
    velocity: { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt },
  };
}

function transition(from: Sample, to: Sample, duration: number) {
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps, a = 2 * t ** 3 - 3 * t ** 2 + 1, b = t ** 3 - 2 * t ** 2 + t;
    const c = -2 * t ** 3 + 3 * t ** 2, d = t ** 3 - t ** 2;
    return {
      x: a * from.point.x + b * from.velocity.x * duration + c * to.point.x + d * to.velocity.x * duration,
      y: a * from.point.y + b * from.velocity.y * duration + c * to.point.y + d * to.velocity.y * duration,
    };
  });
  // Match the actual linear WAAPI segment velocities at both joins.
  const dt = duration / steps;
  points[1] = { x: from.point.x + from.velocity.x * dt, y: from.point.y + from.velocity.y * dt };
  points[steps - 1] = { x: to.point.x - to.velocity.x * dt, y: to.point.y - to.velocity.y * dt };
  return points;
}

export function createOrbitalMotion(particles: Particle[], changed: (stage: OrbitalStage) => void = () => {}) {
  const tracks: (Track | null)[] = particles.map(() => null);
  const phases: OrbitalStage[] = particles.map(() => "rest");
  let wanted = false, reduced = false, disposed = false, published: OrbitalStage | null = null;
  const state = (): OrbitalStage => phases.every(p => p === "rest") ? "rest"
    : !wanted ? "returning" : phases.every(p => p === "orbiting") ? "orbiting" : "dispersing";
  function publish() {
    const next = state();
    if (next !== published) { published = next; changed(next); }
  }
  function stop(index: number) {
    const old = tracks[index];
    tracks[index] = null;
    old?.animation.cancel();
    phases[index] = "rest";
  }
  function play(index: number, points: Point[], duration: number, stage: OrbitalStage, delay = 0, completed?: () => void) {
    const { element, home } = particles[index];
    stop(index);
    const animation = element.animate(points.map((p, i) => ({
      offset: i / steps, transform: `translate(${p.x - home.x}px, ${p.y - home.y}px)`,
    })), { duration, delay, iterations: stage === "orbiting" ? Infinity : 1, easing: "linear", fill: "both" });
    const track = { animation, points, duration, delay, loop: stage === "orbiting" };
    tracks[index] = track;
    phases[index] = stage;
    void animation.finished.then(() => {
      if (disposed || tracks[index] !== track) return;
      if (completed) completed();
      else { stop(index); publish(); }
    }, () => { /* Cancellation is normal when interaction changes. */ });
    publish();
  }
  function disperse(index: number) {
    const { home } = particles[index], from = sample(tracks[index], home);
    const fresh = phases[index] === "rest", duration = 500 + index * 65;
    const period = periods[index % periods.length], direction = index % 2 ? -1 : 1;
    const radius = Math.hypot(home.x, home.y) + 5 + index * .8;
    const angle = Math.atan2(from.point.y, from.point.x) + direction * duration / period * Math.PI;
    const orbit = Array.from({ length: steps + 1 }, (_, i) => {
      const phase = angle + direction * i / steps * Math.PI * 2;
      return { x: Math.cos(phase) * radius, y: Math.sin(phase) * radius };
    });
    orbit[steps] = orbit[0];
    const dt = period / steps;
    const target = { point: orbit[0], velocity: { x: (orbit[1].x - orbit[0].x) / dt, y: (orbit[1].y - orbit[0].y) / dt } };
    play(index, transition(from, target, duration), duration, "dispersing", fresh ? index * 45 : 0, () => {
      if (wanted && !reduced) play(index, orbit, period, "orbiting");
    });
  }
  publish();
  return {
    get state() { return state(); },
    setActive(active: boolean) {
      if (disposed || wanted === active) return;
      wanted = active;
      if (reduced) return;
      particles.forEach(({ home }, index) => {
        if (active) disperse(index);
        else if (phases[index] !== "rest") {
          const from = sample(tracks[index], home), duration = 680 + index * 70;
          play(index, transition(from, still(home), duration), duration, "returning");
        }
      });
      publish();
    },
    setReducedMotion(value: boolean) {
      if (disposed || reduced === value) return;
      reduced = value;
      if (reduced) particles.forEach((_, i) => stop(i));
      else if (wanted) particles.forEach((_, i) => disperse(i));
      publish();
    },
    dispose() {
      disposed = true;
      particles.forEach((_, i) => stop(i));
      publish();
    },
  };
}
