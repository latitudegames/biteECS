import Entity from "../entity";
import World from "../world";
import { defineComponent, Types } from "bitecs";
import ComponentProxy from "../componentProxy";

describe("Entity class", () => {
  let world;
  let entity;
  let Position;

  beforeEach(() => {
    world = new World();
    entity = new Entity(world);
    Position = defineComponent({
      x: Types.ui32,
      y: Types.ui32,
    });
  });

  test("should create an entity", () => {
    expect(entity.eid).toBeDefined();
    expect(entity).toEqual(expect.any(Entity));
  });

  test("should add a component", () => {
    const key = "component";
    entity.addComponent(key, Position);

    expect(entity.componentMap.get(key)).toBeDefined();
  });

  test("should return a component by key", () => {
    const key = "component";
    entity.addComponent(key, Position);

    expect(entity.getComponent(key)).toBeDefined();
  });

  test("should create a component proxy", () => {
    const key = "component";
    entity.addComponent(key, Position);

    expect(entity.getComponent(key)).toEqual(expect.any(ComponentProxy));
  });

  test("should remove a bitECS component", () => {
    const key = "component";
    entity.addComponent(key, Position);

    expect(entity.getComponent(key)).toBeDefined();
    entity.removeComponent(Position);

    expect(() => entity.getComponent(key)).toThrow();
  });

  test("should remove a proxy component and clear all maps", () => {
    const key = "component";
    entity.addComponent(key, Position);

    expect(entity.getComponent(key)).toBeDefined();
    const component = entity.getComponent(key);
    entity.removeComponent(component);

    expect(() => entity.getComponent(key)).toThrow();
    expect(entity.componentMap.size).toEqual(0);
    expect(entity.proxyKeyMap.size).toEqual(0);
    expect(entity.componentKeyMap.size).toEqual(0);
  });

  test("should create getter to access component on add", () => {
    const key = "component";
    entity.addComponent(key, Position);

    const component = entity.getComponent(key);
    expect(entity.component).toBeDefined();
    expect(entity.component).toEqual(component);

    entity.removeComponent(component);
    expect(entity.component).not.toBeDefined();
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

    entity.addComponent("velocity", velocity);

    const velocityProxy = entity.componentMap.get("velocity").proxy;
    const positionProxy = entity.componentMap.get("position").proxy;

    expect(entity.components().length).toEqual(2);
    expect(entity.components()).toContain(velocityProxy);
    expect(entity.components()).toContain(positionProxy);
  });

  test("should destroy itself", () => {
    const key = "position";
    entity.addComponent(key, Position);

    const velocity = {
      x: Types.ui32,
      y: Types.ui32,
    };

    entity.addComponent("velocity", velocity);

    const velocityProxy = entity.componentMap.get("velocity").proxy;
    const positionProxy = entity.componentMap.get("position").proxy;

    expect(entity.components().length).toEqual(2);
    expect(entity.components()).toContain(velocityProxy);
    expect(entity.components()).toContain(positionProxy);

    entity.destroy();
    expect(entity.components().length).toEqual(0);
    expect(entity.componentMap.size).toEqual(0);
    expect(entity.proxyKeyMap.size).toEqual(0);
    expect(entity.componentKeyMap.size).toEqual(0);

    // todo stub the entity manager
    expect(world.entityManager.entityMap.size).toEqual(0);
  });
});
