import { createWorld, IWorld } from "bitecs";
import EntityManager from "./entityManager";
import ComponentManager from "./componentManager";
import SystemManager from "./systemManager";
export default class World {
  store: IWorld;
  entityManager: EntityManager;
  componentManager: ComponentManager;
  systemManager: SystemManager;

  constructor() {
    this.store = createWorld();
    this.entityManager = new EntityManager(this);
    this.componentManager = new ComponentManager(this);
    this.systemManager = new SystemManager(this);
  }
}
