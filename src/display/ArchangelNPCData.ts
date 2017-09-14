import {INPCData} from "../world/mapData";

let textStep = 0;

let textsWithPendant = [
    {
        text: "Hmmm... No it's not your time to die yet.\n\nI can send you back to a safe spot and... wait...",
    },
    {
        text: "Is that a death pendant? Perhaps we\ncould make a deal. I'll resurrect you\nright here, and in exchange you give me\nthat death pendant.​​\n​\nWhat do you say?​​",
        options: [
            "Send me to town",
            "Revive me here (-Death Pendant)",
        ],
    },
];

let defaultTexts = [
    {
        text: "Hmmm... No it's not your time to die yet.\n\nI can send you back to a safe spot and resurrect you. Please be more careful next time.",
    },
];

let texts = defaultTexts;

// tslint:disable-next-line:variable-name
export let ArchangelNPCData = {
    get texture() {
        return PIXI.loader.resources["/images/angel.png"].texture;
    },
    npcData: <INPCData> {
        name: "Archangel",
        image: "images/angel.png",
        position: {
            x: 0,
            y: 0,
        },
        startInteraction: () => {
            textStep = 0;
            // texts = textsWithPendant;
        },
        getText: () => texts[textStep],
        continue: (world, option?: number) => {
            textStep ++;
            if (option === 0 || texts === defaultTexts) {
                world.revivePlayer(true);
            } else if (option === 1) {
                world.revivePlayer(false);
            }
            return textStep < texts.length;
        },
    },
};
