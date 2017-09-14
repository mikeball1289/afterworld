import {World} from "../world/World";
import {QuestStep} from "./QuestStep";

export class GenericQuestStep extends QuestStep {

    public static GetStep(tag: string): GenericQuestStep | undefined {
        return GenericQuestStep.STEPS[tag];
    }
    private static STEPS: { [tag: string]: GenericQuestStep } = {};

    public get description() {
        return this.text;
    }

    constructor(world: World, public text: string, public tag: string) {
        super(world);
    }

    protected begin(): void {
        GenericQuestStep.STEPS[this.tag] = this;
    }

}
