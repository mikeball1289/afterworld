import { juggler } from "../root";

// ActionMap is a map of animation names -> [animation index, animation length]
// animation index is the number of rows down the animation starts, animation length
// is the number of frames in the animation
export interface ActionMap {
    [action: string]: [number, number];
}

export default class Animator<T extends ActionMap> extends PIXI.Sprite {

    private currentFrame = 0;
    private currentAnimation: keyof T;
    private onComplete?: () => void;
    private onCompleteContext?: any;
    private loop: boolean = true;
    private frames: PIXI.Texture[][] = [];
    private jup: () => void;

    constructor(private spriteSheet: PIXI.Texture, private frameSize: PIXI.Point, private animations: T, private idle: keyof T, fps = 12) {
        super();
        this.currentAnimation = idle;
        for (let ani in animations) {
            let frames = [];
            let row = animations[ani][0];
            for (let i = 0; i < animations[ani][1]; i ++) {
                frames.push(new PIXI.Texture(spriteSheet.baseTexture, new PIXI.Rectangle(i * frameSize.x, row * frameSize.y, frameSize.x, frameSize.y)));
            }
            this.frames[row] = frames;
        }
        this.jup = this.update.bind(this, fps / 60);
        juggler.add(this.jup);
    }

    update(dt: number = 1) {
        this.currentFrame += dt;
        if (Math.floor(this.currentFrame) >= this.animations[this.currentAnimation][1]) {
            if (this.onComplete !== undefined) {
                this.onComplete.call(this.onCompleteContext);
            }
            if (this.loop) {
                this.currentFrame -= this.animations[this.currentAnimation][1];
            } else {
                this.currentFrame = 0;
                this.currentAnimation = this.idle;
                this.onComplete = undefined;
            }
        }
        this.texture = this.frames[this.animations[this.currentAnimation][0]][Math.floor(this.currentFrame)];
    }

    play(animation: keyof T, loop: boolean = true, onComplete?: () => void, onCompleteContext?: any, override: boolean = false) {
        if (this.currentAnimation === animation && !override) return;
        this.currentAnimation = animation;
        this.currentFrame = 0;
        this.loop = loop;
        this.onComplete = onComplete;
    }

    setProgress(amount: number) {
        this.currentFrame = amount * this.animations[this.currentAnimation][1];
    }

    destroy(options?: boolean | PIXI.IDestroyOptions, source = false) {
        this.texture = <PIXI.Texture><any> undefined;
        super.destroy(options);
        juggler.remove(this.jup);
        if (source) {
            for (let frameLine of this.frames) {
                for (let frame of frameLine) {
                    frame.destroy();
                }
            }
        }
    }

    get animationName(): keyof T {
        return this.currentAnimation;
    }

}