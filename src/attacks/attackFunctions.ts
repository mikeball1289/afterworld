import Enemy from "../actors/Enemy";
import PlayerCharacter from "../actors/PlayerCharacter";
import World from "../world/World";

export interface IAttackFunction {
    (player: PlayerCharacter, world: World): void;
}

interface AttackFunction {
    basicAttack: IAttackFunction;
}

let attackFunctions: AttackFunction = {
    basicAttack: (player, world) => {
        let attackBox: PIXI.Rectangle = new PIXI.Rectangle(player.horizontalCenter, player.top + player.size.y * 0.4, 75, 25);
        let enemies = world.actorManager.enemies;

        let applyAttack = (enemy: Enemy): boolean => {
            if (enemy.left < attackBox.right && enemy.right > attackBox.left && enemy.top < attackBox.bottom && enemy.bottom > attackBox.top) {
                return enemy.applyAttack(Math.random() * 3 + 1000000, new PIXI.Point(4 * player.direction, 0));
            }
            return false;
        }

        if (player.direction === -1) {
            attackBox.x -= attackBox.width;
            for (let i = enemies.length - 1; i >= 0; i --) {
                if (applyAttack(enemies[i])) break;
            }
        } else {
            for (let i = 0; i < enemies.length; i ++) {
                if (applyAttack(enemies[i])) break;
            }
        }
    }
};

export default attackFunctions;