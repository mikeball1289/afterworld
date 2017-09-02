import { fromTextureCache } from "../pixiTools";
import Cost from "./costs/Cost";
import Skill from "./Skill";
import * as sf from "./skillFunctions";
import * as sf2 from "./skillFunctions2";

function icon(x: number, y: number) {
    return () => fromTextureCache("/images/skill_icons.png", x * 50, y * 50, 50, 50);
}

const FPS = 60;

export let basicAttack = new Skill(icon(0, 0), sf.basicAttack, [], "any", 0, "Basic Attack", "Swing your weapon to deal <or>100%</or> physical damage.");
export let cleave = new Skill(icon(1, 0), sf.cleave, [new Cost("energy", 3)], ["heavy"], 0, "Cleave", "Deal <or>150%</or> physical damage to the first enemy hit and <or>100%</or> physical damage to up to 2 other enemies.");
export let leap = new Skill(icon(3, 0), sf.leap, [new Cost("energy", 20)], "any", 5, "Leap", "Launch yourself into the air twice as high as you normally jump", false);
export let envenom = new Skill(icon(2, 0), sf.envenom, [new Cost("energy", 15)], "any", 15, "Envenom", "Coat your weapon in poison causing the next 3 enemies attacked to be poisoned for <or>100%</or> <darkGreen>poison</darkGreen> damage over 4 seconds.", false);
export let tremor = new Skill(icon(4, 0), sf.tremor, [new Cost("energy", 15)], ["heavy", "magic"], 20, "Tremor", "Emit a shockwave that stuns enemies within 2 yards for 2 seconds.");
export let buckleDown = new Skill(icon(5, 0), sf.buckleDown, [new Cost("energy", 25)], "any", 12, "Buckle Down", "Brace yourself against incoming attacks for 4 seconds, ignoring knockbacks and reducing damage by 50%.", false);
export let explosion = new Skill(icon(7, 0), sf.explosion, [new Cost("energy", 30)], ["heavy", "magic"], 2, "Explosion", "Summon a fiery explosion around yourself, knocking back nearby enemies and dealing up to <cyan>180%</cyan> <red>fire</red> damage to enemies close to you.");
export let staticBolts = new Skill(icon(8, 0), sf.staticBolt, [new Cost("energy", 5)], ["magic"], 0, "Static Bolts", "Launch two balls of electricity that travel erratically and deal <cyan>120%</cyan> <blue>electric</blue> damage to the first enemy hit.");
export let sentinelFlames = new Skill(icon(9, 0), sf2.sentinelFlames, [new Cost("energy", 20)], ["magic"], 10, "Sentinel Flames", "Surround yourself with 3 orbitting flames that explode for <cyan>140%</cyan> <red>fire</red> damage when they hit an enemy.");
