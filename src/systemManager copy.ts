import System from "./system";
import World from "./world";

export const pipe =
  (...systems: System[]) =>
  (input) => {
    let tmp = input;
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      const fn = system.execute.bind(system);
      tmp = fn(tmp);
    }
    return tmp;
  };

export default class SystemManager {
  /**
   * The worls this system manager is connected to
   */
  world: World;

  /**
   * The default pipeline is the generic pipeline of the system. It can be used for all generic systems required.
   */
  defaultPipeline: System[];

  /**
   * The pipeline group map holds a map of system pipelines.  This is used to create separate system pipelines for various tasks.
   * This could include pre render, post render, fixed, after physics, etc.
   * The system manager is agnostic to events. The consumer of the system manager will likely set up system groups and
   * then hook those groups up to engine events whic are relevant to the engine running the system.
   * todo system group class which can handle things like fixed time step updates per group, etc.
   * Could consider using the system manager nested to create as many layers as required.  With the addition
   * of a fixed time stepfunction when running, it might actually prove to be perfect for grouping.`
   */
  systemGroupMap: Map<string, System[]>;

  constructor(world: World) {
    this.world = world;
    this.defaultPipeline = [];
    this.systemGroupMap = new Map();
  }

  /**
   * Systems can hook into the main start function of the manager.  This will boot up all systems with a set of variables it might need.
   */
  start() {}

  /**
   * Allow systems to handle stopping for whatever reason but not being destroyed.
   */
  stop() {}

  /**
   * Main updat function.  This is called by the running engine.  It is responsible for kicking off one cycle of systems.
   * It will run the default system.  The running of other systems will be the repsonsibility of emgine event hooks.
   */
  update(time: number, delta: number) {
    const defaultPipeline = pipe(...this.defaultPipeline);
    defaultPipeline(this.world.store);
  }

  /**
   * Runs a single named system group from the system group map.
   */
  runSystem(key: string, delta: number) {
    const systems = this.systemGroupMap.get(key);
    if (!systems) throw new Error(`No system group found with key ${key}`);
    const pipeline = pipe(...systems);
    pipeline(this.world.store);
  }

  /**
   * Destroy a system and ensure all connected resources are collected and removed.
   */
  destroy() {}

  /**
   * Registers a system with this system manager.  Can be used to attach a system optionally to a system group.
   */
  registerSystems(systems: System[], key?: string) {
    const executionMap = systems.map((s) => s.execute);
    if (!key) {
      this.defaultPipeline = [...this.defaultPipeline, ...systems];
      return true;
    }

    const groupSystems = this.systemGroupMap.has(key)
      ? (this.systemGroupMap.get(key) as System[])
      : [];

    this.systemGroupMap.set(key, [...groupSystems, ...systems]);
  }

  /**
   * Clears all systems out of this system manager and resets its state.
   */
  removeSystems() {}
}
