import { fromTextureCache } from "../pixiTools";
import Cost from "./costs/Cost";
import Skill from "./Skill";
import * as sf from "./skillFunctions";

function icon(x: number, y: number) {
    return () => fromTextureCache("/images/skill_icons.png", x * 50, y * 50, 50, 50);
}

const FPS = 60;

let skills = {
    basic_attack: new Skill(icon(0, 0), sf.basicAttack, [], "any", 0, "Basic Attack", "Swing your weapon to deal <or>100%</or> physical damage."),
    cleave: new Skill(icon(1, 0), sf.cleave, [new Cost("energy", 5)], ["heavy"], 0, "Cleave", "Deal <or>150%</or> physical damage to the first enemy hit and <or>100%</or> physical damage to up to 2 other enemies."),
    leap: new Skill(icon(3, 0), sf.leap, [new Cost("energy", 20)], "any", 5 * FPS, "Leap", "Launch yourself into the air twice as high as you normally jump", false),
    envenom: new Skill(icon(2, 0), sf.envenom, [new Cost("energy", 15)], "any", 15 * FPS, "Envenom", "Coat your weapon in poison causing the next 3 enemies attacked to be poisoned for <or>100%</or> physical damage over 4 seconds.", false),
    tremor: new Skill(icon(4, 0), sf.tremor, [new Cost("energy", 15)], ["heavy", "magic"], 20 * FPS, "Tremor", "Emit a shockwave that stuns enemies within 2 yards for 2 seconds."),
    buckle_down: new Skill(icon(5, 0), sf.buckleDown, [new Cost("energy", 25)], "any", 12 * FPS, "Buckle Down", "Brace yourself against incoming attacks for 4 seconds, ignoring knockbacks and reducing damage by 50%.", false),
};

export default skills;
