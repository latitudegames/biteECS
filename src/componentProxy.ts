import {
  IWorld,
  IComponent,
  addComponent,
  removeComponent,
  Component,
} from "bitecs";
import Entity from "./entity";
import World from "./world";

/**
 * Component proxy takes in a component and its entity and creates a wrapper
 * around it making it easy to both set and get property values.
 * The pattern is modelled after component proxies in the following article
 * https://github.com/NateTheGreatt/bitECS/blob/master/docs/INTRO.md
 */
export interface IComponentProxy {
  world: IWorld;
  store: Component;
  entity: Entity;
  name: string;
  attach: Function;
  destroy: Function;
}

export interface IComponentProxyNew extends IComponentProxy {
  new (world: World, entity: Entity): IComponentProxy;
  key: string;
}

export default class ComponentProxy implements IComponentProxy {
  world: World;
  store: Component;
  entity: Entity;
  name: string;
  static key: string = "baseaProxy";

  constructor(world: World, store: Component, entity: Entity, name: string) {
    this.world = world;
    this.store = store;
    this.entity = entity;
    this.name = name;

    addComponent(this.world.store, this.store, entity.eid);
  }

  /**
   * Attach an entity to this component proxy. Sets the entity into bitECS world and sets the entity to the class.
   */
  attach(entity: Entity) {
    this.entity = entity;
  }

  /**
   * Removes this component from the world?
   */
  destroy(): boolean {
    if (!this.entity) return false;
    removeComponent(this.world.store, this.store, this.entity.eid);
    return true;
  }
}
