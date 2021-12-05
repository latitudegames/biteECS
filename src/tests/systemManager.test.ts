import SystemManager from "../systemManager";
import World from "../world";

let world;
let systemManager;

const mockSystem = jest.fn((world) => world);

describe("system manager", () => {
  beforeEach(() => {
    world = new World();
    systemManager = new SystemManager(world);
  });

  test("should register systems to the default pipeline", () => {
    expect(systemManager.defaultPipeline.length).toEqual(0);
    systemManager.registerSystems([mockSystem]);
    expect(systemManager.defaultPipeline.length).toEqual(1);
  });

  test("should register systems to to a specific pipeline", () => {
    const groupName = "PRERENDER";
    expect(systemManager.systemGroupMap[groupName]).toBeUndefined();
    systemManager.registerSystems([mockSystem], groupName);
    expect(systemManager.systemGroupMap.get(groupName).length).toEqual(1);
  });

  test("should update the default system pipeline", () => {
    systemManager.registerSystems([mockSystem]);
    systemManager.update();
    expect(mockSystem).toHaveBeenCalled();
  });

  test("should run a specific system", () => {
    const groupName = "PRERENDER";
    systemManager.registerSystems([mockSystem], groupName);
    systemManager.runSystem(groupName);
    expect(mockSystem).toHaveBeenCalled();
  });
});
