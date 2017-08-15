export default class PlayerHUD extends PIXI.Container {
    private hpBar: PIXI.Sprite;
    private epBar: PIXI.Sprite;
    private mpBar: PIXI.Sprite;

    private hpText: PIXI.Text;
    private epText: PIXI.Text;
    private mpText: PIXI.Text;

    constructor() {
        super();
        let uiTextures = PIXI.loader.resources["/images/hud.png"].texture.baseTexture;
        let hudBackground = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(0, 0, 716, 91)));
        this.addChild(hudBackground);
        this.hpBar = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(0, 137, 300, 30)));
        this.hpBar.x = 7;
        this.hpBar.y = 7;
        this.addChild(this.hpBar);
        this.epBar = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(0, 167, 200, 20)));
        this.epBar.x = 7;
        this.epBar.y = 43;
        this.addChild(this.epBar);
        this.mpBar = new PIXI.Sprite(new PIXI.Texture(uiTextures, new PIXI.Rectangle(0, 187, 200, 20)));
        this.mpBar.x = 7;
        this.mpBar.y = 69;
        this.addChild(this.mpBar);

        this.hpText = new PIXI.Text("99999 / 99999 HP", {
            align: "right",
            fontFamily: "SilkScreenNormal",
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
            fontFamily: "SilkScreenNormal",
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

        this.mpText = new PIXI.Text("999 / 999 MP", smallOpts);
        this.mpText.anchor.set(1, 0);
        this.mpText.x = 207;
        this.mpText.y = 66;
        this.addChild(this.mpText);
    }

    public setHP(val: number, max: number) {
        this.hpBar.scale.x = val / max;
        this.hpText.text = val + " / " + max + " HP";
    }

    public setEP(val: number, max: number) {
        this.epBar.scale.x = val / max;
        this.epText.text = val + " / " + max + " EP";
    }

    public setMP(val: number, max: number) {
        this.mpBar.scale.x = val / max;
        this.mpText.text = val + " / " + max + " MP";
    }
}
