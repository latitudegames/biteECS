import { IWorld, Component as IComponent, defineComponent } from "bitecs";

class Component {
  name: string;

  constructor(schema, name: string) {
    this.name = name;
    const component = defineComponent(schema);

    Object.assign(this, component);
  }
}
