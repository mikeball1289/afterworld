import World from "../world/World";

abstract class QuestStep {
    private completed = false;
    private onComplete?: () => void;
    public abstract get description(): string;

    constructor(public world: World) { }

    public complete() {
        if (this.onComplete) {
            this.onComplete();
        }
        this.onComplete = undefined;
        this.completed = true;
    }
    public setActive(onComplete: () => void) {
        this.onComplete = onComplete;
        this.begin();
    }

    protected begin() {
        // pass
    }
}

export default QuestStep;
