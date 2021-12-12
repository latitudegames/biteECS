import Entity from "../entity";
import World from "../world";
import { defineComponent, Types } from "bitecs";
import ComponentProxy from "../componentProxy";

const key = "position";
const Position = defineComponent({
  x: Types.ui32,
  y: Types.ui32,
});

let world;
let entity;
let proxy;

jest.mock("../componentManager", () => {
  return jest.fn().mockImplementation(() => {
    return {
      createComponentProxy: (name) => {
        return new ComponentProxy(world, Position, entity, name);
      },
      retireProxy: () => {},
    };
  });
});

describe("Entity class", () => {
  beforeEach(() => {
    world = new World();
    entity = new Entity(world);
    proxy = new ComponentProxy(world, Position, entity, key);
  });

  afterEach(() => {
    world = undefined;
    entity = undefined;
    proxy = undefined;
  });

  test("should create an entity", () => {
    expect(entity.eid).toBeDefined();
    expect(entity).toEqual(expect.any(Entity));
  });

  test("should add a component", () => {
    entity.addComponent(key, proxy);

    expect(entity.componentMap.get(key)).toBeDefined();
  });

  test("should return a component by key", () => {
    entity.addComponent(key, proxy);

    expect(entity.getComponent(key)).toBeDefined();
  });

  test("should create a component proxy", () => {
    entity.addComponent(key, proxy);

    expect(entity.getComponent(key)).toEqual(expect.any(ComponentProxy));
  });

  test("should remove a bitECS component", () => {
    entity.addComponent(key, proxy);

    expect(entity.getComponent(key)).toBeDefined();
    entity.removeComponent(proxy);

    expect(() => entity.getComponent(key)).toThrow();
  });

  test("should remove a proxy component and clear all maps", () => {
    entity.addComponent(key, proxy);

    expect(entity.getComponent(key)).toBeDefined();
    const component = entity.getComponent(key);
    entity.removeComponent(component);

    expect(() => entity.getComponent(key)).toThrow();
    expect(entity.componentMap.size).toEqual(0);
  });

  test("should create getter to access component on add", () => {
    entity.addComponent(key, proxy);

    const component = entity.getComponent(key);
    expect(entity.position).toBeDefined();
    expect(entity.position).toEqual(component);

    entity.removeComponent(component);
    expect(entity.positiont).not.toBeDefined();
  });

  test("should get and set to an entity property component", () => {
    const key = "position";
    entity.addComponent(key, Position);

    entity.position.x = 100;
    entity.position.y = 200;

    expect(entity.position.x).toEqual(100);
    expect(entity.position.y).toEqual(200);
  });

  test("should return all components on the entity", () => {
    const key = "position";
    entity.addComponent(key, Position);

    const velocity = {
      x: Types.ui32,
      y: Types.ui32,
    };

    const velocityProxy = new ComponentProxy(
      world,
      velocity,
      entity,
      "velocity"
    );

    entity.addComponent(velocityProxy);

    const components = entity.components().map((c) => c.name);

    expect(components.length).toEqual(2);
    expect(components).toContainEqual(velocityProxy.name);
    expect(components).toContain(proxy.name);
  });

  test("should destroy itself", () => {
    const key = "position";
    entity.addComponent(key, Position);

    const velocity = {
      x: Types.ui32,
      y: Types.ui32,
    };

    const velocityProxy = new ComponentProxy(
      world,
      velocity,
      entity,
      "velocity"
    );

    entity.addComponent("velocity", velocity);

    const components = entity.components().map((c) => c.name);

    expect(components.length).toEqual(2);
    expect(components).toContain(velocityProxy.name);
    expect(components).toContain(proxy.name);

    entity.destroy();
    expect(entity.components().length).toEqual(0);
    expect(entity.componentMap.size).toEqual(0);
  });
});
