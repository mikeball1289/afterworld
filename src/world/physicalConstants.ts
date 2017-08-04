export const WALK_IMPULSE = 0.3;
export const IDLE_GROUNDED_DECAY = 0.85;
export const HORIZONTAL_THRESHOLD = 0.6;
export const EPSILON = 0.05;
export const FULL_HORIZONTAL_DECAY = 0.9;
export const JUMP_POWER = 8;
export const FALLTHROUGH_JUMP_POWER = 2;

export const GRAVITY = 0.6;
export const TERMINAL_VELOCITY = 16;
export const AERIAL_DRAG = 0.88;
export const AERIAL_IMPULSE = 0.15;
export const AERIAL_HORIZONTAL_DECAY = 0.99;

export function repulsionForce(dist: number, damper = 8.5) {
    return (Math.PI / 2 - Math.atan(Math.abs(dist / 50))) / (Math.PI * damper)
}