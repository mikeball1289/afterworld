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

export let juggler = new Juggler(60);

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