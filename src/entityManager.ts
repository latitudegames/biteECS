import ComponentProxy, { IComponentProxyNew } from "./componentProxy";
import Entity from "./entity";
import World from "./world";

export type PrefabComponent = {
  component: string | IComponentProxyNew;
  data?: Record<string, any>;
};

export type Prefab = PrefabComponent[];

type PrefabMap = Map<string, Prefab>;

type CreateOverrides = Record<string, PrefabComponent>;

/*
The entity manager is resposible for keeping track of all created entities, as well as registering and creating prefabs for the quick production of entities.  Prefabs help us bundle up all of our logic for creating a single entity into one easy to reuse place.

It also contains helper function to get entities by component types, remove components from entities, add components to entities, etc.

The entity manager provides a nice level of abstraction on top of bitECS to ease some of the boilerplate and overhead.  In theory, each scene could actually have its own entity manager, and each EM has its own bitECS world, allowing there to be a clean separation from one scene to the next.
*/
export default class EntityManager {
  // private scene: Phaser.Scene;
  private world: World;
  private entityMap: Map<number, Entity>;
  private prefabMap: PrefabMap;

  constructor(world: World) {
    // this.scene = scene;
    this.prefabMap = new Map();
    this.entityMap = new Map();
    this.world = world;
  }

  // Entity map
  // create entity with new entity class
  // register prefab with new entity class

  /**
   * Create returns a "wrapped entity", which ios basically a bitECS entity wrapped inside a helper class that gives is a lot of helpful additonal functionality to our entity, like adding components, etc.
   */
  create(): Entity {
    const entity = new Entity(this.world);
    this.entityMap.set(entity.eid, entity);
    return entity;
  }

  /**
   * will delete an entity from the internal entity map
   */
  remove(entity) {
    this.entityMap.delete(entity.eid);
  }

  /*
  Register a prefab to later create
   */
  registerPrefab(key: string, prefab: Prefab) {
    this.prefabMap.set(key, prefab);
  }

  /**
   * Get a registered prefab by key
   */
  getPrefab(key: string) {
    const prefab = this.prefabMap.get(key);
    if (!prefab)
      throw new Error(
        `Norefab found with key ${key}.  Please register your prefab or check your key.`
      );
    return prefab;
  }

  /*
  Creates an entity from a prefab.  A prefab is a bit like a factory for making entities. Prefabs are a an aray of data mapped to individual component names. Prefab data shape looks similar to this:
    {
      component: 'componentName',
      data: {
        x: 0,
        y: 0
      }
    }

  This also relies on the components in the prefab have already been registered in the component system, which should happen before any entity creation.
  */
  createPrefab(type: string, overrides: CreateOverrides[]): Entity {
    const entity = this.create();
    const prefab = this.prefabMap.get(type);

    if (!prefab)
      throw new Error(
        `No prefab of type ${type} found. Please register your prefab before creating it.`
      );

    for (let i = 0; i < prefab.length; i++) {
      const config = prefab[i];
      const key =
        typeof config.component === "string"
          ? config.component
          : config.component.key;
      const override = overrides && overrides[key] ? overrides[key] : {};

      // todo better component verification to ensure it is a string, a procy, or a bitECS component
      const Component =
        typeof config.component === "string"
          ? this.world.componentManager.getComponent(config.component)
          : config.component;

      if (!Component) throw new Error(`No component found for key ${key}`);

      const component = new (Component as IComponentProxyNew)(
        this.world,
        entity
      );

      // add the component to the entity
      entity.addComponent(component as ComponentProxy);

      // allow for a consumer to set overrides to different component data if needed.
      const data = {
        ...config.data,
        ...override,
      };

      const dataEntries = Object.entries(data);

      // now we have to go over each data object so we can add it to the components array
      for (let i = 0; i < dataEntries.length; i++) {
        const [dataKey, value] = dataEntries[i];
        // eg. equivalent of doing Position.x[entity] = value
        entity[key][dataKey] = value;
      }
    }

    this.entityMap.set(entity.eid, entity);
    return entity;
  }

  /*
  Get all entities which have a specific component
   */
  private getAllEntitiesWithComponent() {}

  /*
  Get all entities with multiple components
   */
  private getAllEntitiesWithComponents() {}
}
