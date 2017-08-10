import { controls, InputType } from "../root";
import { soundManager } from "../root";
import { INPCData } from "../world/mapData";
import World from "../world/World";
import JuggledSprite from "./JuggledSprite";
import NPC from "./NPC";

export interface INPCLike {
    texture: PIXI.Texture;
    npcData: INPCData;
}

export default class NPCText extends JuggledSprite {

    private talkerSprite: PIXI.Sprite;
    private textField: PIXI.Text;
    private nameField: PIXI.Text;

    private showText?: string;
    private progress: number = 0;
    private options?: string[];
    private npcData?: INPCData;
    private selectedOption?: number;
    private optionFields: PIXI.Text[] = [];
    private optionsSelectArrow: PIXI.Sprite;

    constructor(private world: World) {
        super(new PIXI.Texture(PIXI.loader.resources["/images/npc_text.png"].texture.baseTexture, new PIXI.Rectangle(0, 0, 600, 250)));

        this.optionsSelectArrow = new PIXI.Sprite(new PIXI.Texture(PIXI.loader.resources["/images/npc_text.png"].texture.baseTexture, new PIXI.Rectangle(0, 250, 15, 15)));
        this.addChild(this.optionsSelectArrow);
        this.optionsSelectArrow.visible = false;

        this.talkerSprite = new PIXI.Sprite();
        this.talkerSprite.anchor.set(0.5, 0.5);
        this.talkerSprite.x = 64;
        this.talkerSprite.y = 125;
        this.addChild(this.talkerSprite);

        this.textField = new PIXI.Text("", { wordWrap: true, wordWrapWidth: 450, fontFamily: "SilkscreenNormal", fontSize: 17 } );
        this.textField.x = 136;
        this.textField.y = 45;
        this.addChild(this.textField);

        this.nameField = new PIXI.Text("", { wordWrap: true, wordWrapWidth: 450, fontFamily: "SilkscreenNormal", fontSize: 26 } );
        this.nameField.x = 136;
        this.nameField.y = 6;
        this.addChild(this.nameField);

        this.visible = false;
    }

    public display(npc: NPC | INPCLike) {
        this.visible = true;
        this.npcData = npc.npcData;
        this.talkerSprite.texture = npc.texture;
        if (this.npcData.startInteraction) this.npcData.startInteraction(this.world);
        this.startText();
    }

    public close() {
        this.visible = false;
        this.talkerSprite.texture = <PIXI.Texture> <any> undefined;
        this.showText = undefined;
    }

    public isOpen() {
        return this.visible;
    }

    public showAll() {
        if (!this.showText) return;
        this.progress = this.showText.length;
        this.textField.text = this.showText;
        if (this.options) {
            // do the option stuff
            this.selectedOption = 0;
            for (let i = 0; i < this.options.length; i ++) {
                let option = this.options[i];
                let text = new PIXI.Text(option, { fontFamily: "SilkscreenNormal", fontSize: 17 } );
                text.x = 166;
                text.y = this.textField.y + this.textField.height + 5 + i * 20;
                this.addChild(text);
                this.optionFields.push(text);
            }
            this.highlightOption(0);
        } else {
            this.selectedOption = undefined;
        }
    }

    public highlightOption(num: number) {
        if (!this.options) return;
        if (num < 0) num = 0;
        if (num >= this.options.length) num = this.options.length - 1;
        this.optionsSelectArrow.visible = true;
        this.optionsSelectArrow.x = 138;
        this.optionsSelectArrow.y = this.textField.y + this.textField.height + 8 + num * 20;
    }

    public onEnterFrame() {
        if (!this.showText) return;
        if (this.showText && this.progress < this.showText.length) {
            let oldProgress = this.progress;
            let lastChar = this.showText.charAt(Math.floor(this.progress) - 1);
            if ([".", "?", "!", "​"].indexOf(lastChar) >= 0) { // the last one is a zero-width space, so you can put delays wherever you want
                this.progress += 0.05;
            } else {
                this.progress += 0.4;
            }
            // don't beep for 0-width spaces
            if (lastChar !== "​" && Math.floor(this.progress) !== Math.floor(oldProgress)) soundManager.playSound("/sounds/talk_beep.ogg", 0.2);
            this.textField.text = this.showText.substr(0, Math.floor(this.progress));
            if (this.progress >= this.showText.length) this.showAll();
        }

        if (this.options && this.selectedOption !== undefined && (controls.hasLeadingEdge(InputType.UP) || controls.hasLeadingEdge(InputType.DOWN))) {
            if (controls.hasLeadingEdge(InputType.UP) && this.selectedOption > 0) this.selectedOption --;
            else if (controls.hasLeadingEdge(InputType.DOWN) && this.selectedOption < this.options.length - 1) this.selectedOption ++;
            soundManager.playSound("/sounds/talk_beep.ogg", 0.5);
            this.highlightOption(this.selectedOption);
        }

        if (controls.hasLeadingEdge(InputType.JUMP)) {
            if (this.progress < this.showText.length) {
                this.showAll();
            } else {
                if (this.npcData && this.npcData.continue && this.npcData.continue(this.world, this.selectedOption)) {
                    this.startText();
                } else {
                    this.close();
                }
            }
        }
    }

    private startText() {
        for (let field of this.optionFields) {
            this.removeChild(field);
            field.destroy(true);
        }
        this.optionFields = [];
        this.optionsSelectArrow.visible = false;
        if (!this.npcData) return this.close();
        let { text, options } = this.npcData.getText(this.world);
        this.showText = text;
        this.options = options;
        this.progress = 0;
        this.nameField.text = this.npcData.name;
        this.textField.text = "";
    }
}
