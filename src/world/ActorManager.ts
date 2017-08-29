import Actor from "../Actors/Actor";
import Enemy from "../Actors/Enemy";
import Player from "../Actors/Player";
import mergeSort from "../mergeSort";
import Map from "./Map";
import { IMapDataObject } from "./mapData";
import World from "./World";

export default class ActorManager extends PIXI.Container {
    public player: Player;

    public enemies: Enemy[] = [];
    private actorLayer: PIXI.Container;
    private enemyDeletions: number[] = [];

    constructor(private world: World) {
        super();
        this.actorLayer = new PIXI.Container();
        this.addChild(this.actorLayer);

        this.player = new Player(world);
        this.actorLayer.addChild(this.player);
    }

    // align the player with spawn information
    public setPlayerSpawn(entrance: [number, number]) {
        this.player.x = entrance[0] - this.player.size.x / 2;
        this.player.y = entrance[1] - this.player.size.y;
    }

    public loadEnemies(mapDataObject: IMapDataObject) {
        this.enemies = mapDataObject.enemies(this.world);
        for (let enemy of this.enemies) {
            this.actorLayer.addChild(enemy);
        }
    }

    public removeEnemy(enemy: Enemy) {
        let idx = this.enemies.indexOf(enemy);
        if (idx < 0) return;
        this.actorLayer.removeChild(enemy);
        this.enemies.splice(idx, 1);
    }

    public unloadEnemies() {
        for (let enemy of this.enemies) {
            this.actorLayer.removeChild(enemy);
            enemy.destroy({ children: true, texture: false, baseTexture: false });
        }
        this.enemies = [];
    }

    public update(map: Map, getControls: boolean = true) {
        this.player.updateImpulse(map, getControls);
        for (let npa of this.enemies.slice()) {
            if (!this.player.isDead()) {
                npa.updateImpulse(map, this.player);
            } else {
                npa.updateImpulse(map);
            }
        }
        this.enemies = mergeSort(this.enemies, (a, b) => a.horizontalCenter - b.horizontalCenter);
        for (let i = 0; i < this.enemies.length - 1; i ++) {
            let a = this.enemies[i];
            a.repel(this.player);
            for (let j = i + 1; j < this.enemies.length; j ++) {
                let b = this.enemies[j];
                if (!a.repel(b)) {
                    break;
                }
            }
        }
        if (this.enemies.length > 0) this.enemies[this.enemies.length - 1].repel(this.player);

        this.actorLayer.children = mergeSort(this.actorLayer.children, (a: Actor, b: Actor) => (a.bottom - b.bottom) ||
            ((a instanceof Player) ? -1 : (b instanceof Player) ? 1 : 0) );

        this.player.handleCollisions(map.move(this.player));
        for (let enemy of this.enemies) {
            enemy.handleCollisions(map.move(enemy));
        }

        this.player.frameUpdate();
        for (let enemy of this.enemies.slice()) {
            enemy.frameUpdate();
        }
    }
}
