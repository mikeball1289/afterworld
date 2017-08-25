// tslint:disable:no-string-literal

import * as PNG from "png-js";
import ArchangelNPCData from "../display/ArchangelNPCData";
import NPC from "../display/NPC";
import UIManager from "../display/UIManager";
import ParticleSystem from "../particlesystem/ParticleSystem";
import { juggler, soundManager } from "../root";
import ActorManager from "./ActorManager";
import Map from "./Map";
import mapData, { IMapDataObject } from "./mapData";
import WorldItem from "./worldobjects/WorldItem";

type MapName = keyof typeof mapData;
const TRANSITION_SPEED = 0.033;

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
    private grayFilter: PIXI.GrayFilter;

    private virtualPosition = { x: 0, y: 0 };

    // high level sprites
    private worldContainer: PIXI.Container;
    private fadeBlocker: PIXI.Graphics;

    // NPC data
    private npcs: NPC[] = [];
    private npcLayer: PIXI.Container;
    private filterList: PIXI.Filter[] = [];

    private worldItems: WorldItem[] = [];
    private worldObjectLayer: PIXI.Container;

    private foregroundLayer: PIXI.Container;

    constructor(startingMap: MapName, public screenWidth: number, public screenHeight: number) {
        super();

        this.worldContainer = new PIXI.Container();
        this.foregroundLayer = new PIXI.Container();
        this.worldObjectLayer = new PIXI.Container();
        this.npcLayer = new PIXI.Container();
        this.uiManager = new UIManager(this);
        this.particleSystem = new ParticleSystem(this);
        this.actorManager = new ActorManager(this);

        this.addChild(this.worldContainer);

        this.worldContainer.addChild(this.npcLayer);
        this.worldContainer.addChild(this.actorManager);
        this.worldContainer.addChild(this.particleSystem);
        this.worldContainer.addChild(this.worldObjectLayer);
        this.worldContainer.addChild(this.foregroundLayer);
        this.worldContainer.addChild(this.uiManager.worldLayer);

        this.addChild(this.uiManager.overlayLayer);

        this.fadeBlocker = new PIXI.Graphics();
        this.fadeBlocker.beginFill(0);
        this.fadeBlocker.drawRect(0, 0, screenWidth, screenHeight);
        this.fadeBlocker.endFill();
        this.addChild(this.fadeBlocker);

        this.currentMapName = startingMap;
        this.currentMapData = mapData[startingMap];

        this.uiManager.inventoryUI.refreshInventoryIcons();
        this.uiManager.overlayLayer.addChildAt(this.actorManager.player.skillBar, 2);
        this.grayFilter = new PIXI.GrayFilter();

        // load up the starting map
        this.loadMap(this.currentMapData, () => {
            this.actorManager.setPlayerSpawn(this.currentMapData.entrances.default);
            this.positionCamera();
            this.queueMapTransition = undefined;
        } );
    }

    // asyncronously load a map and all its extra data
    public loadMap(mapDataObject: IMapDataObject, done?: () => void) {
        soundManager.playMusic(mapDataObject.bgTrack);
        this.map = undefined;
        let loader = new PIXI.loaders.Loader();
        loader.add("background", mapDataObject.background);
        if (mapDataObject.foreground) loader.add("foreground", mapDataObject.foreground);
        for (let npc of mapDataObject.npcs) {
            loader.add(npc.name, npc.image);
        }
        loader.load( () => {
            let data = new PNG.load("." + mapDataObject.map);
            data.decode( (pixels) => {
                try {
                    let foregroundTexture: PIXI.Texture | undefined = undefined;
                    if (loader.resources["foreground"]) {
                        foregroundTexture = loader.resources["foreground"].texture;
                    }
                    let bgSprite = new PIXI.Sprite(loader.resources["background"].texture);
                    if (mapDataObject.backgroundAccents) for (let child of mapDataObject.backgroundAccents(this)) bgSprite.addChild(child);
                    let fgSprite = new PIXI.Sprite(foregroundTexture);
                    if (mapDataObject.foregroundAccents) for (let child of mapDataObject.foregroundAccents(this)) fgSprite.addChild(child);
                    this.map = new Map(data.width, data.height, pixels, bgSprite, fgSprite);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
                if (!this.map) throw new Error("Map failed to create");
                this.worldContainer.addChildAt(this.map.backgroundSprite, 0);
                if (this.map.foregroundSprite) this.foregroundLayer.addChild(this.map.foregroundSprite);
                for (let npc of mapDataObject.npcs) {
                    let npcSprite = new NPC(loader.resources[npc.name].texture, npc);
                    this.npcs.push(npcSprite);
                    this.npcLayer.addChild(npcSprite);
                }
                this.actorManager.loadEnemies(mapDataObject);
                if (done) done();
            } );
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

    public addWorldItem(item: WorldItem) {
        this.worldItems.push(item);
        this.worldObjectLayer.addChild(item);
    }

    // if the player is eligible for an interaction event begin the interation
    public attemptInteraction() {
        if (this.queueMapTransition) return; // but not if we're in the process of a transition
        if (this.actorManager.player.inventory.hasSpace()) {
            for (let i = 0; i < this.worldItems.length; i ++) {
                let item = this.worldItems[i];
                if (item.withinPickupRange(this.actorManager.player)) {
                    item.pickup(this.actorManager.player);
                    this.worldItems.splice(i, 1);
                    this.actorManager.player.inventory.addItem(item.item);
                    return;
                }
            }
        }
        for (let npc of this.npcs) {
            if (npc.withinTalkingRange(this.actorManager.player)) {
                this.uiManager.displayNPCText(npc);
                return;
            }
        }
    }

    public unloadMap() {
        // clean up previous map objects
        if (!this.map) return;
        this.removeChild(this.map.backgroundSprite);
        if (this.map.foregroundSprite) this.foregroundLayer.removeChild(this.map.foregroundSprite);
        this.map.destroy(true);
        this.map = undefined;
        for (let npc of this.npcs) {
            this.npcLayer.removeChild(npc);
            npc.destroy(true);
        }
        this.npcs = [];
        this.particleSystem.removeAll();
        this.worldObjectLayer.removeChildren();
        this.worldItems = [];

        this.actorManager.unloadEnemies();
    }

    public dieDialogue() {
        let grayscale = 0;
        let fade = () => {
            grayscale += 1 / 60;
            if (grayscale > 1) {
                grayscale = 1;
                this.uiManager.displayNPCText(ArchangelNPCData);
                juggler.remove(fade);
            }
            this.grayFilter.gray = grayscale;
        };
        this.grayFilter.gray = grayscale;
        // this.worldContainer.filters = [filter];
        this.useFilter(this.grayFilter);
        juggler.add(fade);
        this.transitionTimer = 0;
        this.queueMapTransition = undefined;
    }

    public revivePlayer(lastTown = true) {
        if (lastTown) {
            let oef = () => {
                this.transitionTimer += TRANSITION_SPEED;
                if (this.transitionTimer >= 1) {
                    this.mapTransition("map2", true);
                    juggler.remove(oef);
                }
            };
            juggler.add(oef);
        } else {
            this.actorManager.player.setAlive(0.5);
            // this.worldContainer.filters = [];
            this.removeFilter(this.grayFilter);
        }
    }

    public useFilter(filter: PIXI.Filter) {
        if (this.filterList.indexOf(filter) >= 0) return;
        this.filterList.push(filter);
        this.worldContainer.filters = this.filterList;
    }

    public removeFilter(filter: PIXI.Filter) {
        if (!this.filterList) return;
        let idx = this.filterList.indexOf(filter);
        if (idx >= 0) this.filterList.splice(idx, 1);
        this.worldContainer.filters = this.filterList;
    }

    public update() {
        if (!this.map) return;

        this.actorManager.update(this.map, this.queueMapTransition === undefined && !this.uiManager.hasInteractiveUI());
        for (let item of this.worldItems) {
            item.update(this);
        }
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
            let targetY = -this.actorManager.player.y + this.screenHeight * 0.55 - this.actorManager.player.size.y / 2;
            this.virtualPosition.y += (targetY - this.virtualPosition.y) / 15;
            this.virtualPosition.y = Math.min(Math.max(this.virtualPosition.y, -this.map.digitalHeight + this.screenHeight), 0);
        } else {
            this.virtualPosition.y = this.screenHeight / 2 - this.map.digitalHeight / 2;
        }

        if (!this.actorManager.player.isDead()) {
            if (this.queueMapTransition) {
                if (this.transitionTimer >= 1) {
                    this.mapTransition(this.queueMapTransition);
                } else {
                    this.transitionTimer += TRANSITION_SPEED;
                }
            } else {
                if (this.transitionTimer > 0) {
                    this.transitionTimer -= TRANSITION_SPEED;
                }
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
    private mapTransition(mapName: MapName, revivePlayer = false) {
        if (!this.map) return;
        if (this.actorManager.player.isDead()) {
            if (revivePlayer) {
                this.actorManager.player.setAlive(0.5);
                this.removeFilter(this.grayFilter);
            } else {
                this.fadeBlocker.visible = false;
                return;
            }
        }
        let previousMapName = this.currentMapName;
        this.unloadMap();
        // load new map objects
        this.currentMapData = mapData[mapName];
        this.currentMapName = mapName;
        this.loadMap(this.currentMapData, () => {
            if (!revivePlayer && this.currentMapData.entrances[previousMapName]) {
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
