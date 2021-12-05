import {
  Component,
  defineQuery,
  enterQuery,
  exitQuery,
  Query,
  QueryModifier,
} from "bitecs";
import ComponentProxy, { IComponentProxyNew } from "./componentProxy";
import Entity from "./entity";
import World from "./world";

type ComponentMap = Map<string, IComponentProxyNew>;

export default class ComponentManager {
  world: World;
  proxyPool: Map<string, ComponentProxy[]>;
  private componentMap: ComponentMap;

  constructor(world: World) {
    this.world = world;
    this.proxyPool = new Map();
    this.componentMap = new Map();
  }

  /*
  Register component is used to keep track of all components for when we create prefabs
   */
  registerComponent(component: IComponentProxyNew) {
    this.componentMap.set(component.key, component);
  }

  /**
   * Get a component by name key
   */
  getComponent(name: string) {
    return this.componentMap.get(name);
  }

  /**
   * CreateComponentProxy will create a component proxy for a given entity.
   * It will first check to see if there is an existing proxy in the pool.
   * If it finds one, we just reuse it.  If there isn't, we make a new one.
   * This is an omptisation requested by the bitECS documentation here:
   * https://github.com/NateTheGreatt/bitECS/blob/master/docs/INTRO.md
   */
  createComponentProxy(key: string, entity: Entity) {
    const proxyPool = this.proxyPool.get(key);
    if (proxyPool && proxyPool.length > 0) {
      const proxy = proxyPool.pop() as ComponentProxy;
      proxy.attach(entity);
      return proxy;
    }

    const Component = this.getComponent(key);

    if (!Component) throw new Error(`No component with key ${key} found.`);

    return new Component(this.world, entity) as ComponentProxy;
  }

  /**
   * This will retire a proxy from active user, which will place it in the proxy pool.
   */
  retireProxy(proxy: ComponentProxy) {
    proxy.destroy();
    if (this.proxyPool.has(proxy.name)) {
      this.proxyPool.get(proxy.name)?.push(proxy);
    } else {
      this.proxyPool.set(proxy.name, [proxy]);
    }
  }

  /**
   * Given an array of components, returns an object with the needed query functions on it.
   */
  defineQuery(_components: (Component | QueryModifier | ComponentProxy)[]) {
    let components = _components;
    if (components[0].name) {
      components = _components.map((c) => (c as ComponentProxy).store);
    }
    const query = defineQuery(
      components as (Component | QueryModifier)[]
    ) as Query;
    const _enterQuery = enterQuery(query);
    const _exitQuery = exitQuery(query);
    const wrappedQuery = (world = this.world.store) => query(world) as number[];
    wrappedQuery.enter = (world = this.world.store) =>
      _enterQuery(world) as number[];
    wrappedQuery.exit = (world = this.world.store) =>
      _exitQuery(world) as number[];
    return wrappedQuery;
  }
}
