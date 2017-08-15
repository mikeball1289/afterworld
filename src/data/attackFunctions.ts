import Enemy from "../actors/Enemy";
import Player from "../actors/Player";
import BuckleDownBuff from "../buffs/BuckleDownBuff";
import EnvenomedBuff from "../buffs/EnvenomedBuff";
import StunDebuff from "../buffs/StunDebuff";
import ColorTweener from "../ColorTweener";
import FireParticle from "../particlesystem/FireParticle";
import GenericEffectParticle from "../particleSystem/GenericEffectParticle";
import { fromTextureCache } from "../pixiTools";
import { juggler, soundManager } from "../root";
import World from "../world/World";

export interface IAttackFunction {
    (player: Player, world: World): boolean;
}

interface IAttackFunctions {
    basicAttack: IAttackFunction;

    explosion: IAttackFunction;
    teleport: IAttackFunction;

    tremor: IAttackFunction;
    leap: IAttackFunction;

    ambush: IAttackFunction;
    envenom: IAttackFunction;
}

const swishes = ["/sounds/swish1.ogg", "/sounds/swish2.ogg", "/sounds/swish3.ogg"];
const BASIC_ATTACKS: ["attack1", "attack2"] = ["attack1", "attack2"];
let castIdx = 0;

function getAttackBox(player: Player) {
    if (!player.inventory.equipment.weapon) return new PIXI.Rectangle(player.horizontalCenter, player.top + player.size.y * 0.4, 1, 1);
    return new PIXI.Rectangle(player.horizontalCenter, player.top + player.size.y * 0.4, player.inventory.equipment.weapon.range + 15, 25);
}

function applyAttack(player: Player, enemy: Enemy, damage: number, knockback: PIXI.Point) {
    let {damage: d, knockback: k} = player.buffs.process("dealDamage", { damage, knockback} );
    damage = Math.ceil(d);
    knockback = k;
    if (enemy.applyAttack(damage, knockback)) {
        player.buffs.process("damageDealt", enemy);
        if (enemy.health <= 0) {
            player.buffs.process("killedEnemy", enemy);
        }
        return true;
    }
    return false;
}

function meleeHit(player: Player, world: World, knockbackPower = 4) {
    let attackBox: PIXI.Rectangle = getAttackBox(player);
    let enemies = world.actorManager.enemies;

    soundManager.playSound(swishes[Math.floor(Math.random() * swishes.length)], 0.7);

    let attackFn = (enemy: Enemy): boolean => {
        if (enemy.left < attackBox.right && enemy.right > attackBox.left && enemy.top < attackBox.bottom && enemy.bottom > attackBox.top) {
            let damage = Math.floor(Math.random() * 3 + 2);
            return applyAttack(player, enemy, damage, new PIXI.Point(knockbackPower * player.direction, 0));
        }
        return false;
    };

    if (player.direction === -1) {
        attackBox.x -= attackBox.width;
        for (let i = enemies.length - 1; i >= 0; i --) {
            if (attackFn(enemies[i])) break;
        }
    } else {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < enemies.length; i ++) {
            if (attackFn(enemies[i])) break;
        }
    }
}

function drawExplosionParticles(player: Player, world: World) {
    let startTweener = new ColorTweener(0xFFFFFF, 0xFFF191);
    let endTweener = new ColorTweener(0xFFF191, 0xD60000);
    for (let i = 0; i < 400; i ++) {
        let randomDirection = Math.random() * Math.PI * 2;
        let speed = (Math.random() + Math.floor(i / 100)) * 0.4 + 0.1;
        speed *= Math.abs(speed);
        let particle = new FireParticle((100 - (speed * speed * 6) - Math.random() * (40 - speed * 20)) / 2,
                                        new ColorTweener(startTweener.getInbetween(speed / 2.89), endTweener.getInbetween(speed / 2.89)));
        let radialX = speed * Math.sin(randomDirection);
        let radialY = speed * Math.cos(randomDirection);
        particle.velocity.x = radialX * 2 + player.velocity.x * 0.3;
        particle.velocity.y = radialY * 2 + player.velocity.y * 0.3;
        particle.x = player.horizontalCenter + radialX * 15;
        particle.y = player.verticalCenter + radialY * 15;
        world.particleSystem.add(particle);
    }
}

export function explosion(player: Player, world: World) {
    if (!world.map || !world.map.isGrounded(player)) return false;
    player.play("cast", {
        onProgress: (frame) => {
            if (frame !== 2) return;
            drawExplosionParticles(player, world);
            soundManager.playSound("/sounds/explosion.ogg");

            let cx = player.horizontalCenter;
            let cy = player.verticalCenter;
            for (let enemy of world.actorManager.enemies) {
                let enemySize = (enemy.size.x + enemy.size.y) / 4;
                let dx = enemy.horizontalCenter - cx;
                let dy = enemy.verticalCenter - cy;
                let dist = Math.sqrt(dx * dx + dy * dy) - enemySize;
                if (dist < 100) {
                    let angle = Math.atan(dy / dx);
                    if (dy < 0) angle += Math.PI;
                    let xkb = (100 - dist) * Math.sin(angle) * 0.1;
                    let ykb = Math.min(Math.max(-5, -Math.abs(xkb)), (100 - dist) * Math.cos(angle) * 0.1);
                    let damage = Math.ceil((100 - dist) / 10 * (Math.random() / 2 + 0.5));
                    applyAttack(player, enemy, damage, new PIXI.Point(xkb, ykb));
                }
            }
        },
        onComplete: () => {
            player.attacking = false;
        },
    } );
    player.attacking = true;
    return true;
}

