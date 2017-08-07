import NPC from "../display/NPC";
import NPCText from "../display/NPCText";
import UIManager from "../display/UIManager";
import ParticleSystem from "../particlesystem/ParticleSystem";
import ActorManager from "./ActorManager";
import Map from "./Map";
import mapData, { IMapDataObject } from "./mapData";

type MapName = keyof typeof mapData;

// contain the info for the game world, this doesn't include UI
export default class World extends PIXI.Sprite {

    // map and transition data
    public map?: Map;
    public transitionTimer = 1;

    public actorManager: ActorManager;
    public particleSystem: ParticleSystem;
    public uiManager: UIManager;

    private currentMapData: IMapDataObject;
    private currentMapName: MapName;
    private queueMapTransition?: keyof typeof mapData;

    private virtualPosition = { x: 0, y: 0 };

    // high level sprites
    private worldContainer: PIXI.Container;
    private fadeBlocker: PIXI.Graphics;

    // NPC data
    private npcs: NPC[] = [];
    private npcText: NPCText;
    private npcLayer: PIXI.Container;

    constructor(startingMap: MapName, public screenWidth: number, public screenHeight: number) {
        super();

        this.worldContainer = new PIXI.Container();
        this.npcLayer = new PIXI.Container();
        this.uiManager = new UIManager();
        this.npcText = new NPCText();
        this.particleSystem = new ParticleSystem(this);
        this.actorManager = new ActorManager(this);

        this.addChild(this.worldContainer);

        this.npcText.pivot.set(this.npcText.width / 2, this.npcText.height / 2);
        this.npcText.position.set(screenWidth / 2, screenHeight / 2);
        this.addChild(this.npcText);

        this.worldContainer.addChild(this.npcLayer);
        this.worldContainer.addChild(this.actorManager);
        this.worldContainer.addChild(this.particleSystem);
        this.worldContainer.addChild(this.uiManager.worldLayer);

        this.addChild(this.uiManager.overlayLayer);

        this.fadeBlocker = new PIXI.Graphics();
        this.fadeBlocker.beginFill(0);
        this.fadeBlocker.drawRect(0, 0, screenWidth, screenHeight);
        this.fadeBlocker.endFill();
        this.addChild(this.fadeBlocker);

        this.currentMapName = startingMap;
        this.currentMapData = mapData[startingMap];

        // load up the starting map
        this.loadMap(this.currentMapData, () => {
            this.actorManager.setPlayerSpawn(this.currentMapData.entrances.default);
            this.positionCamera();
            this.queueMapTransition = undefined;
        } );
    }

    // asyncronously load a map and all its extra data
    public loadMap(mapDataObject: IMapDataObject, done?: () => void) {
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
            } catch (e) {
                console.log(e);
                throw e;
            }
            if (!this.map) throw new Error("Map failed to create");
            this.worldContainer.addChildAt(this.map.backgroundSprite, 0);
            for (let npc of mapDataObject.npcs) {
                let npcSprite = new NPC(loader.resources[npc.name].texture, npc);
                this.npcs.push(npcSprite);
                this.npcLayer.addChild(npcSprite);
            }
            this.actorManager.loadEnemies(mapDataObject);
            if (done) done();
        } );
    }

    // lock camera position to player if the map is large enough, and the map if it's too small
    public positionCamera() {
        if (!this.map) return;
        if (this.map.digitalWidth > this.screenWidth) {
            this.virtualPosition.x = -this.actorManager.player.x + this.screenWidth / 2 - this.actorManager.player.size.x / 2;
        } else {
            this.virtualPosition.x = this.screenWidth / 2 - this.map.digitalWidth / 2;
        }
        if (this.map.digitalHeight > this.screenHeight) {
            this.virtualPosition.y = -this.actorManager.player.y + this.screenHeight / 2 - this.actorManager.player.size.y / 2;
        } else {
            this.virtualPosition.y = this.screenHeight / 2 - this.map.digitalHeight / 2;
        }
    }

    // if the player is eligible for a map transition, queue that transition
    public attemptMapTransition() {
        if (this.queueMapTransition) return;
        for (let exitName in this.currentMapData.exits) {
            if (!this.currentMapData.exits.hasOwnProperty(exitName)) continue;
            let exit = this.currentMapData.exits[exitName];
            if (exit[0] > this.actorManager.player.left && exit[0] < this.actorManager.player.right &&
                exit[1] > this.actorManager.player.top && exit[1] < this.actorManager.player.bottom)
            {
                this.queueMapTransition = <keyof typeof mapData> exitName;
            }
        }
    }

    // if the player is eligible for an interaction event begin the interation
    public attemptInteraction() {
        if (this.queueMapTransition) return; // but not if we're in the process of a transition
        for (let npc of this.npcs) {
            if (npc.withinTalkingRange(this.actorManager.player)) {
                this.npcText.display(npc);
                break;
            }
        }
    }

    public unloadMap() {
        // clean up previous map objects
        if (!this.map) return;
        this.removeChild(this.map.backgroundSprite);
        this.map.destroy(true);
        this.map = undefined;
        for (let npc of this.npcs) {
            this.npcLayer.removeChild(npc);
            npc.destroy(true);
        }
        this.npcs = [];

        this.actorManager.unloadEnemies();
    }

    public update() {
        if (!this.map) return;

        this.actorManager.update(this.map, this.queueMapTransition === undefined && !this.npcText.visible);
        this.particleSystem.update();

        let foundInteractable = false;
        for (let npc of this.npcs) {
            if (npc.withinTalkingRange(this.actorManager.player) && !foundInteractable) {
                npc.setInteractablePrompt(true);
                foundInteractable = true;
            } else {
                npc.setInteractablePrompt(false);
            }
        }

        // camera control
        if (this.map.digitalWidth > this.screenWidth) {
            let targetX = -this.actorManager.player.x + this.screenWidth / 2 - this.actorManager.player.size.x / 2;
            this.virtualPosition.x += (targetX - this.virtualPosition.x) / 15;
            this.virtualPosition.x = Math.min(Math.max(this.virtualPosition.x, -this.map.digitalWidth + this.screenWidth), 0);
        } else {
            this.virtualPosition.x = this.screenWidth / 2 - this.map.digitalWidth / 2;
        }
        if (this.map.digitalHeight > this.screenHeight) {
            let targetY = -this.actorManager.player.y + this.screenHeight / 2 - this.actorManager.player.size.y / 2;
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

    // perform an instantaneous map transition
    private mapTransition(mapName: MapName) {
        if (!this.map) return;
        let previousMapName = this.currentMapName;
        this.unloadMap();
        // load new map objects
        this.currentMapData = mapData[mapName];
        this.currentMapName = mapName;
        this.loadMap(this.currentMapData, () => {
            if (this.currentMapData.entrances[previousMapName]) {
                // try to set player spawn to the entrance for the previous map
                this.actorManager.setPlayerSpawn(this.currentMapData.entrances[previousMapName]);
            } else {
                // if you can't, use the default spawn instead
                this.actorManager.setPlayerSpawn(this.currentMapData.entrances.default);
            }
            this.positionCamera();
            this.queueMapTransition = undefined;
        } );
        this.currentMapName = mapName;
    }

}
