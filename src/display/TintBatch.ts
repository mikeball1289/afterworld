// tslint:disable no-bitwise

export type RGBO = [number, number, number, number];

function RGB(val: number): RGBO {
    let R = ((val & 0xFF0000) >> 16) / 0xFF;
    let G = ((val & 0xFF00) >> 8) / 0xFF;
    let B = (val & 0xFF) / 0xFF;
    return [R, G, B, val];
}

export class TintBatch {
    private tints: RGBO[] = [];
    private tintCache = 0xFFFFFF;

    public addTint(tint: number) {
        let rgb = RGB(tint);
        this.tints.unshift(rgb);
        this.invalidate();
    }

    public removeTint(tint: number) {
        for (let [i, t] of enumerate(this.tints)) {
            if (t[3] === tint) {
                this.tints.splice(i, 1);
                this.invalidate();
                return true;
            }
        }
        return false;
    }

    public getTint() {
        return this.tintCache;
    }

    public reset() {
        this.tints = [];
        this.invalidate();
    }

    private invalidate() {
        let total = this.tints.reduce( (acc, rgb) => [acc[0] * rgb[0], acc[1] * rgb[1], acc[2] * rgb[2]], [1, 1, 1]);
        let R = Math.max(0, Math.min(0xFF, Math.round(total[0] * 255))) << 16;
        let G = Math.max(0, Math.min(0xFF, Math.round(total[1] * 255))) << 8;
        let B = Math.max(0, Math.min(0xFF, Math.round(total[2] * 255)));
        this.tintCache = R + G + B;
    }
}
