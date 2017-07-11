export function main() {
    let app = new PIXI.Application(800, 600, { backgroundColor: 0x42f4e8, antialias: false });
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
    document.body.appendChild(app.view);
}