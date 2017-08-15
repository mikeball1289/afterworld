export function fromTextureCache(name: string): PIXI.Texture;
export function fromTextureCache(name: string, x: number, y: number, width: number, height: number): PIXI.Texture;
export function fromTextureCache(name: string, x?: number, y?: number, width?: number, height?: number) {
    if (x === undefined) {
        return PIXI.loader.resources[name].texture;
    } else {
        return new PIXI.Texture(PIXI.loader.resources[name].texture.baseTexture, new PIXI.Rectangle(x, y, width, height));
    }
}
