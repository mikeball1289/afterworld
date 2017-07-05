export function main() {
    console.log("I started!");
    let app = new PIXI.Application(800, 600, { backgroundColor: 0x42f4e8 });
    document.body.appendChild(app.view);
}