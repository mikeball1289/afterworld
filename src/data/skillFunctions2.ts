import {Enemy} from "../actors/Enemy";
import {Player} from "../actors/Player";
import {ColorTweener} from "../ColorTweener";
import {Animator} from "../display/Animator";
import {GenericEffectParticle} from "../particlesystem/GenericEffectParticle";
import {fromTextureCache} from "../pixiTools";
import {SentinelFlame} from "../projectiles/SentinelFlame";
import {controls, InputType, juggler, soundManager} from "../root";
import {attackSpeedFPS, GRAVITY} from "../world/physicalConstants";
import {World} from "../world/World";
import {meleeHit} from "./skillFunctions";

export function sentinelFlames(player: Player, world: World) {
    let speed = 120;
    let orbits = 7;
    player.fps = attackSpeedFPS(6, player.stats.attackSpeed);
    player.play("cast", {
        onProgress: (frame) => {
            if (frame !== 2) return;
            for (let i of range(0, 3)) {
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

export function pounce(player: Player, world: World) {
    if (!world.map || !world.map.isGrounded(player)) return false;
    player.play("attack2");
    player.pause();
    player.velocity.set(player.direction * 6, -player.stats.jumpPower * 0.8);
    player.fps = attackSpeedFPS(6, player.stats.attackSpeed);
    let pounceFn = () => {
        if (player.isDead() || !world.map) return juggler.remove(pounceFn);
        player.velocity.x = player.direction * 6;
        player.velocity.y += 0.5;
        if (world.map.isGrounded(player)) {
            meleeHit(player, world, 1.2);
            juggler.remove(pounceFn);
            player.play("attack2", {
                override: true,
                onComplete: () => {
                    player.attacking = false;
                },
            }, true);
            player.goto(2);
        }
    };
    juggler.add(pounceFn);
    player.attacking = true;
    return true;
}

let sparkleColors = new ColorTweener(0x96D8FF, 0xF2F2F2);
function wingParticles(player: Player, world: World) {
    let particles: GenericEffectParticle[] = [];
    for (let i of range(0, 15)) {
        let particle: GenericEffectParticle;
        if (i % 3 === 0) {
            particle = new GenericEffectParticle(90, fromTextureCache("/images/particles.png", 97, 2, 30, 15), world, Math.random() * Math.PI - Math.PI / 2, Math.random() < 0.5);
            particle.scale.x *= 1.5;
            particle.scale.y *= 1.5;
        } else {
            particle = new GenericEffectParticle(90, fromTextureCache("/images/particles.png", 129, 0, 26, 26), world, Math.random() * Math.PI * 2);
            particle.sprite.tint = sparkleColors.getInbetween(Math.random());
        }
        particle.rotationSpeed = (Math.random() - 0.5) / 10;
        let orbit = Math.random() * Math.PI;
        if (orbit > Math.PI / 2) orbit += Math.PI * 3 / 4;
        else orbit += Math.PI / 4;
        let magnitude = Math.random() * 20 + 40;
        particle.x = player.center.x + Math.sin(orbit) * magnitude;
        particle.y = player.center.y + Math.cos(orbit) * magnitude;
        particle.velocity.x = (Math.random() / 2 + 0.5) * player.velocity.x + Math.sin(orbit) * 1.3;
        particle.velocity.y = Math.cos(orbit) * 1.3;
        particles.push(particle);
    }
    return particles;
}

let wings: Animator<{flap: [number, number]}>;
let ascentionLock = false;
export function ascention(player: Player, world: World) {
    if (ascentionLock || !world.map || world.map.isGrounded(player)) return false;
    if (!wings) {
        wings = new Animator(fromTextureCache("/images/wings.png"), new PIXI.Point(143, 189), {
            flap: [0, 3],
        }, "flap", 4);
        wings.anchor.set(0.5);
        wings.x = player.size.x / 2;
        wings.y = player.size.y / 2;
    }
    let ascentionFn = () => {
        if (!world.map) return;
        let grounded = world.map.isGrounded(player);
        if (player.velocity.y > GRAVITY) player.velocity.y -= GRAVITY * 2;
        if (!grounded) player.velocity.y -= GRAVITY / 2;
        if (wings.frameProgress > 1 && player.velocity.y > 0) player.velocity.y = 0;
        if (wings.frameProgress > 1 && wings.frameProgress < 2.5 && player.velocity.y > -player.stats.jumpPower * wings.frameProgress / 3.5) {
            player.velocity.y -= GRAVITY;
            if (grounded) player.velocity.y -= GRAVITY * 2;
        }
    };
    juggler.add(ascentionFn);
    ascentionLock = true;
    player.addChildAt(wings, 0);
    wings.play("flap", {
        override: true,
        onProgress: (frame) => {
            if (frame !== 1) return;
            soundManager.playSound("/sounds/flap.ogg", 1.5);
            for (let particle of wingParticles(player, world)) {
                world.particleSystem.add(particle);
            }
            if (controls.hasInput(InputType.LEFT)) player.velocity.x = Math.min(player.velocity.x, -3);
            if (controls.hasInput(InputType.RIGHT)) player.velocity.x = Math.max(player.velocity.x, 3);
        },
        onComplete: () => {
            juggler.remove(ascentionFn);
            ascentionLock = false;
            player.removeChild(wings);
        },
    } );
    for (let particle of wingParticles(player, world)) {
        world.particleSystem.add(particle);
    }
    return true;
}
