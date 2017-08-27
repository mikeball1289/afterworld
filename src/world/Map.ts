// tslint:disable no-bitwise
import Actor from "../actors/Actor";
import { EPSILON } from "./physicalConstants";

interface IPointLike {
    x: number;
    y: number;
}

const IS_SOLID = 0x01; // 00000001
const IS_WALKABLE = 0x02; // 00000010
const IS_POINT_WALKABLE = 0x04; // 00000100
const IS_FEARLESS = 0x08; // 00001000
const IS_WALLED = 0x10; // 00010000
const IS_PASSABLE = 0x20; // 00100000
const IS_DROPPABLE = 0x40; // 01000000

export enum GroundType {
    AIR = IS_DROPPABLE,
    SOLID = IS_SOLID | IS_WALLED | IS_WALKABLE,
    PASSABLE_SOLID = IS_WALKABLE | IS_PASSABLE,
    PASSABLE_RAMP = IS_WALKABLE | IS_PASSABLE,
    DROPPABLE = IS_WALKABLE | IS_PASSABLE | IS_DROPPABLE,
    POINT_PASSABLE = IS_POINT_WALKABLE | IS_DROPPABLE,
    SOLID_NO_FEAR = IS_SOLID | IS_FEARLESS | IS_WALKABLE | IS_WALLED,
    DROPPABLE_NO_FEAR = IS_WALKABLE | IS_FEARLESS | IS_PASSABLE | IS_DROPPABLE,
}

export default class Map {

    public static testLine(start: IPointLike, end: IPointLike, test: (x: number, y: number) => boolean, steps: number = 1) {
        for (let i = 0; i <= steps; i ++) {
            if (test(start.x + (end.x - start.x) * i / steps, start.y + (end.y - start.y) * i / steps)) return true;
        }
        return false;
    }

    public static isSolid(type: GroundType) {
        return (type & IS_SOLID) !== 0;
    }

    public static isWalkable(type: GroundType) {
        return (type & IS_WALKABLE) !== 0;
    }

    public static isPointWalkable(type: GroundType) {
        return (type & IS_POINT_WALKABLE) !== 0;
    }

    public static isFearless(type: GroundType) {
        return (type & IS_FEARLESS) !== 0;
    }

    public static isWalled(type: GroundType) {
        return (type & IS_WALLED) !== 0;
    }

    public static isPassable(type: GroundType) {
        return (type & IS_PASSABLE) !== 0;
    }

    public static isDroppable(type: GroundType) {
        return (type & IS_DROPPABLE) !== 0;
    }

    // public backgroundSprite: PIXI.Sprite;
    // public foregroundSprite: PIXI.Sprite;
    private mapData: Uint8Array;

    get digitalWidth() { return this.mapWidth; }
    get digitalHeight() { return this.mapHeight; }

    constructor(private mapWidth: number, private mapHeight: number, mapDataArray: Buffer, public backgroundSprite: PIXI.Sprite, public foregroundSprite: PIXI.Sprite) {
        this.mapData = new Uint8Array(mapDataArray.length / 4);
        for (let i = 0; i < mapDataArray.length; i += 4) { // packed as RGBA, so bump by 4 each iteration
            if (mapDataArray[i] === 0x00 && mapDataArray[i + 1] === 0x00 && mapDataArray[i + 2] === 0x00) this.mapData[i / 4] = GroundType.SOLID;
            else if (mapDataArray[i] === 0xFF && mapDataArray[i + 1] === 0xFF && mapDataArray[i + 2] === 0xFF) this.mapData[i / 4] = GroundType.AIR;
            else if (mapDataArray[i] === 0xFF && mapDataArray[i + 1] === 0x00 && mapDataArray[i + 2] === 0x00) this.mapData[i / 4] = GroundType.PASSABLE_SOLID;
            else if (mapDataArray[i] === 0x00 && mapDataArray[i + 1] === 0xFF && mapDataArray[i + 2] === 0x00) this.mapData[i / 4] = GroundType.PASSABLE_RAMP;
            else if (mapDataArray[i] === 0xFF && mapDataArray[i + 1] === 0x00 && mapDataArray[i + 2] === 0xDC) this.mapData[i / 4] = GroundType.DROPPABLE;
            else if (mapDataArray[i] === 0xFF && mapDataArray[i + 1] === 0x00 && mapDataArray[i + 2] === 0xFF) this.mapData[i / 4] = GroundType.DROPPABLE;
            else if (mapDataArray[i] === 0xFF && mapDataArray[i + 1] === 0xFF && mapDataArray[i + 2] === 0x00) this.mapData[i / 4] = GroundType.POINT_PASSABLE;
            else if (mapDataArray[i] === 0xAA && mapDataArray[i + 1] === 0xAA && mapDataArray[i + 2] === 0xAA) this.mapData[i / 4] = GroundType.SOLID_NO_FEAR;
            else if (mapDataArray[i] === 0xFF && mapDataArray[i + 1] === 0x88 && mapDataArray[i + 2] === 0x99) this.mapData[i / 4] = GroundType.DROPPABLE_NO_FEAR;
            else throw new Error("Invalid map data at " + ((i / 4) % this.mapWidth) + ", " + Math.floor((i / 4) / this.mapWidth) + " " + mapDataArray[i] + " " + mapDataArray[i + 1] + " " + mapDataArray[i + 2]);
        }
        // this.backgroundSprite = new PIXI.Sprite(backgroundImage);
        // if (foregroundImage) this.foregroundSprite = new PIXI.Sprite(foregroundImage);
    }

