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
            else throw new Error("Invalid map data");
        }
    }

    getPixelData(x: number, y: number) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) return GroundType.SOLID;
        return this.mapData[y * this.mapWidth + x];
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
    
    static isPassableRamp(type: GroundType) {
        return type === GroundType.PASSABLE_RAMP;
    }
} 