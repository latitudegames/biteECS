import { IComponent } from "bitecs";
import Entity from "./entity";

/**
 * Component proxy takes in a component and its entity and creates a wrapper
 * around it making it easy to both set and get property values.
 * The pattern is modelled after component proxies in the following article
 * https://github.com/NateTheGreatt/bitECS/blob/master/docs/INTRO.md
 */
export default class ComponentProxy {
  store: IComponent;
  entity: Entity;
  constructor(store: IComponent, entity: Entity) {
    this.store = store;
    this.entity = entity;

    // Here we create setters and getters for every property of the component
    for (const key in store) {
      Object.defineProperty(this, key, {
        get: () => this.store[key][this.entity.eid],
        set: (value) => {
          this.store[key][this.entity.eid] = value;
        },
      });
    }
  }
}
