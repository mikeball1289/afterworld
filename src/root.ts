import * as Key from "./Key";

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

export let root = new Root()

class Keyboard {

    private keys: boolean[] = [];

    constructor() {
        window.addEventListener("keydown", (e) => this.keys[e.keyCode] = true );
        window.addEventListener("keyup", (e) => this.keys[e.keyCode] = false );
    }

    isKeyDown(keycode: number) {
        return this.keys[keycode] || false;
    }

}

export let keyboard = new Keyboard();

export enum ControllerAxis {
    LEFT_X = 0,
    LEFT_Y = 1,
    RIGHT_X = 2,
    RIGHT_Y = 3,
}

export enum ControllerButton {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    LB = 4,
    RB = 5,
    LT = 6,
    RT = 7,
    SELECT = 8,
    START = 9,
    L3 = 10,
    R3 = 11,
    D_UP = 12,
    D_DOWN = 13,
    D_LEFT = 14,
    D_RIGHT = 15,
}

class Controller {
    buttons: boolean[] = [];
    axes: number[] = [];

    constructor() {
        juggler.add( () => {
            let gps = navigator.getGamepads();
            if (!gps[0]) {
                this.buttons = [];
                this.axes = [];
                return;
            }
            let gamepad = gps[0];
            this.buttons = gamepad.buttons.map( (b) => b.pressed );
            this.axes = gamepad.axes;
        } );
    }

    getAxis(axis: ControllerAxis) {
        return this.axes[axis] || 0;
    }

    getButton(button: ControllerButton) {
        return this.buttons[button] || false;
    }
}

export let controller = new Controller();

export enum InputType {
    LEFT,
    RIGHT,
    UP,
    DOWN,
    JUMP,
    INTERACT,
}

export function hasInput(type: InputType) {
    switch(type) {
        case InputType.LEFT: return keyboard.isKeyDown(Key.LEFT) || controller.getAxis(ControllerAxis.LEFT_X) < -0.5;
        case InputType.RIGHT: return keyboard.isKeyDown(Key.RIGHT) || controller.getAxis(ControllerAxis.LEFT_X) > 0.5;
        case InputType.UP: return keyboard.isKeyDown(Key.UP) || controller.getAxis(ControllerAxis.LEFT_Y) < -0.5;
        case InputType.DOWN: return keyboard.isKeyDown(Key.DOWN) || controller.getAxis(ControllerAxis.LEFT_Y) > 0.5;
        case InputType.JUMP: return keyboard.isKeyDown(Key.SPACE) || controller.getButton(ControllerButton.A);
        case InputType.INTERACT: return keyboard.isKeyDown(Key.ENTER) || controller.getButton(ControllerButton.Y);
    }
}