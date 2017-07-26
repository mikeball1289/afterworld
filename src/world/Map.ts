export enum GroundType {
    AIR,
    SOLID
}

export default class Map extends PIXI.Sprite {

    private mapData: GroundType[] = [];
    private mapWidth: number = 0;
    private mapHeight: number = 0;

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
        for (let i = 0; i < data.data.length; i ++ ) {
            if (data.data[i] === 0) this.mapData.push(GroundType.SOLID);
            else if (data.data[i] === 255) this.mapData.push(GroundType.AIR);
            else this.mapData.push(GroundType.AIR);
        }
    }

    getPixelData(x: number, y: number) {
        if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) throw new Error("Map data index out of bounds");
        return y * this.mapWidth + x; 
    }
}