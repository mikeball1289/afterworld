import World from "./World";
import * as Key from "../Key";
import Map, { GroundType } from "./Map";
import PlayerCharacter from "../actors/PlayerCharacter";
import Actor from "../actors/Actor";
import { keyboard } from "../root";

const WALK_IMPULSE = 0.5;
const IDLE_GROUNDED_DECAY = 0.85;
const HORIZONTAL_THRESHOLD = 0.7;
const EPSILON = 0.05;
const FULL_HORIZONTAL_DECAY = 0.9;
const JUMP_POWER = 8;

const GRAVITY = 0.6;
const TERMINAL_VELOCITY = 16;
const AERIAL_DRAG = 0.9;
const AERIAL_IMPULSE = 0.15;
const AERIAL_HORIZONTAL_DECAY = 0.2;

interface PointLike {
    x: number;
    y: number;
}

function testLine(start: PointLike, end: PointLike, test: (x: number, y: number) => boolean, steps: number = 1) {
    for (let i = 0; i <= steps; i ++) {
        if (test(start.x + (end.x - start.x) * i / steps, start.y + (end.y - start.y) * i / steps)) return true;
    }
    return false;
}

// move an actor through the word, returns a pair of booleans representing
// [horizontal collision occurred, vertical collision occurred]
function move(actor: Actor, map: Map): [boolean, boolean] {
    let magnitude = Math.ceil(Math.sqrt(actor.velocity.x * actor.velocity.x + actor.velocity.y * actor.velocity.y));
    let movingX = actor.velocity.x !== 0;
    let movingY = actor.velocity.y !== 0;
    let collisions: [boolean, boolean] = [false, false];
    for (let i = 0; i < magnitude && (movingX || movingY); i ++) {
        if (movingY) {
            actor.position.y += actor.velocity.y / magnitude;
            if (actor.velocity.y < 0) {
                // iunno
            } else {
                // if (Map.isWalkable(map.getPixelData(actor.left, actor.bottom - EPSILON)) ||
                //     Map.isWalkable(map.getPixelData(actor.right - EPSILON, actor.bottom - EPSILON)))
                if (testLine({ x: actor.left, y: actor.bottom - EPSILON }, { x: actor.right - EPSILON, y: actor.bottom - EPSILON },
                    (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2 ) &&
                    !testLine({ x: actor.left, y: actor.bottom - 2 }, { x: actor.right - EPSILON, y: actor.bottom - 2 }, // if we're inside of a passable solid, then we haven't actually gotten through
                    (x, y) => Map.isPassable(map.getPixelData(x, y)), actor.right - actor.left))
                {
                    if (testLine({ x: actor.left, y: actor.bottom - EPSILON }, { x: actor.right - EPSILON, y: actor.bottom - EPSILON },
                        (x, y) => Map.isPassableRamp(map.getPixelData(x, y)), 2 ))
                    {
                        movingX = false;
                    }
                    movingY = false;
                    collisions[1] = true;
                    actor.position.y = Math.floor(actor.position.y);
                }
            }
        }
        if (movingX) {
            actor.position.x += actor.velocity.x / magnitude;
            if (actor.velocity.x < 0) {
                // if (Map.isWalled(map.getPixelData(actor.left, actor.top)) ||
                    // Map.isWalled(map.getPixelData(actor.left, actor.bottom - 1 - EPSILON)))
                // {
                if (testLine({ x: actor.left, y: actor.top }, { x: actor.left, y: actor.bottom - 1 - EPSILON },
                    (x, y) => Map.isWalled(map.getPixelData(x, y)) ))
                {
                    movingX = false;
                    collisions[0] = true;
                    actor.position.x = Math.ceil(actor.position.x);
                }
            } else {
                // if (Map.isWalled(map.getPixelData(actor.right - EPSILON, actor.top)) ||
                //     Map.isWalled(map.getPixelData(actor.right - EPSILON, actor.bottom - 1 - EPSILON)))
                if (testLine({ x: actor.right - EPSILON, y: actor.top }, { x: actor.right - EPSILON, y: actor.bottom - 1 - EPSILON },
                    (x, y) => Map.isWalled(map.getPixelData(x, y)) ))
                {
                    movingX = false;
                    collisions[0] = true;
                    actor.position.x = Math.floor(actor.position.x);
                }
            }
            if (actor.velocity.y === 0) { // we're walking along the ground, detect 1px slopes
                // if (Map.isWalkable(map.getPixelData(actor.left, actor.bottom - 1)) ||
                //         Map.isWalkable(map.getPixelData(actor.right - EPSILON, actor.bottom - 1)))
                if (testLine({ x: actor.left, y: actor.bottom - 1 }, { x: actor.right - EPSILON, y: actor.bottom - 1 },
                    (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2 ))
                {
                    actor.position.y --;
                } else if (!testLine({ x: actor.left, y: actor.bottom }, { x: actor.right - EPSILON, y: actor.bottom },
                            (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2) &&
                            testLine({ x: actor.left, y: actor.bottom + 1 }, { x: actor.right - EPSILON, y: actor.bottom + 1 },
                            (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2))
                {
                    actor.position.y ++;
                }
            }
        }
    }
    return collisions;
}

function isGrounded(actor: Actor, map: Map) {
    return actor.velocity.y >= 0 &&
        (testLine({ x: actor.left, y: actor.bottom }, { x: actor.right - EPSILON, y: actor.bottom  },
        (x, y) => Map.isSolid(map.getPixelData(x, y)), 2) ||
        (testLine({ x: actor.left, y: actor.bottom }, { x: actor.right - EPSILON, y: actor.bottom  },
        (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2) &&
        !testLine({ x: actor.left, y: actor.bottom - 2 }, { x: actor.right - EPSILON, y: actor.bottom - 2 }, // if we're inside of a passable solid, then we haven't actually gotten through
        (x, y) => Map.isPassable(map.getPixelData(x, y)), actor.right - actor.left)));
}

export default function update(world: World) {
    let player = world.player;
    let map = world.map;
    // the player is grounded if they aren't moving upwards, and their left or right foot is touching a walkable pixel
    let grounded = isGrounded(player, map);

    if (grounded) {
        if (keyboard.isKeyDown(Key.LEFT)) {
            player.velocity.x -= WALK_IMPULSE;
        } else if (keyboard.isKeyDown(Key.RIGHT)) {
            player.velocity.x += WALK_IMPULSE;
        } else {
            player.velocity.x *= IDLE_GROUNDED_DECAY;
            if (Math.abs(player.velocity.x) < EPSILON) player.velocity.x = 0;
        }
        if (Math.abs(player.velocity.x) > HORIZONTAL_THRESHOLD) player.velocity.x *= FULL_HORIZONTAL_DECAY;
        if (keyboard.isKeyDown(Key.SPACE)) {
            if (keyboard.isKeyDown(Key.DOWN) &&
                !testLine({ x: player.left, y: player.bottom }, { x: player.right - EPSILON, y: player.bottom },
                            (x, y) => Map.isSolid(map.getPixelData(x, y)), 2))
            {
                player.position.y += 2;
            } else {
                player.velocity.y = -JUMP_POWER;
            }
        }

    } else { // we're flying through the sky!
        player.velocity.y += GRAVITY;
        if (Math.abs(player.velocity.y) > TERMINAL_VELOCITY) player.velocity.y *= AERIAL_DRAG;
        if (keyboard.isKeyDown(Key.LEFT)) {
            if (player.velocity.x > 0) player.velocity.x = player.velocity.x * FULL_HORIZONTAL_DECAY;
            if (player.velocity.x > -HORIZONTAL_THRESHOLD) player.velocity.x -= AERIAL_IMPULSE;
        } else if (keyboard.isKeyDown(Key.RIGHT)) {
            if (player.velocity.x < 0) player.velocity.x = player.velocity.x * FULL_HORIZONTAL_DECAY;
            if (player.velocity.x < HORIZONTAL_THRESHOLD) player.velocity.x += AERIAL_IMPULSE;
        } else {
            if (Math.abs(player.velocity.x) > HORIZONTAL_THRESHOLD) player.velocity.x *= FULL_HORIZONTAL_DECAY;
            else player.velocity.x *= AERIAL_HORIZONTAL_DECAY;
        }
    }

    let collisions = move(player, map);
    if (collisions[0]) player.velocity.x = 0;
    if (collisions[1]) player.velocity.y = 0;

}