    public destroy(options?: boolean | PIXI.IDestroyOptions) {
        this.backgroundSprite.destroy(true);
        if (this.foregroundSprite) this.foregroundSprite.destroy(true);
        this.mapData = new Uint8Array(0); // clear the map data on destruction
    }

    public getPixelData(x: number, y: number) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) return GroundType.SOLID;
        return this.mapData[y * this.mapWidth + x];
    }

    public isGrounded(actor: Actor) {
        if (actor.velocity.y < 0) return false;
        if (!this.actorIsOnWalkableGround(actor)) return false;
        if (this.actorIsOnSolidGround(actor)) return true;
        // if we're inside of a passable solid, then we haven't actually gotten through
        if (this.actorIsInPassable(actor)) return false;
        return true;
    }

    public actorIsOnWalkableGround(actor: Actor, verticalOffset = 0): boolean {
        return Map.testLine({ x: actor.left, y: actor.bottom + verticalOffset }, { x: actor.right - EPSILON, y: actor.bottom + verticalOffset },
                        (x, y) => Map.isWalkable(this.getPixelData(x, y)), 2 ) ||
                Map.isPointWalkable(this.getPixelData(actor.horizontalCenter, actor.bottom + verticalOffset));
    }

    public actorIsOnSolidGround(actor: Actor, verticalOffset = 0): boolean {
        return Map.testLine({ x: actor.left, y: actor.bottom + verticalOffset }, { x: actor.right - EPSILON, y: actor.bottom + verticalOffset },
                        (x, y) => Map.isSolid(this.getPixelData(x, y)), 2 );
    }

    public actorIsInPassable(actor: Actor, offset: number = 0) {
        if (actor.fallthrough !== undefined && Math.abs(actor.y - actor.fallthrough) < 5) return true;
        return Map.isPointWalkable(this.getPixelData(actor.horizontalCenter, actor.bottom - 2 + offset)) ||
                Map.testLine({ x: actor.left, y: actor.bottom - 2 + offset }, { x: actor.right - EPSILON, y: actor.bottom - 2 + offset },
                    (x, y) => Map.isPassable(this.getPixelData(x, y)), actor.right - actor.left);
    }

    // move an actor through the world, returns a pair of booleans representing
    // [horizontal collision occurred, vertical collision occurred]
    public move(actor: Actor): [boolean, boolean] {
        let magnitude = Math.ceil(Math.sqrt(actor.velocity.x * actor.velocity.x + actor.velocity.y * actor.velocity.y));
        let movingX = actor.velocity.x !== 0;
        let movingY = actor.velocity.y !== 0;
        let collisions: [boolean, boolean] = [false, false];
        for (let i = 0; i < magnitude && (movingX || movingY); i ++) {
            if (movingY) {
                actor.position.y += actor.velocity.y / magnitude;
                if (actor.velocity.y < 0) {
                    if (Map.testLine({ x: actor.left, y: actor.top}, { x: actor.right, y: actor.top }, (x, y) => Map.isSolid(this.getPixelData(x, y)))) {
                        movingY = false;
                        collisions[1] = true;
                        actor.position.y = Math.ceil(actor.position.y);
                    }
                } else {
                    // if we're hitting the ground, give 'em the goods
                    // if we're inside of a passable solid, then we haven't actually gotten through
                    if (this.actorIsOnSolidGround(actor, -EPSILON) || (this.actorIsOnWalkableGround(actor, -EPSILON) && !this.actorIsInPassable(actor))) {
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
                        actor.position.x = Math.floor(actor.position.x - EPSILON);
                    }
                }
                if (!movingY) { // we're walking along the ground, detect 1px slopes
                    if (this.actorIsOnWalkableGround(actor, -1) && !this.actorIsInPassable(actor, -1)) {
                        actor.position.y --;
                    } else if (!this.actorIsOnWalkableGround(actor) && this.actorIsOnWalkableGround(actor, 1)) {
                        actor.position.y ++;
                    } else if (!this.actorIsOnWalkableGround(actor) && this.actorIsOnWalkableGround(actor, 2)) {
                        actor.position.y += 2;
                    }
                }
            }
        }
        return collisions;
    }
}
