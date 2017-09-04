import Enemy from "../actors/Enemy";
import World from "../world/World";
import QuestStep from "./QuestStep";

export default class KillQuestStep extends QuestStep {

    public currentKilled: number = 0;
    private listener?: (enemy: Enemy) => void;

    public get description() {
        return `Kill ${this.amount} ${this.enemyType + (this.amount === 1 ? "" : "s")}:\xa0${this.currentKilled}\xa0/\xa0${this.amount}`;
    }

    constructor(world: World, public enemyType: string, public amount: number) {
        super(world);
    }

    public complete() {
        super.complete();
        if (this.listener) {
            this.world.removeListener("enemyDied", this.listener);
        }
    }

    public setActive(onComplete: () => void): void {
        super.setActive(onComplete);
        if (!this.listener) {
            this.world.addListener("enemyDied", this.listener = (enemy: Enemy) => {
                if (enemy.enemyName === this.enemyType) {
                    this.currentKilled ++;
                    if (this.currentKilled === this.amount) {
                        this.complete();
                    }
                }
            } );
        }
    }

}
