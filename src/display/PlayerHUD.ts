export default class PlayerHUD extends PIXI.Container {
    private hpBar: PIXI.Sprite;
    private epBar: PIXI.Sprite;

    private hpText: PIXI.Text;
    private epText: PIXI.Text;

    constructor() {
        super();
        let uiTextures = PIXI.loader.resources["/images/hud.png"].texture.baseTexture;
        let hudBackground = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(0, 0, 309, 65)));
        this.addChild(hudBackground);
        let skillBarImage = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(375, 6, 340, 73)));
        skillBarImage.x = 375;
        skillBarImage.y = 516;
        this.addChild(skillBarImage);
        this.hpBar = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(0, 137, 300, 30)));
        this.hpBar.x = 7;
        this.hpBar.y = 7;
        this.addChild(this.hpBar);
        this.epBar = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(0, 167, 200, 20)));
        this.epBar.x = 7;
        this.epBar.y = 43;
        this.addChild(this.epBar);

        this.hpText = new PIXI.Text("99999 / 99999 HP", {
            align: "right",
            fontFamily: DEFAULT_FONT,
            fontSize: 30,
            fill: 0xEDEDED,
            stroke: 0x383838,
            strokeThickness: 2,
        });
        this.hpText.anchor.set(1, 0);
        this.hpText.x = 300;
        this.hpText.y = 5;
        this.addChild(this.hpText);

        let smallOpts = {
            align: "right",
            fontFamily: DEFAULT_FONT,
            fontSize: 20.5,
            fill: 0xEDEDED,
            stroke: 0x383838,
            strokeThickness: 2,
        };
        this.epText = new PIXI.Text("999 / 999 EP", smallOpts);
        this.epText.anchor.set(1, 0);
        this.epText.x = 207;
        this.epText.y = 40;
        this.addChild(this.epText);
    }

    public setHP(val: number, max: number) {
        this.hpBar.scale.x = val / max;
        this.hpText.text = val + " / " + max + " HP";
    }

    public setEP(val: number, max: number) {
        this.epBar.scale.x = val / max;
        this.epText.text = val + " / " + max + " EP";
    }
}
