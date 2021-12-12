import { addEntity, removeEntity } from "bitecs";
import ComponentProxy from "./componentProxy";
import World from "./world";

/**
 * Entity class is a wrapper around the bitECS entity giving it helper functions
 * and stored internal reference to the world the entity is in.
 * It also givs an easy interface to access components on the entity, which are themselves in turn
 * component proxies with helper setters and getters.
 */
export default class Entity {
  componentMap: Map<string, ComponentProxy<any>>;
  eid: number;
  world: World;
  children: Set<number>;
  sprite: any;
  position: any;
  texture: any;
  velocity: any;
  input: any;

  constructor(world: World) {
    this.eid = addEntity(world.store);
    this.world = world;
    this.componentMap = new Map();
    this.children = new Set();
  }

  /**
   * Add a component to the entity.  Requires a key, for now, that tells the entity how to map
   * the component to itself.
   */
  addComponent(component: ComponentProxy<any> | string): void {
    // We get the name of the component to use as a key, either from the component or as a string
    const name = typeof component === "string" ? component : component.name;

    const proxy = this.world.componentManager.createComponentProxy(name, this);

    // Add the component to the map
    this.componentMap.set(name, proxy);

    // define getter to get a component from the entity

    Object.defineProperty(this, name, {
      configurable: true,
    });
    Object.defineProperty(this, name, {
      get() {
        return this.componentMap.get(name);
      },
    });
  }

  /**
   * Removes a component from the entity.
   * Note to self.  Need to handle possible proxies here instead of raw components.
   */
  removeComponent(component: ComponentProxy<any> | string): void {
    const name = typeof component === "string" ? component : component.name;
    const proxy = this.componentMap.get(name);

    if (!proxy) throw new Error(`No proxy found with name ${name}`);

    this.world.componentManager.retireProxy(proxy);
    this.componentMap.delete(name);
  }

  /**
   * Gets a single component from the map given a key
   */
  getComponent(key: string): ComponentProxy<any> {
    const proxy = this.componentMap.get(key);
    if (!proxy) throw new Error(`No component with key ${key} exists.`);

    return proxy;
  }

  hasComponent(key: string): boolean {
    try {
      this.getComponent(key);
      return true;
    } catch {
      return false;
    }
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
   * Add a child to the entity.
   */
  addChild(entity: Entity): void {
    this.children.add(entity.eid);
  }

  /**
   * Gets all of an entities components.
   */
  components(): ComponentProxy<any>[] {
    // Could use normal get entities, but will stick to proxies for now.
    // getEntityComponents(this.world, this.entity);
    const components: ComponentProxy<any>[] = [];
    this.componentMap.forEach((component) => components.push(component));
    return components;
  }

  /**
   * Destroy an entity completely.  Removed it from the bitECS world, and also nukes
   * everything inside the class
   */
  destroy(): void {
    this.componentMap.forEach((_, Component) => {
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
