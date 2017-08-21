import Player from "../actors/Player";
import World from "../world/World";
import Cost from "./costs/Cost";
import { WeaponType } from "./items/WeaponItem";
import { ISkillFunction } from "./skillFunctions";

export default class Skill {

    private _icon: PIXI.Texture;
    constructor(private iconFn: () => PIXI.Texture,
                public skillFn: ISkillFunction,
                public costs: Cost[],
                public weaponTypes: WeaponType[] | "any",
                public cooldown: number,
                public name: string,
                public description: string,
                public gcd = true) { }

    public playerCanCast(player: Player, world: World) {
        if (!player.inventory.equipment.weapon || (this.weaponTypes !== "any" && this.weaponTypes.indexOf(player.inventory.equipment.weapon.weaponType) < 0)) return false;
        for (let cost of this.costs) {
            if (!cost.playerCanPay(player)) return false;
        }
        return true;
    }

    public get icon() {
        if (!this._icon) this._icon = this.iconFn();
        return this._icon;
    }

    public cast(player: Player, world: World) {
        if (this.skillFn(player, world)) {
            for (let cost of this.costs) {
                cost.payCost(player);
            }
            return true;
        }
        return false;
    }

    public getName() {
        return this.name;
    }

    public getDescription(includeName = false) {
        let des = includeName ? (this.name + " ") : "";
        des += "(" + Math.round(this.cooldown / 60) + " sec";
        if (this.costs.length > 0) {
            des += ", " + this.costs.map( (cost) => cost.costAmout + " " + cost.costType ).join(", ") + ")\n";
        } else {
            des += ")\n";
        }
        des += this.description;
        return des;
    }
}
