import {
  addComponent,
  addEntity,
  hasComponent,
  Component,
  IWorld,
  removeComponent,
  removeEntity,
} from "bitecs";
import ComponentProxy from "./componentProxy";
import World from "./world";

type ComponentStorage = {
  store: Component;
  proxy: ComponentProxy;
};

/**
 * Entity class is a wrapper around the bitECS entity giving it helper functions
 * and stored internal reference to the world the entity is in.
 * It also givs an easy interface to access components on the entity, which are themselves in turn
 * component proxies with helper setters and getters.
 */
export default class Entity {
  componentMap: Map<string, ComponentStorage>;
  componentKeyMap: Map<Component, string>;
  proxyKeyMap: Map<ComponentProxy, string>;
  eid: number;
  world: World;

  constructor(world: World) {
    this.eid = addEntity(world.store);
    this.world = world;
    this.componentMap = new Map();
    this.componentKeyMap = new Map();
    this.proxyKeyMap = new Map();
  }

  /**
   * Add a component to the entity.  Requires a key, for now, that tells the entity how to map
   * the component to itself.
   */
  addComponent(key: string, store: Component): void {
    addComponent(this.world.store, store, this.eid);

    // We create the proxy via the world factory method which will reuse proxies.
    const proxy = this.world.createComponentProxy(store, this);

    const storage: ComponentStorage = {
      store,
      proxy,
    };

    // Add the component to the map
    this.componentMap.set(key, storage);
    // Store the Components key for later lookup
    this.componentKeyMap.set(store, key);
    // store the prixies key for later reference
    this.proxyKeyMap.set(proxy, key);

    // We add a new property to the entity that lets us access the component from the map
    Object.defineProperty(this, key, {
      get: (): ComponentProxy | undefined => {
        const component = this.componentMap.get(key);

        if (component?.proxy) return component.proxy;

        return undefined;
      },
    });
  }

  /**
   * Removes a component from the entity.
   * Note to self.  Need to handle possible proxies here instead of raw components.
   */
  removeComponent(_component: Component | ComponentProxy): void {
    const isProxy = _component instanceof ComponentProxy;
    const key = isProxy
      ? (this.proxyKeyMap.get(_component) as string)
      : (this.componentKeyMap.get(_component) as string);
    const component = this.componentMap.get(key) as ComponentStorage;

    removeComponent(this.world.store, component.store, this.eid);
    this.world.retireProxy(component.proxy);
    this.componentMap.delete(key);
    this.componentKeyMap.delete(component.store);
    this.proxyKeyMap.delete(component.proxy);
  }

  /**
   * Gets a single component from the map given a key
   */
  getComponent(key: string): ComponentProxy {
    const component = this.componentMap.get(key);
    if (!component) throw new Error(`No component with key ${key} exists.`);

    return component.proxy;
  }

  /**
   * Sets data to an entities component.  If the component doesn't exist, we create it.
   */
  setComponent(key: string, data: Record<string, any>) {
    // If the entty doesnt have the component, add it.
    const Component = this.componentMap.get(key);

    if (!Component) throw new Error(`Component with key ${key} not found.`);

    const dataEntries = Object.entries(data);

    // here we are going through the data and settingeach property onto the component
    for (let i = 0; i < dataEntries.length; i++) {
      const [key, value] = dataEntries[i];
      // eg. equivalent of doing Position.x[entity] = value
      Component[key][this.eid] = value;
    }
  }

  /**
   * Gets all of an entities components.
   */
  components(): ComponentProxy[] {
    // Could use normal get entities, but will stick to proxies for now.
    // getEntityComponents(this.world, this.entity);
    const components: ComponentProxy[] = [];
    this.componentMap.forEach((component) => components.push(component.proxy));
    return components;
  }

  /**
   * Destroy an entity completely.  Removed it from the bitECS world, and also nukes
   * everything inside the class
   */
  destroy(): void {
    this.componentKeyMap.forEach((_, Component) => {
      this.removeComponent(Component);
    });

    // remove the entity from the entity manager
    this.world.entityManager.remove(this);

    // remove entity from bitECS world
    removeEntity(this.world.store, this.eid);

    // for now set eid to NaN
    this.eid = NaN;
  }
}
