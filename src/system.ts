import { QueryComponents } from "./componentManager";
import Entity from "./entity";
import World from "./world";
export default abstract class System {
  time?: number;
  delta?: number;
  world: World;

  constructor(world: World) {
    this.world = world;
  }

  /**
   * System helper function for getting a single entity
   */
  getEntityById(eid: number) {
    return this.world.entityManager.getEntityById(eid);
  }

  /**
   * Defines a query and returns an interface that the execute function can use to easily access entities
   */
  defineQuery(components: QueryComponents) {
    const query = this.world.componentManager.defineQuery(components);
    const queryInterface = {};

    Object.defineProperty(queryInterface, "entered", {
      get: () => {
        return query.enter(this.world.store);
      },
    });

    Object.defineProperty(queryInterface, "exited", {
      get: () => {
        return query.exit(this.world.store);
      },
    });

    // Would be much nicer if this didnt have to be namespaced under 'all' like this.
    Object.defineProperty(queryInterface, "current", {
      get: () => {
        return query(this.world.store);
      },
    });

    return queryInterface as {
      entered: number[];
      exited: number[];
      current: number[];
    };
  }

  /**
   * Helper method which takes an array of entity ID's and acallback.  The callback is given the full entity at every index of the array of entities and runs the callback.  Used to modify and and process every entity of a given query
   */
  processEntities(entities: number[], callback: (entity: Entity) => void) {
    for (let i = 0; i < entities.length; ++i) {
      const entity = this.getEntityById(entities[i]);
      callback(entity);
    }
  }

  /**
   * Runs the system on an update
   */
  abstract execute(arg?);
}
