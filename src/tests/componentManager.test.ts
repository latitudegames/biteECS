import { defineComponent, Types } from "bitecs";
import ComponentManager from "../componentManager";
import ComponentProxy from "../componentProxy";
import Entity from "../entity";
import World from "../world";

const key = "position";
const Position = defineComponent({
  x: Types.ui32,
  y: Types.ui32,
});

let world;
let entity;
let positionProxy;
let componentManager;

class PositionProxy extends ComponentProxy<any> {
  static key = key;
  constructor() {
    super(world, Position, entity, key);
  }
}

describe("component manager", () => {
  beforeEach(() => {
    world = new World();
    entity = new Entity(world);
    componentManager = new ComponentManager(world);
    positionProxy = new PositionProxy();
  });

  test("should register component", () => {
    const name = positionProxy.name;
    expect(componentManager.componentMap.size).toEqual(0);

    componentManager.registerComponent(PositionProxy);
    expect(componentManager.componentMap.size).toEqual(1);
    // expect(componentManager.componentMap.get(name)).toEqual(positionProxy);
  });

  test("should get a component", () => {
    const name = positionProxy.name;
    componentManager.registerComponent(PositionProxy);
    // expect(componentManager.getComponent(name)).toEqual(positionProxy);
  });

  describe("create component proxy", () => {
    beforeEach(() => {
      componentManager.registerComponent(PositionProxy);
    });

    test("should create a new proxy when one doesnt exist in the pool", () => {
      const component = componentManager.createComponentProxy(key, entity);
      expect(component).toBeInstanceOf(ComponentProxy);
    });

    test("should retire a component", () => {
      const component = componentManager.createComponentProxy(key, entity);

      expect(componentManager.proxyPool.size).toEqual(0);

      componentManager.retireProxy(component);

      expect(componentManager.proxyPool.size).toEqual(1);
      expect(componentManager.proxyPool.get(key).length).toEqual(1);
    });

    test("should return a proxy from the pool", () => {
      const component1 = componentManager.createComponentProxy(key, entity);

      expect(componentManager.proxyPool.size).toEqual(0);
      componentManager.retireProxy(component1);
      expect(componentManager.proxyPool.size).toEqual(1);
      expect(componentManager.proxyPool.get(key).length).toEqual(1);

      const component2 = componentManager.createComponentProxy(key, entity);

      expect(componentManager.proxyPool.get(key).length).toEqual(0);
    });
  });

  test("should return a query interface", () => {
    const query = componentManager.defineQuery([positionProxy]);
    expect(typeof query).toEqual("function");
    expect(query.enter).toBeDefined();
    expect(query.exit).toBeDefined();
  });

  test("should return a query interface from an array of component keys", () => {
    const query = componentManager.defineQuery(["position"]);
    expect(typeof query).toEqual("function");
    expect(query.enter).toBeDefined();
    expect(query.exit).toBeDefined();
  });
});
