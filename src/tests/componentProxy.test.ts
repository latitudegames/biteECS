import Entity from "../entity";
import World from "../world";
import { defineComponent, Types } from "bitecs";
import ComponentProxy from "../componentProxy";

describe("Component proxy", () => {
  let world;
  let entity;
  let position;
  let proxy;

  beforeEach(() => {
    world = new World();
    entity = new Entity(world);
    position = defineComponent({
      x: Types.ui32,
      y: Types.ui32,
    });

    proxy = new ComponentProxy(position, entity);
  });

  test("should have getters and setters for every property from a component", () => {
    proxy.x = 100;
    expect(proxy.x).toEqual(100);
    proxy.x = 200;
    expect(proxy.x).toEqual(200);

    proxy.y = 100;
    expect(proxy.y).toEqual(100);

    proxy.y = 200;
    expect(proxy.y).toEqual(200);
  });
});
