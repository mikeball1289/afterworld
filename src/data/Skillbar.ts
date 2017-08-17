import Player from "../actors/Player";
import ClockSpindown from "../display/widgets/ClockSpindown";
import World from "../world/World";
import Skill from "./Skill";
import skillData from "./skillData";

export const NUM_SKILLS = 6;
const iconPositions: [number, number][] = [[613, 6], [665, 6], [375, 6], [427, 6], [479, 6], [531, 6]];

export default class Skillbar extends PIXI.Container {
    private skills: Skill[] = [];
    private equippedSkills: (Skill | undefined)[] = [];
    private skillIcons: (PIXI.Sprite)[] = [];
    private cooldownSpinners: ClockSpindown[] = [];
    private skillLayer: PIXI.Container;
    private spindownLayer: PIXI.Container;
    private skillCooldowns: number[] = new Array(NUM_SKILLS).fill(0);
    private globalCooldown: number = 0;

    constructor(private player: Player, private world: World) {
        super();

        this.skillLayer = new PIXI.Container();
        this.addChild(this.skillLayer);
        this.spindownLayer = new PIXI.Container();
        this.addChild(this.spindownLayer);

        for (let position of iconPositions) {
            let icon = new PIXI.Sprite();
            icon.x = position[0];
            icon.y = position[1];
            this.skillLayer.addChild(icon);
            this.skillIcons.push(icon);

            let spinner = new ClockSpindown(23);
            spinner.x = position[0] + 25;
            spinner.y = position[1] + 25;
            spinner.alpha = 0.8;
            this.spindownLayer.addChild(spinner);
            this.cooldownSpinners.push(spinner);
        }

        this.skills[0] = skillData.basic_attack;
        this.equippedSkills[0] = skillData.basic_attack;
        this.skillIcons[0].texture = skillData.basic_attack.icon;
    }

    public addSkill(skill: Skill, primary = false) {
        if (!primary) {
            this.skills.push(skill);
            for (let i = 0; i < NUM_SKILLS; i ++) {
                if (this.equippedSkills[i] === undefined) {
                    this.equippedSkills[i] = skill;
                    this.skillIcons[i].texture = skill.icon;
                    return;
                }
            }
        } else {
            this.skills[0] = skill;
            this.equippedSkills[0] = skill;
            this.skillIcons[0].texture = skill.icon;
        }
    }

    public removeSkill(skill: Skill) {
        let idx = this.skills.indexOf(skill);
        if (idx < 0) return;
        let slotIdx = this.equippedSkills.indexOf(skill);
        // TODO:
        // if (idx === 0) {
            // 
        // }
    }

    public useSkill(index: number) {
        let skill = this.equippedSkills[index];
        if (!skill) return false;
        if (this.skillCooldowns[index] > 0) return false;
        if (skill.gcd && this.globalCooldown > 0) return false;
        if (!skill.playerCanCast(this.player, this.world)) return false;
        if (skill.cast(this.player, this.world)) {
            this.skillCooldowns[index] = skill.cooldown;
            if (skill.gcd) this.globalCooldown = this.player.stats.globalCooldown;
            return true;
        } else {
            return false;
        }
    }

    public update() {
        this.globalCooldown --;
        for (let i = 0; i < NUM_SKILLS; i ++) {
            let skill = this.equippedSkills[i];
            if (!skill) {
                this.cooldownSpinners[i].visible = false;
                continue;
            }

            if (skill.playerCanCast(this.player, this.world)) {
                this.skillIcons[i].tint = 0xFFFFFF;
            } else {
                this.skillIcons[i].tint = 0x888888;
            }

            if (this.skillCooldowns[i] > 0) {
                this.skillCooldowns[i] --;
            }
            if (skill.gcd && this.globalCooldown > 0 && this.globalCooldown > this.skillCooldowns[i]) {
                this.cooldownSpinners[i].visible = true;
                this.cooldownSpinners[i].setProgress(this.globalCooldown / this.player.stats.globalCooldown);
            } else if (this.skillCooldowns[i] > 0) {
                this.cooldownSpinners[i].visible = true;
                this.cooldownSpinners[i].setProgress(this.skillCooldowns[i] / skill.cooldown);
            } else {
                this.cooldownSpinners[i].visible = false;
            }
        }
    }
}
