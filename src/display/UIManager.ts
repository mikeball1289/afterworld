export default class UIManager {

    public static NUM_WORLD_LAYERS = 2;

    public worldLayer: PIXI.Container;
    public overlayLayer: PIXI.Container;

    public worldLayers: PIXI.Container[] = [];

    constructor() {
        this.worldLayer = new PIXI.Container();
        this.overlayLayer = new PIXI.Container();

        for (let i = 0; i < UIManager.NUM_WORLD_LAYERS; i ++) {
            this.worldLayers[i] = new PIXI.Container();
            this.worldLayer.addChild(this.worldLayers[i]);
        }
    }

}
