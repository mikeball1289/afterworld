import Player from "../actors/Player";
import ClockSpindown from "../display/widgets/ClockSpindown";
import World from "../world/World";
import Skill from "./Skill";

export const NUM_SKILLS = 6;
const iconPositions: [number, number][] = [[613, 539], [665, 539], [375, 539], [427, 539], [479, 539], [531, 539]];

export default class Skillbar extends PIXI.Container {
    public equippedSkills: (Skill | undefined)[] = [];
    private skills: Skill[] = [];
    private skillIcons: (PIXI.Sprite)[] = [];
    private cooldownSpinners: ClockSpindown[] = [];
    private cooldownNumbers: PIXI.Text[] = [];
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

            let num = new PIXI.Text("", {
                align: "center",
                fill: 0xFF0000,
                fontSize: 28,
                fontFamily: DEFAULT_FONT,
                stroke: 0,
                strokeThickness: 2,
            } );
            num.anchor.set(0.5, 1);
            num.x = position[0] + 26;
            num.y = position[1] + 39;

            this.spindownLayer.addChild(spinner);
            this.spindownLayer.addChild(num);
            this.cooldownSpinners.push(spinner);
            this.cooldownNumbers.push(num);
        }

        // this.skills[0] = skillData.basic_attack;
        // this.equippedSkills[0] = skillData.basic_attack;
        // this.skillIcons[0].texture = skillData.basic_attack.icon;
    }

    public addSkill(skill: Skill) {
        let alreadyHadSkill = this.skills.indexOf(skill) > 0;
        this.skills.push(skill);
        if (alreadyHadSkill) return; // if we already had a copy of the skill, don't add it to the bar
        for (let i = 0; i < NUM_SKILLS; i ++) {
            if (this.equippedSkills[i] === undefined) {
                this.equippedSkills[i] = skill;
                this.skillIcons[i].texture = skill.icon;
                return;
            }
        }
    }

    public removeSkill(skill: Skill) {
        let idx = this.skills.indexOf(skill);
        if (idx < 0) return; // if we don't even have the skill then that's it
        this.skills.splice(idx, 1);
        if (this.skills.indexOf(skill) < 0) return; // if we still have a copy of the skill, don't remove it from the bar
        let slotIdx = this.equippedSkills.indexOf(skill);
        if (slotIdx < 0) return; // it wasn't even slotted lol
        this.equippedSkills[slotIdx] = undefined;
        this.skillIcons[slotIdx].texture = PIXI.Texture.EMPTY; // remove the image from the bar
    }

    public swapSkills(idx1: number, idx2: number) {
        let skill = this.equippedSkills[idx1];
        this.equippedSkills[idx1] = this.equippedSkills[idx2];
        this.equippedSkills[idx2] = skill;
        let skill1 = this.equippedSkills[idx1];
        if (skill1 === undefined) this.skillIcons[idx1].texture = PIXI.Texture.EMPTY;
        else this.skillIcons[idx1].texture = skill1.icon;
        let skill2 = this.equippedSkills[idx1];
        if (skill2 === undefined) this.skillIcons[idx1].texture = PIXI.Texture.EMPTY;
        else this.skillIcons[idx1].texture = skill2.icon;
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
                this.cooldownNumbers[i].visible = false;
            } else if (this.skillCooldowns[i] > 0) {
                this.cooldownSpinners[i].visible = true;
                this.cooldownSpinners[i].setProgress(this.skillCooldowns[i] / skill.cooldown);
                this.cooldownNumbers[i].visible = true;
                let cdSeconds = Math.round(this.skillCooldowns[i] / 6) / 10;
                this.cooldownNumbers[i].text = cdSeconds >= 10 ? cdSeconds.toFixed(0) : cdSeconds.toFixed(1);
            } else {
                this.cooldownSpinners[i].visible = false;
                this.cooldownNumbers[i].visible = false;
            }
        }
    }
}
