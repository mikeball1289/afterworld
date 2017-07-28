import mapData, {MapDataObject} from "./mapData";
import PlayerCharacter, {PlayerEvents} from "../actors/PlayerCharacter";
import Map from "./Map";

type MapName = keyof typeof mapData;

// contain the info for the game world, this doesn't include UI
export default class World extends PIXI.Sprite {
    public player: PlayerCharacter;
    public map: Map;
    private currentMapData: MapDataObject;
    private currentMapName: MapName;

    constructor(startingMap: MapName) {
        super();
        this.currentMapName = startingMap;
        this.currentMapData = mapData[startingMap];
        try {
            this.map = new Map(PIXI.loader.resources[this.currentMapData.map].texture);
        } catch(e) {
            console.log(e);
            throw e;
        }
        this.addChild(this.map);

        this.player = new PlayerCharacter(this);
        this.player.x = this.currentMapData.entrances.default[0];
        this.player.y = this.currentMapData.entrances.default[1];
        this.addChild(this.player);
    }

    attemptMapTransition(player: PlayerCharacter) {
        for (let exitName in this.currentMapData.exits) {
            let exit = this.currentMapData.exits[exitName];
            if (exit[0] > player.left && exit[0] < player.right && exit[1] > player.top && exit[1] < player.bottom) {

            }
        }
    }

    mapTransition(mapName: MapName) {
        let previousMapName = this.currentMapName;
        this.removeChild(this.map);
        this.map.destroy(true);
        this.currentMapData = mapData[mapName];
        this.currentMapName = mapName;
        try {
            this.map = new Map(PIXI.loader.resources[this.currentMapData.map].texture);
        } catch(e) {
            console.log(e);
            throw e;
        }
        this.addChildAt(this.map, 0);
        try {
            this.player.x = this.currentMapData.entrances[previousMapName][0];
            this.player.y = this.currentMapData.entrances[previousMapName][1];
        } catch(e) {
            this.player.x = this.currentMapData.entrances.default[0];
            this.player.y = this.currentMapData.entrances.default[1];
        }
        this.currentMapName = mapName;
    }
}