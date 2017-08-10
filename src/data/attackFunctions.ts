import Enemy from "../actors/Enemy";
import PlayerCharacter from "../actors/PlayerCharacter";
import ColorTweener from "../ColorTweener";
import FireParticle from "../particlesystem/FireParticle";
import { soundManager } from "../root";
import World from "../world/World";

export interface IAttackFunction {
    (player: PlayerCharacter, world: World): void;
}

interface IAttackFunctions {
    basicAttack: IAttackFunction;
    explosion: IAttackFunction;
}

const swishes = ["/sounds/swish1.ogg", "/sounds/swish2.ogg", "/sounds/swish3.ogg"];
const BASIC_ATTACKS: ["attack1", "attack2"] = ["attack1", "attack2"];

let attackFunctions: IAttackFunctions = {
    // do the animations and setup triggers for basic attack
    basicAttack: (player, world) => {
        let randomAttack = BASIC_ATTACKS[Math.floor(Math.random() * 2)];
        player.play(randomAttack, {
            onProgress: (frame) => {
                if (frame === 2) {
                    let attackBox: PIXI.Rectangle = new PIXI.Rectangle(player.horizontalCenter, player.top + player.size.y * 0.4, 75, 25);
                    let enemies = world.actorManager.enemies;

                    soundManager.playSound(swishes[Math.floor(Math.random() * swishes.length)], 0.7);

                    let applyAttack = (enemy: Enemy): boolean => {
                        if (enemy.left < attackBox.right && enemy.right > attackBox.left && enemy.top < attackBox.bottom && enemy.bottom > attackBox.top) {
                            return enemy.applyAttack(Math.floor(Math.random() * 3 + 2), new PIXI.Point(4 * player.direction, 0));
                        }
                        return false;
                    };

                    if (player.direction === -1) {
                        attackBox.x -= attackBox.width;
                        for (let i = enemies.length - 1; i >= 0; i --) {
                            if (applyAttack(enemies[i])) break;
                        }
                    } else {
                        // tslint:disable-next-line:prefer-for-of
                        for (let i = 0; i < enemies.length; i ++) {
                            if (applyAttack(enemies[i])) break;
                        }
                    }
                }
            },
            onComplete: () => {
                player.locked = false;
                player.attackCooldown = 20;
            },
        } );
        player.locked = true;
    },

    explosion: (player, world) => {
        if (!world.map || !world.map.isGrounded(player)) return;
        player.play("cast", {
            onProgress: (frame) => {
                if (frame === 2) {
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
                            enemy.applyAttack(Math.ceil((100 - dist) / 10 * (Math.random() / 2 + 0.5)),
                                                new PIXI.Point(xkb, ykb));
                        }
                    }
                }
            },
            onComplete: () => {
                player.locked = false;
                player.attackCooldown = 20;
            },
        } );
        player.locked = true;
    },
};

export default attackFunctions;
