import bitECS, { Query, QueryModifier } from "bitecs";
import { Component, IWorld } from "bitecs";
import Entity from "./entity";
import World from "./world";
// these are stand in types until we can define proper types for them

type Entities = number[];
type PrefabMap = Record<string, any>;
type ComponentMap = Record<string, any>;

type CreateOverrides = {
  [componentName: string]: Record<string, unknown>;
};

/*
The entity manager is resposible for keeping track of all created entities, as well as registering and creating prefabs for the quick production of entities.  Prefabs help us bundle up all of our logic for creating a single entity into one easy to reuse place.

It also contains helper function to get entities by component types, remove components from entities, add components to entities, etc.

The entity manager provides a nice level of abstraction on top of bitECS to ease some of the boilerplate and overhead.  In theory, each scene could actually have its own entity manager, and each EM has its own bitECS world, allowing there to be a clean separation from one scene to the next.
*/
export class EntityManager {
  // private scene: Phaser.Scene;
  private world: World;
  private componentMap: ComponentMap;
  private entityMap: Map<number, Entity>;
  private prefabMap: PrefabMap;

  constructor(world: World) {
    // this.scene = scene;
    this.prefabMap = new Map();
    this.entityMap = new Map();
    this.componentMap = new Map();
    this.world = world;
  }

  // Entity map
  // create entity with new entity class
  // register prefab with new entity class

  /**
   * Create returns a "wrapped entity", which ios basically a bitECS entity wrapped inside a helper class that gives is a lot of helpful additonal functionality to our entity, like adding components, etc.
   */
  create() {
    const entity = new Entity(this.world);
    this.entityMap.set(entity.eid, entity);
  }

  /**
   * will delete an entity from the internal entity map
   */
  remove(entity) {
    this.entityMap.delete(entity.eid);
  }

  /*
  Register component is used to keep track of all components for when we create prefabs
   */
  registerComponent(key: string, component: Component) {
    this.componentMap.set(key, component);
  }

  /*
  Register a prefab to later create
   */
  registerPrefab(key: string, prefab: Record<string, any>) {
    this.prefabMap.set(key, prefab);
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
  */
  // createPrefab(type: string, overrides: CreateOverrides[]): number {
  //   const entity = this.create()
  //   const prefab = this.prefabMap.get(type);

  //   for (let i = 0; i < prefab.length; i++) {
  //     const config = prefab[i];
  //     const override = overrides[config.component] || {};
  //     const Component = this.componentMap.get(config.component);

  //     // allow for a consumer to set overrides to different component data if needed.
  //     const data = {
  //       ...config.data,
  //       ...override,
  //     };

  //     addComponent(this.world, Component, entity);

  //     const dataEntries = Object.entries(data);

  //     // now we have to go over each data object so we can add it to the components array
  //     for (let i = 0; i < dataEntries.length; i++) {
  //       const [key, value] = dataEntries[i];
  //       // eg. equivalent of doing Position.x[entity] = value
  //       Component[key][entity] = value;
  //     }
  //   }

  //   this.entities.push(entity);
  //   return entity;
  // }

  /*
  Check if an entity has a given component
   */
  hasComponent() {}

  /*
  Query for all entities with a given set of components
   */
  query() {}

  /*
  Get all entities which have a specific component
   */
  getAllEntitiesWithComponent() {}

  /*
  Get all entities with multiple components
   */
  getAllEntitiesWithComponents() {}

  /*
  Helper Function which returns an object with all 3 query types on it.
   */
  defineQuery(components: (Component | QueryModifier)[]) {
    const query = bitECS.defineQuery(components) as Query;
    const enterQuery = bitECS.enterQuery(query);
    const exitQuery = bitECS.exitQuery(query);
    const wrappedQuery = (world = this.world.store) => query(world) as number[];
    wrappedQuery.enter = (world = this.world.store) =>
      enterQuery(world) as number[];
    wrappedQuery.exit = (world = this.world.store) =>
      exitQuery(world) as number[];
    return wrappedQuery;
  }
}
