import { EPSILON } from "./physicalConstants";
import World from "./World";
import * as Key from "../Key";
import Map, { GroundType } from "./Map";
import PlayerCharacter from "../actors/PlayerCharacter";
import Actor from "../actors/Actor";
import { keyboard } from "../root";

// move an actor through the world, returns a pair of booleans representing
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
                if (Map.testLine({ x: actor.left, y: actor.bottom - EPSILON }, { x: actor.right - EPSILON, y: actor.bottom - EPSILON },
                    (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2 ) &&
                    // if we're inside of a passable solid, then we haven't actually gotten through
                    !Map.testLine({ x: actor.left, y: actor.bottom - 2 }, { x: actor.right - EPSILON, y: actor.bottom - 2 },
                    (x, y) => Map.isPassable(map.getPixelData(x, y)), actor.right - actor.left))
                {
                    if (Map.testLine({ x: actor.left, y: actor.bottom - EPSILON }, { x: actor.right - EPSILON, y: actor.bottom - EPSILON },
                        (x, y) => Map.isPassableRamp(map.getPixelData(x, y)), 2 ))
                    {
                        movingX = false;
                    }
                    movingY = false;
                    collisions[1] = true;
                    actor.position.y = Math.floor(actor.position.y - EPSILON);
                }
            }
        }
        if (movingX) {
            actor.position.x += actor.velocity.x / magnitude;
            if (actor.velocity.x < 0) {
                // if (Map.isWalled(map.getPixelData(actor.left, actor.top)) ||
                    // Map.isWalled(map.getPixelData(actor.left, actor.bottom - 1 - EPSILON)))
                // {
                if (Map.testLine({ x: actor.left, y: actor.top }, { x: actor.left, y: actor.bottom - 1 - EPSILON },
                    (x, y) => Map.isWalled(map.getPixelData(x, y)) ))
                {
                    movingX = false;
                    collisions[0] = true;
                    actor.position.x = Math.ceil(actor.position.x);
                }
            } else {
                // if (Map.isWalled(map.getPixelData(actor.right - EPSILON, actor.top)) ||
                //     Map.isWalled(map.getPixelData(actor.right - EPSILON, actor.bottom - 1 - EPSILON)))
                if (Map.testLine({ x: actor.right - EPSILON, y: actor.top }, { x: actor.right - EPSILON, y: actor.bottom - 1 - EPSILON },
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
                if (Map.testLine({ x: actor.left, y: actor.bottom - 1 }, { x: actor.right - EPSILON, y: actor.bottom - 1 },
                    (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2 ))
                {
                    actor.position.y --;
                } else if (!Map.testLine({ x: actor.left, y: actor.bottom }, { x: actor.right - EPSILON, y: actor.bottom },
                            (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2) &&
                            Map.testLine({ x: actor.left, y: actor.bottom + 1 }, { x: actor.right - EPSILON, y: actor.bottom + 1 },
                            (x, y) => Map.isWalkable(map.getPixelData(x, y)), 2))
                {
                    actor.position.y ++;
                }
            }
        }
    }
    return collisions;
}

export default function update(world: World) {
    let player = world.player;
    let map = world.map;
    player.updateImpulse(map);

    player.handleCollisions(move(player, map));

}