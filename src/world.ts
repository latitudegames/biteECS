import { createWorld, IWorld } from "bitecs";
import ComponentProxy from "./componentProxy";
import { EntityManager } from "./entityManager";
export default class World {
  store: IWorld;
  entityManager: EntityManager;
  proxyPool: ComponentProxy[];

  constructor() {
    this.store = createWorld();
    this.entityManager = new EntityManager(this);
    this.proxyPool = [];
  }

  /**
   * CreateComponentProxy will create a component proxy for a given entity.
   * It will first check to see if there is an existing proxy in the pool.
   * If it finds one, we just reuse it.  If there isn't, we make a new one.
   * This is an omptisation requested by the bitECS documentation here:
   * https://github.com/NateTheGreatt/bitECS/blob/master/docs/INTRO.md
   */
  createComponentProxy(Component, entity) {
    if (this.proxyPool.length > 0) {
      const proxy = this.proxyPool.pop() as ComponentProxy;
      proxy.entity = entity;
      return proxy;
    }

    return new ComponentProxy(Component, entity);
  }

  /**
   * This will retire a proxy from active user, which will place it in the proxy pool.
   */
  retireProxy(proxy: ComponentProxy) {
    this.proxyPool.push(proxy);
  }
}
