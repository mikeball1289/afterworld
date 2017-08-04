import { juggler } from "../root";

// ActionMap is a map of animation names -> [animation index, animation length]
// animation index is the number of rows down the animation starts, animation length
// is the number of frames in the animation
export interface ActionMap {
    [action: string]: [number, number];
}

export interface AnimatorOptions {
    onComplete?: () => void;
    onCompleteContext?: any;
    onProgress?: (frame: number) => void;
    onProgressContext?: any;
    loop?: boolean;
    override?: boolean;
}

export default class Animator<T extends ActionMap> extends PIXI.Sprite {

    private currentFrame = 0;
    private currentAnimation: keyof T;
    private onComplete?: () => void;
    private onCompleteContext?: any;
    private onProgress?: (frame: number) => void;
    private onProgressContext?: any;
    private loop: boolean = true;
    private frames: PIXI.Texture[][] = [];
    private jup: () => void;

    constructor(spriteSheet: PIXI.Texture, frameSize: PIXI.Point, animations: T, idle: keyof T, fps?: number);
    constructor(spriteSheet: PIXI.Texture, frameData: any, animations: T, idle: keyof T, fps?: number);
    constructor(private spriteSheet: PIXI.Texture, frameSize: any, private animations: T, private idle: keyof T, public fps = 12) {
        super();
        this.currentAnimation = idle;
        for (let ani in animations) {
            let frames = [];
            let row = animations[ani][0];
            for (let i = 0; i < animations[ani][1]; i ++) {
                if (frameSize instanceof PIXI.Point) {
                    frames.push(new PIXI.Texture(spriteSheet.baseTexture, new PIXI.Rectangle(i * frameSize.x, row * frameSize.y, frameSize.x, frameSize.y)));
                } else {
                    let data = frameSize.frames[row + "-" + i];
                    frames.push(new PIXI.Texture(spriteSheet.baseTexture, new PIXI.Rectangle(data.frame.x, data.frame.y, data.frame.w, data.frame.h),
                                                                          new PIXI.Rectangle(0, 0, data.sourceSize.w, data.sourceSize.h),
                                                                          new PIXI.Rectangle(data.spriteSourceSize.x, data.spriteSourceSize.y, data.spriteSourceSize.w, data.spriteSourceSize.h)));
                }
            }
            this.frames[row] = frames;
        }
        this.jup = () => this.update(this.fps / 60);
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
                this.play(this.idle, { loop: true, override: true } );
            }
        }
        this.texture = this.frames[this.animations[this.currentAnimation][0]][Math.floor(this.currentFrame)];
        if (Math.floor(this.currentFrame) !== Math.floor(this.currentFrame - dt)) {
            if (this.onProgress) this.onProgress.call(this.onProgressContext, Math.floor(this.currentFrame));
        }
    }

    play(animation: keyof T, options: AnimatorOptions = {}) {
        let override = options.override || false;
        let loop = options.loop || false;
        if (this.currentAnimation === animation && !override) return;
        this.currentAnimation = animation;
        this.currentFrame = 0;
        this.loop = loop;
        this.onComplete = options.onComplete;
        this.onCompleteContext = options.onCompleteContext;
        this.onProgress = options.onProgress;
        this.onProgressContext = options.onProgressContext;
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
                    frame.destroy((options && typeof options === "boolean") || (options && options.baseTexture));
                }
            }
        }
    }

    get animationName(): keyof T {
        return this.currentAnimation;
    }

}