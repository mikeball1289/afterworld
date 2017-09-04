import World from "../../world/World";
import { IConversationPiece, IOption, ITextPack } from "../ConversationalNPC";
import * as ItemFactory from "../items/ItemFactory";
import WeaponItem from "../items/WeaponItem";
import * as skillData from "../skillData";

let gotDev = false;

let devOptions: IOption[] = [
    {
        optionText: "That would be great!",
        next: (world) => {
            return {
                text: [
                    () => {
                        world.actorManager.player.inventory.addItems([
                        ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe).fillStats(1, {
                            physicalDamage: 3,
                        } ),
                        ItemFactory.constructItem("weapon", ItemFactory.itemData.heros_sword).fillStats(10, {
                            physicalDamage: 25,
                            magicDamage: 15,
                            strength: 5,
                            intelligence: 5,
                            agility: 5,
                            health: 15,
                        } ).prefix("Virtuous"),
                        ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe).fillStats(1, {
                            physicalDamage: 3,
                        } ).addInscription(skillData.cleave).prefix("Heavy"),
                        ItemFactory.constructItem("equip", ItemFactory.itemData.wooden_buckler).fillStats(2, {
                            armor: 4,
                            health: 5,
                        } ),
                        ItemFactory.constructItem("weapon", ItemFactory.itemData.iron_dagger).fillStats(3, {
                            physicalDamage: 5,
                            agility: 2,
                            walkSpeed: 1,
                        } ).postfix("of the Wind"),
                        ItemFactory.constructItem("equip", ItemFactory.itemData.cloth_shirt).addSocket().fillStats(1, {
                            armor: 3,
                        } ),
                        ItemFactory.constructItem("equip", ItemFactory.itemData.leather_pants).addSocket(ItemFactory.constructItem("gem", ItemFactory.itemData.leap_gem)).fillStats(1, {
                            armor: 2,
                        } ),
                        ItemFactory.constructItem("equip", ItemFactory.itemData.leather_boots).addSocket(ItemFactory.constructItem("gem", ItemFactory.itemData.tremor_gem)).fillStats(1, {
                            armor: 1,
                        } ),
                        ItemFactory.constructItem("equip", ItemFactory.itemData.wooden_buckler).addSocket().fillStats(3, {
                            armor: 7,
                            health: 6,
                            strength: 2,
                        } ).prefix("Hardy"),
                        ItemFactory.constructItem("equip", ItemFactory.itemData.wooden_buckler).addSocket().fillStats(3, {
                            armor: 7,
                            health: 7,
                            healthRegen: 0.1,
                        } ).postfix("of the Bear"),
                        ItemFactory.constructItem("gem", ItemFactory.itemData.envenom_gem),
                        ItemFactory.constructItem("gem", ItemFactory.itemData.buckle_down_gem),
                        ItemFactory.constructItem("gem", ItemFactory.itemData.explosion_gem),
                        ItemFactory.constructItem("gem", ItemFactory.itemData.sentinel_flame_gem),
                        ItemFactory.constructItem("equip", ItemFactory.itemData.bead_bracelet).fillStats(2, {
                            energyRegen: 0.1,
                            energy: 3,
                        } ).prefix("Energetic").addSocket(),
                        ItemFactory.constructItem("weapon", ItemFactory.itemData.gnarled_staff).fillStats(1, {
                            magicDamage: 3,
                            intelligence: 1,
                        } ).addInscription(skillData.staticBolts).prefix("Crackling"),
                        ItemFactory.constructItem("weapon", ItemFactory.itemData.gnarled_staff).fillStats(1, {
                            magicDamage: 3,
                            intelligence: 1,
                        } ).addInscription(skillData.sentinelFlames).prefix("Blazing")]);

                        gotDev = true;
                        return "There you go, those are all of the dev items, have fun!";
                    },
                ],
            };
        },
    },
    {
        optionText: "Not now.",
        next: (world) => {
            return {
                text: [
                    () => "Oh you wanna play the game without cheating, the way it was intended to be played? Ok, I suppose I can understand that.",
                    () => "If you change your mind about those items just come back and talk to me again. They aren't going anywhere.",
                ],
            };
        },
    },
];

