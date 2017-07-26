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

// move an actor through the word, returns a pair of booleans representing
// [horizontal collision occurred, vertical collision occurred]
function move(actor: Actor, map: Map): [boolean, boolean] {
    let magnitude = Math.ceil(Math.sqrt(actor.velocity.x * actor.velocity.x + actor.velocity.y * actor.velocity.y));
    let movingX = actor.velocity.x !== 0;
    let movingY = actor.velocity.y !== 0;
    let collisions: [boolean, boolean] = [false, false];
    for (let i = 0; i < magnitude && (movingX || movingY); i ++) {
        if (movingX) {
            actor.position.x += actor.velocity.x / magnitude;
            if (actor.velocity.x < 0) {
                if (Map.isWalled(map.getPixelData(actor.left, actor.top)) ||
                    Map.isWalled(map.getPixelData(actor.left, actor.bottom - 1 - EPSILON)))
                {
                    movingX = false;
                    collisions[0] = true;
                    actor.position.x = Math.ceil(actor.position.x);
                }
            } else {
                if (Map.isWalled(map.getPixelData(actor.right - EPSILON, actor.top)) ||
                    Map.isWalled(map.getPixelData(actor.right - EPSILON, actor.bottom - 1 - EPSILON)))
                {
                    movingX = false;
                    collisions[0] = true;
                    actor.position.x = Math.floor(actor.position.x);
                }
            }
            if (actor.velocity.y === 0) { // we're walking along the ground, detect 1px slopes
                if (Map.isWalkable(map.getPixelData(actor.left, actor.bottom - 1)) ||
                        Map.isWalkable(map.getPixelData(actor.right - EPSILON, actor.bottom - 1)))
                {
                    actor.position.y --;
                } else if (!Map.isWalkable(map.getPixelData(actor.left, actor.bottom)) &&
                        !Map.isWalkable(map.getPixelData(actor.right - EPSILON, actor.bottom)) &&
                        (Map.isWalkable(map.getPixelData(actor.left, actor.bottom + 1)) ||
                        Map.isWalkable(map.getPixelData(actor.right - EPSILON, actor.bottom + 1))))
                {
                    actor.position.y ++;
                }
            }
        }
        if (movingY) {
            actor.position.y += actor.velocity.y / magnitude;
            if (actor.velocity.y < 0) {
                // iunno
            } else {
                if (Map.isWalled(map.getPixelData(actor.left, actor.bottom - EPSILON)) ||
                    Map.isWalled(map.getPixelData(actor.right - EPSILON, actor.bottom - EPSILON)))
                {
                    movingY = false;
                    collisions[1] = true;
                    actor.position.y = Math.floor(actor.position.y);
                }
            }
        }
    }
    return collisions;
}

export default function update(world: World) {
    let player = world.player;
    let map = world.map;
    // the player is grounded if they aren't moving upwards, and their left or right foot is touching a walkable pixel
    let grounded = player.velocity.y >= 0 &&
                    (Map.isWalkable(map.getPixelData(player.left, player.bottom)) ||
                    Map.isWalkable(map.getPixelData(player.right - EPSILON, player.bottom)));

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
            player.velocity.y = -JUMP_POWER;
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