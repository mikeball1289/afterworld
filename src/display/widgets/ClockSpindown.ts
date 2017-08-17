const RT2 = Math.sqrt(2);

export default class ClockSpindown extends PIXI.Container {

    private graphic: PIXI.Graphics;
    private largeRadius: number;

    constructor(private smallRadius: number) {
        super();
        this.largeRadius = this.smallRadius * RT2;
        this.graphic = new PIXI.Graphics();
        this.addChild(this.graphic);
    }

    public setProgress(amount: number) {
        let angle = Math.PI * 2 * (1 - amount);
        let breakX = Math.sin(angle) * RT2;
        let breakY = Math.cos(angle) * RT2;
        if (breakX > 1) {
            let ratio = 1 / breakX;
            breakX *= ratio;
            breakY *= ratio;
        } else if (breakX < -1) {
            let ratio = -1 / breakX;
            breakX *= ratio;
            breakY *= ratio;
        } else if (breakY > 1) {
            let ratio = 1 / breakY;
            breakX *= ratio;
            breakY *= ratio;
        } else if (breakY < -1) {
            let ratio = -1 / breakY;
            breakX *= ratio;
            breakY *= ratio;
        }
        breakX *= this.smallRadius;
        breakY *= this.smallRadius;
        this.graphic.clear();
        this.graphic.beginFill(0x666666);
        this.graphic.moveTo(0, 0);
        this.graphic.lineTo(breakX, -breakY);
        if (amount > 7 / 8) this.graphic.lineTo(this.smallRadius, -this.smallRadius);
        if (amount > 5 / 8) this.graphic.lineTo(this.smallRadius, this.smallRadius);
        if (amount > 3 / 8) this.graphic.lineTo(-this.smallRadius, this.smallRadius);
        if (amount > 1 / 8) this.graphic.lineTo(-this.smallRadius, -this.smallRadius);
        this.graphic.lineTo(0, -this.smallRadius);
        this.graphic.lineTo(0, 0);
        this.graphic.endFill();
    }
}
