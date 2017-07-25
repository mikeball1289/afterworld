class Juggler
{
    enterFrameFunctions: [(() => void), any][] = [];

    constructor(fps: number)
    {
        setInterval( () => {
            this.enterFrameFunctions.forEach( ([fn, ctx]) => fn.call(ctx) );
        }, 1000 / fps);
    }

    add(fn: () => void, context?: any)
    {
        if (this.has(fn, context) < 0)
        {
            this.enterFrameFunctions.push([fn, context]);
        }
    }

    remove(fn: () => void, context?: any)
    {
        let idx = this.has(fn, context);
        if (idx >= 0)
        {
            this.enterFrameFunctions.splice(idx, 1);
        }
    }

    has(fn: () => void, context?: any) {
        for (let i = 0; i < this.enterFrameFunctions.length; i ++)
        {
            if (this.enterFrameFunctions[i][0] === fn && this.enterFrameFunctions[i][1] === context) return i;
        }
        return -1;
    }
}

export let juggler = new Juggler(60);

class Root {
    private _stage: PIXI.Container;

    constructor() { }

    setStage(stage: PIXI.Container)
    {
        if (!this._stage) this._stage = stage;
        else throw new Error("Stage is already set");
    }

    get stage(): PIXI.Container
    {
        if (this._stage) return this._stage;
        else throw new Error("Stage is not yet set");
    }
}

let root = new Root()

export default root;