export function basicAttack(player: Player, world: World) {
    let randomAttack = BASIC_ATTACKS[Math.floor(Math.random() * 2)];
    player.play(randomAttack, {
        onProgress: (frame) => {
            if (frame !== 2) return;
            meleeHit(player, world);
        },
        onComplete: () => {
            player.attacking = false;
        },
    } );
    player.attacking = true;
    return true;
}

export function tremor(player: Player, world: World) {
    if (!world.map || !world.map.isGrounded(player)) return false;
    let idx = castIdx ++;
    player.play("cast", {
        onProgress: (frame) => {
            if (frame !== 2) return;
            let playerScreenCoords = player.getGlobalPosition(undefined, true);
            let px = player.horizontalCenter;
            let py = player.verticalCenter;

            let filter = new PIXI.filters.ShockwaveFilter();
            filter.center = [(playerScreenCoords.x + player.size.x) / 2048, (playerScreenCoords.y + player.size.y) / 2048];
            filter.params = [5, 0.8, 0.03];
            let time = 0;
            let oef = () => {
                time += 0.04;
                filter.time = time * 0.16;
                filter.params[2] -= 0.001;

                for (let enemy of world.actorManager.enemies) {
                    let dx = enemy.horizontalCenter - px;
                    let dy = enemy.verticalCenter - py;
                    if (Math.sqrt(dx * dx + dy * dy) < time * 200) {
                        if (!enemy.buffs.hasBuffFromSource("tremor" + idx)) {
                            enemy.buffs.addBuff(new StunDebuff(120, "tremor" + idx));
                        }
                    }
                }
                if (time >= 1) {
                    world.removeFilter(filter);
                    juggler.remove(oef);
                }
            };
            world.useFilter(filter);
            juggler.add(oef);

        },
        onComplete: () => player.attacking = false,
    } );
    player.attacking = true;
    return true;
}

export function ambush(player: Player, world: World) {
    let hitFn = (frame: number) => {
        if (frame !== 2) return;
        meleeHit(player, world, 1);
    };
    let hits = 0;
    let tempFPS = player.fps;
    player.fps = 18;
    let completeFn = () => {
        hits ++;
        if (hits < 6) {
            player.attacking = false;
            player.play(BASIC_ATTACKS[Math.floor(Math.random() * BASIC_ATTACKS.length)], {
                override: true,
                onProgress: hitFn,
                onComplete: completeFn,
            } );
            player.attacking = true;
        } else {
            player.fps = tempFPS;
            player.attacking = false;
        }
    };

    player.play(BASIC_ATTACKS[Math.floor(Math.random() * BASIC_ATTACKS.length)], {
        onProgress: hitFn,
        onComplete: completeFn,
    } );

    player.attacking = true;
    return true;
}

function splashHit(player: Player, world: World, hitFn: (enemy: Enemy) => boolean) {
    let attackBox = getAttackBox(player);
    let enemies = world.actorManager.enemies;

    soundManager.playSound(swishes[Math.floor(Math.random() * swishes.length)], 0.7);

    let attackFn = (enemy: Enemy): boolean => {
        if (enemy.left < attackBox.right && enemy.right > attackBox.left && enemy.top < attackBox.bottom && enemy.bottom > attackBox.top) {
            return hitFn(enemy);
        }
        return false;
    };

    if (player.direction === -1) {
        attackBox.x -= attackBox.width;
        for (let i = enemies.length - 1; i >= 0; i --) {
            attackFn(enemies[i]);
        }
    } else {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < enemies.length; i ++) {
            attackFn(enemies[i]);
        }
    }
}

export function cleave(player: Player, world: World) {
    let randomAttack = BASIC_ATTACKS[Math.floor(Math.random() * 2)];
    player.play(randomAttack, {
        onProgress: (frame) => {
            if (frame !== 2) return;
            let enemiesHit = 0;
            splashHit(player, world, (enemy) => {
                if (enemiesHit >= 3) return false;
                let damage = Math.random() * 3 + 2;
                let knockback: PIXI.Point;
                if (enemiesHit === 0) {
                    damage *= 1.5;
                    knockback = new PIXI.Point(4 * player.direction, 0);
                } else {
                    knockback = new PIXI.Point(1 * player.direction);
                }
                if (applyAttack(player, enemy, damage, knockback)) {
                    enemiesHit ++;
                    return true;
                }
                return false;
            });

            let particle = new GenericEffectParticle(20, fromTextureCache("/images/particles.png", 21, 0, 48, 17));
            particle.x = player.horizontalCenter + 40 * player.direction;
            particle.y = player.verticalCenter;
            particle.scale.x = player.direction;
            particle.velocity.x = 2 * player.direction;
            world.particleSystem.add(particle);
        },
        onComplete: () => {
            player.attacking = false;
        },
    } );
    player.attacking = true;
    return true;
}

export function buckleDown(player: Player, world: World) {
    player.buffs.addBuff(new BuckleDownBuff(240, "Buckle Down"));
}

export function teleport(player: Player, world: World) {
    if (!world.map || !world.map.isGrounded(player)) return false;
    let tempVelocity = player.velocity;
    player.velocity = new PIXI.Point(200 * player.direction, 0);
    world.map.move(player);
    player.velocity = tempVelocity;
    return true;
}

export function leap(player: Player, world: World) {
    if (!world.map || !world.map.isGrounded(player)) return false;
    player.velocity.y = -player.stats.jumpPower() * 1.55;
    player.velocity.x += player.stats.walkSpeed() * 15 * player.direction;
    return true;
}

export function envenom(player: Player, world: World) {
    let existing = player.buffs.hasBuff("Envenomed");
    if (existing) {
        (<EnvenomedBuff> existing).refresh();
    } else {
        console.log("hi");
        player.buffs.addBuff(new EnvenomedBuff("Envenomed"));
    }
    return true;
}
