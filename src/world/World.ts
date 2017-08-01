import Skelly from "../actors/Skelly";
import mapData, {MapDataObject} from "./mapData";
import PlayerCharacter from "../actors/PlayerCharacter";
import Map from "./Map";
import NPC from "../display/NPC";
import NPCText from "../display/NPCText";
import Actor from "../actors/Actor";
import NonPlayerActor from "../actors/NonPlayerActor";
import mergeSort from "../mergeSort";
import { repulsionForce } from "./physicalConstants";

type MapName = keyof typeof mapData;

// contain the info for the game world, this doesn't include UI
export default class World extends PIXI.Sprite {
    
    public player: PlayerCharacter;
    
    // map and transition data
    public map?: Map;
    private currentMapData: MapDataObject;
    private currentMapName: MapName;
    private queueMapTransition?: keyof typeof mapData;
    public transitionTimer = 1;
    
    // layers
    private actorLayer: PIXI.Container;
    // private playerLayer: PIXI.Container;
    
    private virtualPosition = { x: 0, y: 0 };

    // high level sprites
    private worldContainer: PIXI.Container;
    private fadeBlocker: PIXI.Graphics;

    // NPC data
    private npcs: NPC[] = [];
    private npcText: NPCText;

    // NPA (non-player actor) data
    private npas: NonPlayerActor[] = [];

    constructor(startingMap: MapName, public screenWidth: number, public screenHeight: number) {
        super();
        // setup containers and UI
        this.worldContainer = new PIXI.Container();
        this.addChild(this.worldContainer);

        this.npcText = new NPCText();
        this.npcText.pivot.set(this.npcText.width / 2, this.npcText.height / 2);
        this.npcText.position.set(screenWidth / 2, screenHeight / 2);
        this.addChild(this.npcText);

        this.fadeBlocker = new PIXI.Graphics();
        this.fadeBlocker.beginFill(0);
        this.fadeBlocker.drawRect(0, 0, screenWidth, screenHeight);
        this.fadeBlocker.endFill();
        this.addChild(this.fadeBlocker);

        this.actorLayer = new PIXI.Container();
        this.worldContainer.addChild(this.actorLayer);
        // this.playerLayer = new PIXI.Container();
        // this.worldContainer.addChild(this.playerLayer);
        this.currentMapName = startingMap;
        this.currentMapData = mapData[startingMap];

        this.player = new PlayerCharacter(this);
        this.setPlayerSpawn(this.currentMapData.entrances.default);
        this.actorLayer.addChild(this.player);
        // this.playerLayer.addChild(this.player);

        // load up the starting map
        this.loadMap(this.currentMapData, () => {
            this.positionCamera();
            this.queueMapTransition = undefined;

            for (let i = 0; i < 5; i ++) {
                let skelly = new Skelly(this);
                skelly.x = 500 + Math.random() * 400;
                skelly.y = 1123 - skelly.size.y;
                this.npas.push(skelly);
                this.actorLayer.addChild(skelly);
            }
        } );
    }

    // align the player with spawn information
    setPlayerSpawn(entrance: [number, number]) {
        this.player.x = entrance[0] - this.player.size.x / 2;
        this.player.y = entrance[1] - this.player.size.y;
    }

    // asyncronously load a map and all its extra data
    loadMap(mapDataObject: MapDataObject, done?: () => void) {
        this.map = undefined;
        let loader = new PIXI.loaders.Loader();
        loader.add("map", mapDataObject.map)
              .add("background", mapDataObject.background);
        for (let npc of mapDataObject.npcs) {
            loader.add(npc.name, npc.image);
        }
        loader.load( () => {
            try {
                this.map = new Map(loader.resources.map.texture, loader.resources.background.texture);
            } catch(e) {
                console.log(e);
                throw e;
            }
            if (!this.map) throw new Error("Map failed to create");
            this.worldContainer.addChildAt(this.map.backgroundSprite, 0);
            for (let npc of mapDataObject.npcs) {
                let npcSprite = new NPC(loader.resources[npc.name].texture, npc);
                this.npcs.push(npcSprite);
                this.actorLayer.addChild(npcSprite);
            }
            if (done) done();
        } );
    }

    // lock camera position to player if the map is large enough, and the map if it's too small
    positionCamera() {
        if (!this.map) return;
        if (this.map.digitalWidth > this.screenWidth) {
            this.virtualPosition.x = -this.player.x + this.screenWidth / 2 - this.player.size.x / 2;
        } else {
            this.virtualPosition.x = this.screenWidth / 2 - this.map.digitalWidth / 2;
        }
        if (this.map.digitalHeight > this.screenHeight) {
            this.virtualPosition.y = -this.player.y + this.screenHeight / 2 - this.player.size.y / 2;
        } else {
            this.virtualPosition.y = this.screenHeight / 2 - this.map.digitalHeight / 2;
        }
    }

