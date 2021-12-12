import Phaser from "phaser";
import World from "./world";
import SystemManager from "./systemManager";
import EntityManager from "./entityManager";
import ComponentManager from "./componentManager";

export default class BiteECSPlugin extends Phaser.Plugins.ScenePlugin {
  public world: World;
  public systemManager: SystemManager;
  public entityManager: EntityManager;
  public componentManager: ComponentManager;
  public runSystem: (key: string, delta: number) => void;

  constructor(
    scene: Phaser.Scene,
    pluginManager: Phaser.Plugins.PluginManager
  ) {
    super(scene, pluginManager, "bitECS");

    this.world = new World();

    // Add a couple of helper accessors to the scene for easier interfacing.
    this.systemManager = this.world.systemManager;
    this.entityManager = this.world.entityManager;
    this.componentManager = this.world.componentManager;

    // Attach run system for use internally to hook into engine events, and to run inside the scene.
    this.runSystem = this.systemManager.runSystem;
  }

  update(time, delta) {
    this.systemManager.update(time, delta);
  }

  destroy() {
    this.entityManager.destroy();
  }

  shutdown() {
    this.entityManager.destroy();
  }
}
