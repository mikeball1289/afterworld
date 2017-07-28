import World from "./World";

export default function update(world: World) {
    let player = world.player;
    let map = world.map;
    player.updateImpulse(map);

    player.handleCollisions(map.move(player));
}