import { defineComponent, Types } from "bitecs";
import ComponentProxy from "../componentProxy";
import System from "../system";
import World from "../world";

let world: World;
let system: MySystem;

const key = "position";
const Position = defineComponent({
  x: Types.ui32,
  y: Types.ui32,
});

let entity;

class PositionProxy extends ComponentProxy<any> {
  static key = key;
  constructor(world, entity) {
    super(world, Position, entity, key);
  }
}

class MySystem extends System {
  constructor(world) {
    super(world);
  }

  entities = this.defineQuery([key]);

  execute() {
    return true;
  }
}

describe("system class", () => {
  beforeEach(() => {
    world = new World() as World;
    system = new MySystem(world);
    world.componentManager.registerComponent(PositionProxy);
    entity = world.entityManager.create();
    entity.addComponent(key);
  });

  test("should return an interface from defining a query", () => {
    expect(system.entities).toBeDefined();
    expect(system.entities.entered).toBeDefined();
    expect(system.entities.exited).toBeDefined();
    expect(system.entities.current).toBeDefined();
  });

  test("should return an array of entities that exist on a query", () => {
    expect(system.entities.current).toHaveLength(1);
    expect(system.entities.current).toContain(entity.eid);
  });

  test("should show entities that have exited the world", () => {
    expect(system.entities.current).toHaveLength(1);
    expect(system.entities.exited).toHaveLength(0);

    entity.destroy();
    expect(system.entities.exited).toHaveLength(1);
  });

  test("should show entities that have entered the world", () => {
    expect(system.entities.current).toHaveLength(1);
    expect(system.entities.exited).toHaveLength(0);

    entity.destroy();
    expect(system.entities.exited).toHaveLength(1);

    const newEntity = world.entityManager.create();
    newEntity.addComponent(key);

    expect(system.entities.entered).toHaveLength(1);
  });

  test("should return an entity by id", () => {
    const fetchedEntity = system.getEntityById(entity.eid);
    expect(fetchedEntity).toBeDefined();
    expect(fetchedEntity.eid).toEqual(entity.eid);
  });

  test("should process an array of entities", () => {
    const mockCallback = jest.fn();
    system.processEntities(system.entities.current, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(system.getEntityById(entity.eid));
  });
});
