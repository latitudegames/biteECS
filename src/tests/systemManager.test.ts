import SystemManager from "../systemManager";
import World from "../world";
import System from "../system";

let world;
let systemManager;
let system;

class MySystem extends System {
  constructor(world) {
    super(world);
  }

  execute() {
    return true;
  }
}

const mockSystem = jest.fn((world) => world);

describe("system manager", () => {
  beforeEach(() => {
    world = new World();
    systemManager = new SystemManager(world);
    system = new MySystem(world);
  });

  test("should register systems to the default pipeline", () => {
    expect(systemManager.defaultPipeline.length).toEqual(0);
    systemManager.registerSystems([system]);
    expect(systemManager.defaultPipeline.length).toEqual(1);
  });

  test("should register systems to to a specific pipeline", () => {
    const groupName = "PRERENDER";
    expect(systemManager.systemGroupMap[groupName]).toBeUndefined();
    systemManager.registerSystems([system], groupName);
    expect(systemManager.systemGroupMap.get(groupName).length).toEqual(1);
  });

  test("should update the default system pipeline", () => {
    const spy = jest.spyOn(system, "execute");
    systemManager.registerSystems([system]);
    systemManager.update();
    expect(spy).toHaveBeenCalled();
  });

  test("should run a specific system", () => {
    const spy = jest.spyOn(system, "execute");
    const groupName = "PRERENDER";
    systemManager.registerSystems([system], groupName);
    systemManager.runSystem(groupName);
    expect(spy).toHaveBeenCalled();
  });
});
