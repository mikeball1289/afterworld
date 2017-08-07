import Map from "../world/Map";
import Actor from "./Actor";
import PlayerCharacter from "./PlayerCharacter";

abstract class NonPlayerActor extends Actor {
    public abstract updateImpulse(map: Map, player?: PlayerCharacter): void;
}

export default NonPlayerActor;
