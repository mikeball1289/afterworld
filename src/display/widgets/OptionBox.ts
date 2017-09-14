import {fromTextureCache} from "../../pixiTools";
import {controls, InputType, juggler} from "../../root";

export class OptionBox extends PIXI.Container {
    private background: PIXI.Graphics;
    private selectedOption: number;
    private selectArrow: PIXI.Sprite;
    private numOptions: number;
    private textFields: PIXI.Text[] = [];
    private onSelect?: (option: number) => void;

    constructor() {
        super();
        this.background = new PIXI.Graphics();
        this.selectArrow = new PIXI.Sprite(fromTextureCache("/images/npc_text.png", 0, 250, 15, 15));
        this.selectArrow.x = 5;
        this.addChild(this.background);
        this.addChild(this.selectArrow);
        this.visible = false;
    }

    public open(options: string[], onSelect: (option: number) => void) {
        if (this.isOpen()) return;
        this.numOptions = options.length;
        this.onSelect = onSelect;
        this.selectedOption = 0;

        let maxOptionLength = 1;
        for (let [i, option] of enumerate(options)) {
            let option = options[i];
            let text = new PIXI.Text(option, {
                fontFamily: DEFAULT_FONT,
                fontSize: 18,
            });
            text.x = 22;
            text.y = 5 + 25 * i;
            this.addChild(text);
            this.textFields.push(text);
            maxOptionLength = Math.max(maxOptionLength, text.width);
        }

        this.background.clear();
        this.background.beginFill(0x7B8A96);
        this.background.lineStyle(2, 0x383838);
        this.background.drawRoundedRect(0, 0, maxOptionLength + 42, options.length * 25 + 10, 1);
        this.background.endFill();

        this.setSelect();

        this.visible = true;
        juggler.add(this.update, this);
    }

    public close() {
        this.visible = false;
        juggler.remove(this.update, this);
        for (let text of this.textFields) {
            this.removeChild(text);
        }
        this.textFields = [];
    }

    public isOpen() {
        return this.visible;
    }

    private setSelect() {
        this.selectArrow.y = 8 + this.selectedOption * 25;
    }

    private update() {
        if (controls.hasLeadingEdge(InputType.UP)) {
            if (this.selectedOption > 0) {
                this.selectedOption --;
            } else {
                this.selectedOption = this.numOptions - 1;
            }
            this.setSelect();
        } else if (controls.hasLeadingEdge(InputType.DOWN)) {
            if (this.selectedOption < this.numOptions - 1) {
                this.selectedOption ++;
            } else {
                this.selectedOption = 0;
            }
            this.setSelect();
        } else if (controls.hasLeadingEdge(InputType.CONFIRM)) {
            this.close();
            if (this.onSelect) this.onSelect(this.selectedOption);
        } else if (controls.hasLeadingEdge(InputType.CANCEL)) {
            this.close();
        }
    }
}
