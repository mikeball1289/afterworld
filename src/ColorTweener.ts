// tslint:disable no-bitwise
export default class ColorTweener {

    private startRGB: [number, number, number];
    private endRGB: [number, number, number];

    constructor(startColor: number, endColor: number) {
        this.startRGB = [(startColor & 0xFF0000) >> 16, (startColor & 0xFF00) >> 8, startColor & 0xFF];
        this.endRGB = [(endColor & 0xFF0000) >> 16, (endColor & 0xFF00) >> 8, endColor & 0xFF];
    }

    public getInbetween(progress: number) {
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        let R = Math.floor(this.startRGB[0] * (1 - progress) + this.endRGB[0] * progress);
        let G = Math.floor(this.startRGB[1] * (1 - progress) + this.endRGB[1] * progress);
        let B = Math.floor(this.startRGB[2] * (1 - progress) + this.endRGB[2] * progress);
        return (R << 16) + (G << 8) + B;
    }
}
