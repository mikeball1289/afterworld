import PlayerCharacter from "../Actors/PlayerCharacter";
import Enemy from "../Actors/Enemy";
import { MapDataObject } from "./mapData";
import World from "./World";
import Map from "./Map";
import Actor from "../Actors/Actor";
import mergeSort from "../mergeSort";

export default class ActorManager extends PIXI.Container {
    public player: PlayerCharacter;

    private actorLayer: PIXI.Container;
    public enemies: Enemy[] = [];

    constructor(private world: World) {
        super();
        this.actorLayer = new PIXI.Container();
        this.addChild(this.actorLayer);
        
        this.player = new PlayerCharacter(world);
        this.actorLayer.addChild(this.player);
    }

    // align the player with spawn information
    setPlayerSpawn(entrance: [number, number]) {
        this.player.x = entrance[0] - this.player.size.x / 2;
        this.player.y = entrance[1] - this.player.size.y;
    }

    loadEnemies(mapDataObject: MapDataObject) {
        this.enemies = mapDataObject.enemies(this.world);
        for (let enemy of this.enemies) {
            this.actorLayer.addChild(enemy);
        }
    }

    removeEnemy(enemy: Enemy) {
        let idx = this.enemies.indexOf(enemy);
        if (idx < 0) return;
        this.actorLayer.removeChild(enemy);
        this.enemies.splice(idx, 1);
    }
    
    unloadEnemies() {
        for (let enemy of this.enemies) {
            this.actorLayer.removeChild(enemy);
            enemy.destroy({ children: true, texture: false, baseTexture: false });
        }
        this.enemies = [];
    }

    update(map: Map, getControls: boolean = true) {
        this.player.updateImpulse(map, getControls);
        for (let npa of this.enemies) {
            npa.updateImpulse(map, this.player);
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
            ((a instanceof PlayerCharacter) ? -1 : (b instanceof PlayerCharacter) ? 1 : 0) );

        this.player.handleCollisions(map.move(this.player));
        for (let npa of this.enemies) {
            npa.handleCollisions(map.move(npa));
        }
    }
}