    // if the player is eligible for a map transition, queue that transition
    attemptMapTransition() {
        if (this.queueMapTransition) return;
        for (let exitName in this.currentMapData.exits) {
            let exit = this.currentMapData.exits[exitName];
            if (exit[0] > this.player.left && exit[0] < this.player.right && exit[1] > this.player.top && exit[1] < this.player.bottom) {
                this.queueMapTransition = <keyof typeof mapData> exitName;
            }
        }
    }

    // if the player is eligible for an interaction event begin the interation
    attemptInteraction() {
        if (this.queueMapTransition) return; // but not if we're in the process of a transition
        for (let npc of this.npcs) {
            if (npc.withinTalkingRange(this.player)) {
                this.npcText.display(npc);
                break;
            }
        }
    }

    // perform an instantaneous map transition
    mapTransition(mapName: MapName) {
        // TODO: Handle NPAs
        if (!this.map) return;
        let previousMapName = this.currentMapName;
        
        // clean up previous map objects
        this.removeChild(this.map.backgroundSprite);
        this.map.destroy(true);
        for (let npc of this.npcs) {
            this.actorLayer.removeChild(npc);
            npc.destroy(true);
        }
        this.npcs = [];

        // load new map objects
        this.currentMapData = mapData[mapName];
        this.currentMapName = mapName;
        this.loadMap(this.currentMapData, () => {
            this.positionCamera();
            this.queueMapTransition = undefined;
        } );
        try {
            // try to set player spawn to the entrance for the previous map
            this.setPlayerSpawn(this.currentMapData.entrances[previousMapName]);
        } catch(e) {
            // if you can't, use the default spawn instead
            this.setPlayerSpawn(this.currentMapData.entrances.default);
        }
        this.currentMapName = mapName;
    }

    update() {
        if (!this.map) return;
        this.player.updateImpulse(this.map, this.queueMapTransition === undefined && !this.npcText.visible);
        for (let npa of this.npas) {
            npa.updateImpulse(this.map, this.player);
        }
        // this.npas.sort( (a, b) => a.horizontalCenter - b.horizontalCenter );
        this.npas = mergeSort(this.npas, (a, b) => a.horizontalCenter - b.horizontalCenter);
        for (let i = 0; i < this.npas.length - 1; i ++) {
            let a = this.npas[i];
            for (let j = i + 1; j < this.npas.length; j ++) {
                let b = this.npas[j];
                if (a.left <= b.right && a.right >= b.left) {
                    if (Math.abs(a.bottom - b.bottom) < 15) {
                        let dist = a.horizontalCenter - b.horizontalCenter;
                        let force = repulsionForce(dist);
                        if (dist < 0) {
                            a.velocity.x -= force;
                            b.velocity.x += force;
                        } else {
                            a.velocity.x += force;
                            b.velocity.x -= force;
                        }
                    }
                } else {
                    break;
                }
            }
        }

        // this.actorLayer.children.sort( (a: Actor, b: Actor) => a.bottom - b.bottom );
        this.actorLayer.children = mergeSort(this.actorLayer.children, (a: Actor, b: Actor) => a.bottom - b.bottom);

        this.player.handleCollisions(this.map.move(this.player));
        for (let npa of this.npas) {
            npa.handleCollisions(this.map.move(npa));
        }

        let foundInteractable = false;
        for (let npc of this.npcs) {
            if (npc.withinTalkingRange(this.player) && !foundInteractable) {
                npc.setInteractablePrompt(true);
                foundInteractable = true;
            } else {
                npc.setInteractablePrompt(false);
            }
        }

        // camera control
        if (this.map.digitalWidth > this.screenWidth) {
            let targetX = -this.player.x + this.screenWidth / 2 - this.player.size.x / 2;
            this.virtualPosition.x += (targetX - this.virtualPosition.x) / 15;
            this.virtualPosition.x = Math.min(Math.max(this.virtualPosition.x, -this.map.digitalWidth + this.screenWidth), 0);
        } else {
            this.virtualPosition.x = this.screenWidth / 2 - this.map.digitalWidth / 2;
        }
        if (this.map.digitalHeight > this.screenHeight) {
            let targetY = -this.player.y + this.screenHeight / 2 - this.player.size.y / 2;
            this.virtualPosition.y += (targetY - this.virtualPosition.y) / 15;
            this.virtualPosition.y = Math.min(Math.max(this.virtualPosition.y, -this.map.digitalHeight + this.screenHeight), 0);
        } else {
            this.virtualPosition.y = this.screenHeight / 2 - this.map.digitalHeight / 2;
        }

        if (this.queueMapTransition) {
            if (this.transitionTimer >= 1) {
                this.mapTransition(this.queueMapTransition);
            } else {
                this.transitionTimer += 0.033;
            }
        } else {
            if (this.transitionTimer > 0) {
                this.transitionTimer -= 0.033;
            }
        }

        this.worldContainer.x = Math.floor(this.virtualPosition.x);
        this.worldContainer.y = Math.floor(this.virtualPosition.y);

        if (this.transitionTimer <= 0) {
            this.fadeBlocker.visible = false;
        } else {
            this.fadeBlocker.visible = true;
            this.fadeBlocker.alpha = this.transitionTimer;
        }
    }
}