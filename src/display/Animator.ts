import { juggler } from "../root";

// ActionMap is a map of animation names -> [animation index, animation length]
// animation index is the number of rows down the animation starts, animation length
// is the number of frames in the animation
export interface IActionMap {
    [action: string]: [number, number];
}

export interface IAnimatorOptions {
    onComplete?: () => void;
    onCompleteContext?: any;
    onProgress?: (frame: number) => void;
    onProgressContext?: any;
    loop?: boolean;
    override?: boolean;
}

export default class Animator<T extends IActionMap> extends PIXI.Sprite {

    private currentFrame = 0;
    private currentAnimation: keyof T;
    private onComplete?: () => void;
    private onCompleteContext?: any;
    private onProgress?: (frame: number) => void;
    private onProgressContext?: any;
    private loop: boolean = true;
    private frames: PIXI.Texture[][] = [];
    private jup: () => void;
    private loader?: PIXI.loaders.Loader;

    constructor(spriteSheet: PIXI.Texture, frameSize: PIXI.Point, animations: T, idle: keyof T, fps?: number);
    constructor(spriteSheet: PIXI.Texture, frameData: any, animations: T, idle: keyof T, fps?: number);
    constructor(private spriteSheet: PIXI.Texture, frameSize: any, private animations: T, private idle: keyof T, public fps = 12) {
        super();
        this.currentAnimation = idle;
        for (let ani in animations) {
            if (!animations.hasOwnProperty(ani)) continue;
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

    // this is a pretty narrow function, basically useful for swapping out sprite sheets on the
    // fly for the player sprite to switch equipment
    public loadTexturePackerFrames(spriteSheet: string, data: string) {
        if (this.loader) this.loader.removeAllListeners();
        this.loader = new PIXI.loaders.Loader();
        this.loader.add(spriteSheet).add(data, { xhrType: "text" });
        this.loader.load( () => {
            if (!this.loader) return;
            let newFrames = [];
            let sheet = this.loader.resources[spriteSheet].texture;
            let frameData = JSON.parse(this.loader.resources[data].data);
            for (let ani in this.animations) {
                if (!this.animations.hasOwnProperty(ani)) continue;
                let frames = [];
                let row = this.animations[ani][0];
                for (let i = 0; i < this.animations[ani][1]; i ++) {
                    let frameDataObject = frameData.frames[row + "-" + i];
                    frames.push(new PIXI.Texture(sheet.baseTexture, new PIXI.Rectangle(frameDataObject.frame.x, frameDataObject.frame.y, frameDataObject.frame.w, frameDataObject.frame.h),
                                                                    new PIXI.Rectangle(0, 0, frameDataObject.sourceSize.w, frameDataObject.sourceSize.h),
                                                                    new PIXI.Rectangle(frameDataObject.spriteSourceSize.x, frameDataObject.spriteSourceSize.y, frameDataObject.spriteSourceSize.w, frameDataObject.spriteSourceSize.h)));
                }
                newFrames[row] = frames;
            }
            for (let frameLine of this.frames) {
                for (let frame of frameLine) {
                    frame.destroy();
                }
            }
            this.spriteSheet.destroy(true);
            this.spriteSheet = sheet;
            this.frames = newFrames;
            this.loader = undefined;
        } );
    }

    public play(animation: keyof T, options: IAnimatorOptions = {}) {
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

    public setProgress(amount: number) {
        this.currentFrame = amount * this.animations[this.currentAnimation][1];
    }

    public destroy(options?: boolean | PIXI.IDestroyOptions, source = false) {
        this.texture = <PIXI.Texture> <any> undefined;
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

    private update(dt: number = 1) {
        let previousFrame = this.currentFrame;
        this.currentFrame += dt;
        if (Math.floor(this.currentFrame) >= this.animations[this.currentAnimation][1]) {
            if (this.onComplete !== undefined) {
                this.onComplete.call(this.onCompleteContext);
            }
        }

        // the on complete callback could have mutated our state, so before continuing with loop / idle make sure we 
        // actually still have to
        if (Math.floor(this.currentFrame) >= this.animations[this.currentAnimation][1]) {
            if (this.loop) {
                this.currentFrame -= this.animations[this.currentAnimation][1];
            } else {
                this.play(this.idle, { loop: true, override: true } );
            }
        }

        this.texture = this.frames[this.animations[this.currentAnimation][0]][Math.floor(this.currentFrame)];
        if (Math.floor(this.currentFrame) !== Math.floor(previousFrame)) {
            if (this.onProgress) this.onProgress.call(this.onProgressContext, Math.floor(this.currentFrame));
        }
    }
}
