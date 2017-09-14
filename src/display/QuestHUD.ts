import {QuestStep} from "../quests/QuestStep";
import {World} from "../world/World";
import {JuggledSprite} from "./JuggledSprite";

let filter = new PIXI.filters.GlowFilter(2, 0.1, 0.1, 0xFFFF00);
const FLASH_TIME = 60;

export class QuestHUD extends JuggledSprite {

    private background: PIXI.Graphics;
    private field: PIXI.Text;
    private flashTimer: number = FLASH_TIME;
    private currentStep?: QuestStep;

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
        let currentQuestStep: QuestStep | undefined = undefined;
        if (quest) {
            currentQuestStep = quest.questStep;
            this.field.text = "<header>" + quest.name + "</header>\n-" + quest.questStep.description;
            this.visible = true;
            let bounds = this.field.getBounds();
            this.background.width = bounds.width;
            this.background.height = bounds.height;
        } else {
            this.field.text = "";
            this.visible = false;
        }
        if (this.currentStep !== currentQuestStep) {
            this.flash();
            this.currentStep = currentQuestStep;
        }
        if (this.flashTimer < FLASH_TIME) {
            let x = (this.flashTimer) / (FLASH_TIME / 2) - 1;
            filter.distance = Math.max((1 - x * x) * 30, 2);
            filter.innerStrength = Math.max((1 - x * x), 0.1);
            filter.outerStrength = Math.max((1 - x * x), 0.1);
            this.flashTimer ++;
            if (this.flashTimer >= FLASH_TIME - 1) {
                this.filters = [];
            }
        }
    }

    public flash() {
        this.flashTimer = 0;
        this.filters = [filter];
    }
}
