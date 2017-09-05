import QuestStep from "./QuestStep";

export default class Quest {

    private currentStep = 0;

    constructor(public name: string, public steps: QuestStep[]) {
        this.steps[0].setActive(() => this.nextStep());
    }

    public get questStep() {
        return this.steps[Math.min(this.currentStep, this.steps.length - 1)];
    }

    public get progress() {
        return this.currentStep;
    }

    public get isComplete() {
        return this.currentStep === this.steps.length;
    }

    private nextStep() {
        this.currentStep ++;
        if (this.currentStep < this.steps.length) {
            this.steps[this.currentStep].setActive(() => this.nextStep());
        }
    }
}
