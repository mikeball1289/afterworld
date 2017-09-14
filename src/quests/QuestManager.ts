import {Quest} from "./Quest";

export class QuestManager {
    public activeQuest?: Quest;
    private questMap: { [name: string]: Quest } = {};

    public getQuestByName(name: string, throws: true): Quest
    public getQuestByName(name: string, throws?: false): Quest | undefined
    public getQuestByName(name: string, throws = false): Quest | undefined {
        let q = this.questMap[name];
        if (throws && !q) throw new Error("Quest \"" + name + "\" doesn't exist.");
        return q;
    }

    public activate(quest: Quest) {
        this.activeQuest = quest;
    }

    public complete(quest: Quest) {
        if (this.activeQuest === quest) {
            this.activeQuest = undefined;
        }
    }

    public add(quest: Quest) {
        this.questMap[quest.name] = quest;
    }
}
