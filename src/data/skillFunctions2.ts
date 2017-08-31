import Enemy from "../actors/Enemy";
import Player from "../actors/Player";
import SentinelFlame from "../projectiles/SentinelFlame";
import World from "../world/World";

export function sentinelFlames(player: Player, world: World) {
    let speed = 120;
    let orbits = 7;
    player.play("cast", {
        onProgress: (frame) => {
            if (frame !== 2) return;
            for (let i = 0; i < 3; i ++) {
                world.particleSystem.add(new SentinelFlame(world,
                                         player.stats.magicDamageAmount() * 1.2,
                                         speed * orbits + speed / 3 * i,
                                         speed, orbits, 50));
            }
        },
        onComplete: () => {
            player.attacking = false;
        },
    } );
    player.attacking = true;
    return true;
}
