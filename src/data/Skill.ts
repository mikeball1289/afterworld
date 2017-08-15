import Player from "../actors/Player";
import World from "../world/World";
import { ISkillFunction } from "./skillFunctions";
import { WeaponType } from "./WeaponItem";

export default class Skill {

    public cooldownTimer = 0;
    constructor(public skillFn: ISkillFunction, private weaponTypes: WeaponType[], public cooldown: number) { }

}
