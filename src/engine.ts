import World from "./world";

export default class Engine {
  _defaultWorld: World;
  worlds: World[];

  constructor() {
    this.worlds = [];
    this._defaultWorld = new World();
  }
}
