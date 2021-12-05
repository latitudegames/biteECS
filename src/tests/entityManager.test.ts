import { defineComponent, Types } from "bitecs";
import ComponentProxy from "../componentProxy";
import Entity from "../entity";
import EntityManager, { Prefab } from "../entityManager";
import World from "../world";

const key = "position";
const Position = defineComponent({
  x: Types.ui32,
  y: Types.ui32,
});

let world;
let entityManager;
let entity;

class PositionProxy extends ComponentProxy {
  static key = key;
  constructor() {
    super(world, Position, entity, key);
  }
}

describe("entity manager", () => {
  beforeEach(() => {
    world = new World();
    entity = new Entity(world);
    entityManager = new EntityManager(world);
  });

  test("should create an entity", () => {
    const entity = entityManager.create();
    expect(entity).toBeInstanceOf(Entity);
    expect(entityManager.entityMap.size).toEqual(1);
    expect(entityManager.entityMap.get(entity.eid)).toEqual(entity);
  });

  test("should remove an entity", () => {
    const entity = entityManager.create();
    expect(entityManager.entityMap.size).toEqual(1);
    entityManager.remove(entity);
    expect(entityManager.entityMap.size).toEqual(0);
  });

  describe("prefab", () => {
    const prefabKey = "testPrefab";
    const prefabNoData: Prefab = [
      {
        component: key,
      },
    ];

    const prefabData: Prefab = [
      {
        component: key,
        data: {
          x: 100,
          y: 100,
        },
      },
    ];

    const proxyPrefab = [
      {
        component: PositionProxy,
        data: {
          x: 100,
          y: 100,
        },
      },
    ];

    beforeEach(() => {
      world.componentManager.registerComponent(PositionProxy);
    });

    test("should register a prefab", () => {
      expect(entityManager.prefabMap.size).toEqual(0);
      entityManager.registerPrefab(prefabKey, prefabNoData);
      expect(entityManager.prefabMap.size).toEqual(1);
      expect(entityManager.prefabMap.get(prefabKey)).toEqual(prefabNoData);
    });

    test("should get a prefab", () => {
      entityManager.registerPrefab(prefabKey, prefabNoData);
      expect(entityManager.getPrefab(prefabKey)).toEqual(prefabNoData);
    });

    test("should create an entity from string with no data", () => {
      entityManager.registerPrefab(prefabKey, prefabNoData);
      const entity = entityManager.createPrefab(prefabKey);
      expect(entity).toBeDefined();
      expect(entity.position).toBeDefined();
    });

    test("should create an entity from string with data", () => {
      entityManager.registerPrefab(prefabKey, prefabData);
      const entity = entityManager.createPrefab(prefabKey);
      expect(entity).toBeDefined();
      expect(entity.position).toBeDefined();
      expect(entity.position.x).toEqual(100);
      expect(entity.position.y).toEqual(100);
    });

    test("should create an entity from a proxy and data", () => {
      entityManager.registerPrefab(prefabKey, proxyPrefab);
      const entity = entityManager.createPrefab(prefabKey);
      expect(entity).toBeDefined();
      expect(entity.position).toBeDefined();
      expect(entity.position.x).toEqual(100);
      expect(entity.position.y).toEqual(100);
    });

    test("should error if one component in the prefab doesnt exist", () => {
      const key = "non-existing";
      const myPrefab = [
        {
          component: key,
        },
      ];
      entityManager.registerPrefab(key, myPrefab);
      expect(() => entityManager.createPrefab(key)).toThrowError();
    });

    test("should error if the prefab isnt registered", () => {
      expect(() => entityManager.createPrefab("test")).toThrowError();
    });
  });
});
