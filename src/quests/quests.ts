import Ghost from "../actors/enemies/Ghost";
import PassiveGhost from "../actors/enemies/PassiveGhost";
import GenericQuestStep from "../quests/GenericQuestStep";
import KillQuestStep from "../quests/KillQuestStep";
import Quest from "../quests/Quest";
import World from "../world/World";

export function InitializeQuests(world: World) {
    let quests: Quest[] = [];
    let quest = new Quest("The Woodsman's Request", [
        new GenericQuestStep(world, "Speak to the Woodsman.", "The Woodsman's Request 1"),
        new KillQuestStep(world, PassiveGhost.PRETTY_NAME, 1),
        new GenericQuestStep(world, "Speak to the Woodsman.", "The Woodsman's Request 3"),
        new KillQuestStep(world, Ghost.PRETTY_NAME, 5),
        new GenericQuestStep(world, "Speak to the Woodsman.", "The Woodsman's Request 5"),
    ] );
    quests.push(quest);
    return quests;
}
