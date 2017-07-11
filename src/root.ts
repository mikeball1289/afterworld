// let _stage: PIXI.Container;

// export function InitStage(stage: PIXI.Container) {
//     if (!_stage) _stage = stage;
//     else throw new Error("Stage has already been initialized");
// }

// export var root = {
//     get stage() {
//         if (!_stage) throw new Error("Stage has not been initialized");
//         return _stage;
//     }
// }

class Juggler {
    enterFrameFunctions: (() => void)[] = [];

    constructor(fps: number) {
        setInterval( () => {
            this.enterFrameFunctions.forEach( (fn) => fn() );
        }, 1000 / fps);
    }

    add(fn: () => void) {
        if (this.enterFrameFunctions.indexOf(fn) < 0) {
            this.enterFrameFunctions.push(fn);
        }
    }

    remove(fn: () => void) {
        let idx = this.enterFrameFunctions.indexOf(fn);
        if (idx >= 0) {
            this.enterFrameFunctions.splice(idx, 1);
        }
    }

}

export var juggler = new Juggler(60);