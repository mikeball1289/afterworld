import PlayerCharacter from "../actors/PlayerCharacter";
import Map from "./Map";

// contain the info for the game world, this doesn't include UI
export default class World extends PIXI.Sprite {
    public player: PlayerCharacter;
    public map: Map;

    constructor() {
        super();
        try {
            this.map = new Map(PIXI.loader.resources["/images/map.png"].texture);
        } catch(e) {
            console.log(e);
            throw e;
        }
        this.addChild(this.map);

        this.player = new PlayerCharacter();
        this.player.x = 100;
        this.player.y = 50;
        this.addChild(this.player);
    }
}