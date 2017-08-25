declare module PIXI {
    export class GrayFilter extends PIXI.Filter {
        public gray: number;
    }
    
    export module filters {

        // export class AsciiFilter extends PIXI.Filter {

        //     size: number;
        // }

        // export class BloomFilter extends PIXI.Filter {

        //     blur: number;
        //     blurX: number;
        //     blurY: number;

        // }

        // export class ConvolutionFilter extends PIXI.Filter {

        //     constructor(matrix: number[], width:number, height: number);

        //     height:number;
        //     width:number;
        //     matrix: number[];
        // }

        // export class CrossHatchFilter extends PIXI.Filter {

        // }

        // export class DotFilter extends PIXI.Filter {

        //     angle:number;
        //     scale:number;
        // }

        // export class EmbossFilter extends PIXI.Filter {

        //     strength:number;
        // }

        // export class PixelateFilter extends PIXI.Filter {

        //     size:PIXI.Point;
        // }

        // export class RGBSplitFilter extends PIXI.Filter {

        //     blue:PIXI.Point;
        //     green:PIXI.Point;
        //     red:PIXI.Point;
        // }

        export class ShockwaveFilter extends PIXI.Filter {

            center: number[];
            params: number[];
            time:number;

        }

        // export class TiltShiftAxisFilter extends PIXI.Filter {

        //     blur:number;
        //     end:PIXI.Point;
        //     gradientBlur:number;
        //     start:PIXI.Point;
        //     updateDelta(): void;
        // }

        // export class TiltShiftFilter extends PIXI.Filter {

        //     tiltShiftXFilter:TiltShiftXFilter;
        //     tiltShiftYFilter:TiltShiftYFilter;
        //     blur:number;
        //     end:PIXI.Point;
        //     gradientBlur:number;
        //     start:PIXI.Point;
        // }

        // export class TiltShiftYFilter extends TiltShiftAxisFilter {

        //     updateDelta(): void;
        // }

        // export class TiltShiftXFilter extends TiltShiftAxisFilter {

        //     updateDelta(): void;
        // }

        // export class TwistFilter extends PIXI.Filter {

        //     angle:number;
        //     offset:PIXI.Point;
        //     radius:number;
        // }
    }
}

declare const DEFAULT_FONT: "SilkscreenNormal";

declare interface ExtendedTextStyle extends PIXI.TextStyleOptions {
    valign?: "top" | "middle" | "bottom" | "baseline" | number;
    debug?: boolean;
}
declare interface TextStyleSet {
    [key: string]: ExtendedTextStyle;
}
declare interface MstDebugOptions {
    spans: {
        enabled?: boolean;
        baseline?: string;
        top?: string;
        bottom?: string;
        bounding?: string;
        text?: boolean;
    };
    objects: {
        enabled?: boolean;
        bounding?: string;
        text?: boolean;
    };
}
declare class MultiStyleText extends PIXI.Text {
    private static DEFAULT_TAG_STYLE;
    static debugOptions: MstDebugOptions;
    private textStyles;
    constructor(text: string, styles: TextStyleSet);
    styles: TextStyleSet;
    setTagStyle(tag: string, style: ExtendedTextStyle): void;
    deleteTagStyle(tag: string): void;
    private _getTextDataPerLine(lines);
    private getFontString(style);
    private createTextData(text, style, tagName);
    private getDropShadowPadding();
    updateText(): void;
    protected wordWrap(text: string): string;
    protected updateTexture(): void;
    private assign(destination, ...sources);
}

declare module "png-js" {
    export class load {
        public width: number;
        public height: number;
        constructor(path: string);

        public decode(fn: (pixelData: Buffer) => void): void;
    }
}

declare function Keys<T>(obj: T): (keyof T)[];

declare interface IDamageBundle {
    amount: number;
    type: "physical" | "magic";
    element?: "fire" | "electric" | "poison";
}