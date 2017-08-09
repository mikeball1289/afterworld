import Enemy from "../actors/Enemy";
import PlayerCharacter from "../actors/PlayerCharacter";
import { soundManager } from "../root";
import World from "../world/World";

export interface IAttackFunction {
    (player: PlayerCharacter, world: World): void;
}

interface IAttackFunctions {
    basicAttack: IAttackFunction;
}

const swishes = ["/sounds/swish1.ogg", "/sounds/swish2.ogg", "/sounds/swish3.ogg"];

let attackFunctions: IAttackFunctions = {
    basicAttack: (player, world) => {
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
    },
};

export default attackFunctions;
