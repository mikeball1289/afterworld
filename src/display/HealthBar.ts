export default class HealthBar extends PIXI.Container {

    private background: PIXI.Graphics;
    private bar: PIXI.Sprite;

    constructor(private size = 30, color = 0xFF0000) {
        super();
        this.background = new PIXI.Graphics();
        this.background.beginFill(0);
        this.background.drawRect(-1, -1, size + 2, 7);
        this.background.endFill();

        this.bar = new PIXI.Sprite(PIXI.loader.resources["/images/health_bar.png"].texture);
        this.bar.width = size;
        this.bar.tint = color;

        this.addChild(this.background);
        this.addChild(this.bar);

        this.pivot.set(size / 2, 5);
    }

    public setAmount(amount: number) {
        this.bar.scale.x = this.size / 30 * amount;
    }
}
