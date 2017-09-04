import World from "../world/World";
import JuggledSprite from "./JuggledSprite";

export default class QuestHUD extends JuggledSprite {

    private background: PIXI.Graphics;
    private field: PIXI.Text;

    constructor(public world: World) {
        super();

        this.background = new PIXI.Graphics();
        this.background.beginFill(0x959595, 0.5);
        this.background.drawRect(0, 0, 1, 1);
        this.background.endFill();
        this.background.pivot.set(1, 0);
        this.addChild(this.background);

        this.field = new MultiStyleText("", {
            default: {
                fontFamily: DEFAULT_FONT,
                fontSize: 18,
                wordWrap: true,
                wordWrapWidth: 400,
                align: "right",
            },
            header: {
                fontSize: 24,
                fill: 0x383838,
            },
        } );
        this.field.anchor.set(1, 0);
        this.addChild(this.field);
    }

    public onEnterFrame() {
        let quest = this.world.questManager.activeQuest;
        if (quest) {
            this.field.text = "<header>" + quest.name + "</header>\n-" + quest.questStep.description;
            this.visible = true;
            let bounds = this.field.getBounds();
            this.background.width = bounds.width;
            this.background.height = bounds.height;
        } else {
            this.field.text = "";
            this.visible = false;
        }
    }
}