export let talk: IConversationPiece = (world) => {
    let quest = world.questManager.getQuestByName("The Woodsman's Request", true);
    if (quest.progress === 0) {
        return {
            text: [
                () => "Hey what are you doing all the way out here? It's not safe to be travelling the woods alone. The forest spirits have been restless lately.",
                () => "You don't even have a weapon. Here I'll give you one of my woodchopping axes.",
                () => {
                    world.actorManager.player.inventory.addItem(ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe).fillStats(1, {
                        physicalDamage: 3,
                    } ));
                    quest.questStep.complete();
                    return "There you go. Press SELECT to open your inventory and equip it. Usually the spirits will leave you alone if you give them a good smack. There's a spirit just over there, go hit it with that axe until it goes away.";
                },
            ],
        };
    } else if (quest.progress === 1) {
        // if (world.actorManager.enemies.length > 0) {
        return {
            text: [
                () => "That spirit just to the right of us. Go smack it up until it goes back to the spirit world. Press SELECT to open your inventory and use the axe I gave you.",
            ],
        };
        // }
    } else if (quest.progress === 2) {
        return {
            text: [
                () => "Hey that was pretty good! I just remembered I know a rune I can inscribe on that axe, it will make the axe heavier and sharper, letting you hit more things at once and for more damage.",
                () => {
                    // let item = world.actorManager.player.inventory.findItem(ItemFactory.itemData.woodchopping_axe.id);
                    let inventory = world.actorManager.player.inventory;
                    let reequip = false;
                    let newAxe = false;
                    if (inventory.equipment.weapon && inventory.equipment.weapon.id === ItemFactory.itemData.woodchopping_axe.id) {
                        inventory.unequip("weapon");
                        reequip = true;
                    }
                    let item = inventory.findItem(ItemFactory.itemData.woodchopping_axe.id!);
                    if (!item) {
                        item = ItemFactory.constructItem("weapon", ItemFactory.itemData.woodchopping_axe).fillStats(1, {
                            physicalDamage: 3,
                        } );
                        inventory.addItem(item);
                        newAxe = true;
                    }
                    if (item && WeaponItem.isWeaponItem(item)) {
                        item.addInscription(skillData.cleave);
                        if (reequip) inventory.equipItem(item);
                    }
                    quest.questStep.complete();
                    if (newAxe) {
                        return "You seem to have lost your axe so I gave you a new one with the inscription. Try not to lose this one, it would be disasterous to get caught out here without a weapon.";
                    } else {
                        return "There you go, now you can cleave with your axe.";
                    }
                },
                () => "On my way into the forest today I passed some spirits that tried to attack me, just east of here. This is the first time I've ever seen the spirits so restless.",
                () => "Could you head east to the crossroads and send a handful of those vengeful spirits back to the spirit world? Come back here once you're done with that.",
            ],
            // options: devOptions,
        };
    } else if (quest.progress === 3) {
        return {
            text: [
                () => "On my way into the forest today I passed some spirits that tried to attack me, just east of here. This is the first time I've ever seen the spirits so restless.",
                () => "Could you head east to the crossroads and send a handful of those vengeful spirits back to the spirit world? Come back here once you're done with that.",
            ],
        };
    } else if (quest.progress === 4) {
        return {
            text: [
                () => {
                    quest.questStep.complete();
                    return "Hey kid, you're a natural! There's been a bunch of paranormal activity around here lately, I bet if you kept on fighing whatever dark forces have been stirring it up you could really make a difference.";
                },
                () => "I have a bunch of dev items I've found in my days of wandering these woods. If you want you can have them, there are some things that should make fighting in these woods a breeze. What do you say?",
            ],
            options: devOptions,
        };
    } else if (quest.isComplete && !gotDev) {
        return {
            text: [
                () => "Oh, you're back. Did you change your mind about those dev items?",
            ],
            options: devOptions,
        };
    } else {
        return {
            text: [
                () => "What, you want more from me? That's pretty much all I had... if I give you any more I won't be able to make it home.",
            ],
        };
    }
};
