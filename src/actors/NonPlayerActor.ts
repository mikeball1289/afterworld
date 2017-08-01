import Actor from "./Actor";
import Map from "../world/Map";
import PlayerCharacter from "./PlayerCharacter";

abstract class NonPlayerActor extends Actor {
    abstract updateImpulse(map: Map, player?: PlayerCharacter): void;
}

export default NonPlayerActor;