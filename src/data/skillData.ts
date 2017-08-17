import { fromTextureCache } from "../pixiTools";
import Cost from "./costs/Cost";
import Skill from "./Skill";
import * as sf from "./skillFunctions";

function icon(x: number, y: number) {
    return () => fromTextureCache("/images/skill_icons.png", x * 50, y * 50, 50, 50);
}

const FPS = 60;

let skills = {
    basic_attack: new Skill(icon(0, 0), sf.basicAttack, [], "any", 0),
    cleave: new Skill(icon(1, 0), sf.cleave, [new Cost("energy", 5)], ["heavy"], 0),
    leap: new Skill(icon(3, 0), sf.leap, [new Cost("energy", 20)], "any", 5 * FPS, false),
    envenom: new Skill(icon(2, 0), sf.envenom, [new Cost("mana", 15)], ["light"], 15 * FPS, false),
    tremor: new Skill(icon(4, 0), sf.tremor, [new Cost("mana", 15)], ["heavy", "magic"], 20 * FPS),
    buckle_down: new Skill(icon(5, 0), sf.buckleDown, [new Cost("mana", 25)], "any", 12 * FPS, false),
};

export default skills;
