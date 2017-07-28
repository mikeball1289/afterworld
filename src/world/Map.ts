import Actor from "../actors/Actor";
import { EPSILON } from "./physicalConstants";

interface PointLike {
    x: number;
    y: number;
}

export enum GroundType {
    AIR,
    SOLID,
    PASSABLE_SOLID,
    PASSABLE_RAMP,
}

export default class Map extends PIXI.Sprite {

    private mapData: GroundType[] = [];
    private mapWidth: number = 0;
    private mapHeight: number = 0;

    get digitalWidth() { return this.mapWidth; }
    get digitalHeight() { return this.mapHeight; }

    constructor(mapTexture: PIXI.Texture) {
        super(mapTexture);
        let mapDataTex = mapTexture;
        let canvas = document.createElement("canvas");
        this.mapWidth = canvas.width = mapDataTex.width;
        this.mapHeight = canvas.height = mapDataTex.height;
        let ctx = canvas.getContext("2d");
        if (!ctx || !mapDataTex.baseTexture.source) throw new Error("Failed to generate map data");
        ctx.drawImage(mapDataTex.baseTexture.source, 0, 0);
        let data = ctx.getImageData(0, 0, mapDataTex.width, mapDataTex.height);
        for (let i = 0; i < data.data.length; i += 4) { // packed as RGBA, so bump by 4 each iteration
            if (data.data[i] === 0x00 && data.data[i + 1] === 0x00 && data.data[i + 2] === 0x00) this.mapData.push(GroundType.SOLID);
            else if (data.data[i] === 0xFF && data.data[i + 1] === 0xFF && data.data[i + 2] === 0xFF) this.mapData.push(GroundType.AIR);
            else if (data.data[i] === 0xFF && data.data[i + 1] === 0x00 && data.data[i + 2] === 0x00) this.mapData.push(GroundType.PASSABLE_SOLID);
            else if (data.data[i] === 0x00 && data.data[i + 1] === 0xFF && data.data[i + 2] === 0x00) this.mapData.push(GroundType.PASSABLE_RAMP);
            else throw new Error("Invalid map data at " + ((i / 4) % this.mapWidth) + ", " + Math.floor(i / 4 / this.mapWidth));
        }
    }

    getPixelData(x: number, y: number) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) return GroundType.SOLID;
        return this.mapData[y * this.mapWidth + x];
    }

    isGrounded(actor: Actor) {
        if (actor.velocity.y < 0) return false;
        let onWalkableGround = Map.testLine({ x: actor.left, y: actor.bottom }, { x: actor.right - EPSILON, y: actor.bottom  },
            (x, y) => Map.isWalkable(this.getPixelData(x, y)), 2);
        if (!onWalkableGround) return false;
        let onSolidGround = Map.testLine({ x: actor.left, y: actor.bottom }, { x: actor.right - EPSILON, y: actor.bottom  },
            (x, y) => Map.isSolid(this.getPixelData(x, y)), 2);
        if (onSolidGround) return true;
        let passingThroughPassable = Map.testLine({ x: actor.left, y: actor.bottom - 2 }, { x: actor.right - EPSILON, y: actor.bottom - 2 }, // if we're inside of a passable solid, then we haven't actually gotten through
            (x, y) => Map.isPassable(this.getPixelData(x, y)), actor.right - actor.left);
        if (passingThroughPassable) return false;
        return true;
    }
    
    // move an actor through the world, returns a pair of booleans representing
    // [horizontal collision occurred, vertical collision occurred]
    move(actor: Actor): [boolean, boolean] {
        let magnitude = Math.ceil(Math.sqrt(actor.velocity.x * actor.velocity.x + actor.velocity.y * actor.velocity.y));
        let movingX = actor.velocity.x !== 0;
        let movingY = actor.velocity.y !== 0;
        let collisions: [boolean, boolean] = [false, false];
        for (let i = 0; i < magnitude && (movingX || movingY); i ++) {
            if (movingY) {
                actor.position.y += actor.velocity.y / magnitude;
                if (actor.velocity.y < 0) {
                    // iunno
                } else {
                    // if we're hitting the ground, give 'em the goods
                    if (Map.testLine({ x: actor.left, y: actor.bottom - EPSILON }, { x: actor.right - EPSILON, y: actor.bottom - EPSILON },
                        (x, y) => Map.isWalkable(this.getPixelData(x, y)), 2 ) &&
                        // if we're inside of a passable solid, then we haven't actually gotten through
                        !Map.testLine({ x: actor.left, y: actor.bottom - 2 }, { x: actor.right - EPSILON, y: actor.bottom - 2 },
                        (x, y) => Map.isPassable(this.getPixelData(x, y)), actor.right - actor.left))
                    {
                        movingY = false;
                        collisions[1] = true;
                        actor.position.y = Math.floor(actor.position.y - EPSILON);
                    }
                }
            }
            if (movingX) {
                actor.position.x += actor.velocity.x / magnitude;
                if (actor.velocity.x < 0) {
                    if (Map.testLine({ x: actor.left, y: actor.top }, { x: actor.left, y: actor.bottom - 1 - EPSILON },
                        (x, y) => Map.isWalled(this.getPixelData(x, y)) ))
                    {
                        movingX = false;
                        collisions[0] = true;
                        actor.position.x = Math.ceil(actor.position.x);
                    }
                } else {
                    if (Map.testLine({ x: actor.right - EPSILON, y: actor.top }, { x: actor.right - EPSILON, y: actor.bottom - 1 - EPSILON },
                        (x, y) => Map.isWalled(this.getPixelData(x, y)) ))
                    {
                        movingX = false;
                        collisions[0] = true;
                        actor.position.x = Math.floor(actor.position.x);
                    }
                }
                if (!movingY) { // we're walking along the ground, detect 1px slopes
                    if (Map.testLine({ x: actor.left, y: actor.bottom - 1 }, { x: actor.right - EPSILON, y: actor.bottom - 1 },
                        (x, y) => Map.isWalkable(this.getPixelData(x, y)), 2 ))
                    {
                        actor.position.y --;
                    } else if (!Map.testLine({ x: actor.left, y: actor.bottom }, { x: actor.right - EPSILON, y: actor.bottom },
                                (x, y) => Map.isWalkable(this.getPixelData(x, y)), 2) &&
                                Map.testLine({ x: actor.left, y: actor.bottom + 1 }, { x: actor.right - EPSILON, y: actor.bottom + 1 },
                                (x, y) => Map.isWalkable(this.getPixelData(x, y)), 2))
                    {
                        actor.position.y ++;
                    }
                }
            }
        }
        return collisions;
    }

    static testLine(start: PointLike, end: PointLike, test: (x: number, y: number) => boolean, steps: number = 1) {
        for (let i = 0; i <= steps; i ++) {
            if (test(start.x + (end.x - start.x) * i / steps, start.y + (end.y - start.y) * i / steps)) return true;
        }
        return false;
    }

    static isSolid(type: GroundType) {
        return type === GroundType.SOLID;
    }

    static isWalkable(type: GroundType) {
        return type === GroundType.SOLID || type === GroundType.PASSABLE_SOLID || type === GroundType.PASSABLE_RAMP;
    }
    
    static isWalled(type: GroundType) {
        return type === GroundType.SOLID;
    }

    static isPassable(type: GroundType) {
        return type === GroundType.PASSABLE_SOLID || type === GroundType.PASSABLE_RAMP;
    }
} 