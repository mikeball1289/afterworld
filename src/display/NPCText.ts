import { hasInput, InputType } from "../root";
import JuggledSprite from "./JuggledSprite";
import NPC from "./NPC";

export default class NPCText extends JuggledSprite {

    private talkerSprite: PIXI.Sprite;
    private textField: PIXI.Text;
    private nameField: PIXI.Text;

    private promptReady: boolean;
    private showText?: string;
    private progress: number = 0;

    constructor() {
        super(PIXI.loader.resources["/images/npc_text.png"].texture);
        this.talkerSprite = new PIXI.Sprite();
        this.talkerSprite.anchor.set(0.5, 0.5);
        this.talkerSprite.x = 64;
        this.talkerSprite.y = 100;
        this.addChild(this.talkerSprite);

        this.textField = new PIXI.Text("", { wordWrap: true, wordWrapWidth: 450, fontFamily: "SilkscreenNormal", fontSize: 17 } );
        this.textField.x = 136;
        this.textField.y = 15;
        this.addChild(this.textField);

        this.nameField = new PIXI.Text("", { align: "center", wordWrap: true, wordWrapWidth: 128, fontFamily: "SilkscreenNormal", fontSize: 26 } );
        this.nameField.anchor.set(0.5);
        this.nameField.x = 64;
        this.addChild(this.nameField);

        this.visible = false;
    }

    public display(npc: NPC) {
        this.visible = true;
        this.talkerSprite.texture = npc.texture;
        this.showText = npc.npcData.text;
        this.progress = 0;
        this.nameField.text = npc.npcData.name;
        this.nameField.y = 100 + this.talkerSprite.texture.height / 2 + 20;
        this.promptReady = false;
        this.textField.text = "";
    }

    public close() {
        this.visible = false;
        this.talkerSprite.texture = <PIXI.Texture> <any> undefined;
        this.showText = undefined;
    }

    public onEnterFrame() {
        if (!this.showText) return;
        if (this.showText && this.progress < this.showText.length) {
            this.progress += 0.4;
            this.textField.text = this.showText.substr(0, Math.floor(this.progress));
        }
        if (!hasInput(InputType.JUMP)) {
            this.promptReady = true;
        } else {
            if (this.promptReady) {
                this.promptReady = false;
                if (this.progress < this.showText.length) {
                    this.progress = this.showText.length;
                    this.textField.text = this.showText;
                } else {
                    this.close();
                }
            }
        }
    }
}
