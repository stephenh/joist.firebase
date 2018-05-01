
import { Model } from '@src/model';
import { defaultValue, Property } from '@src/schema';

export class PrimitiveProperty implements Property {
  public name: string;

  constructor(name: string | symbol, type: string) {
    this.name = name.toString();
  }

  public get(instance: Model): any {
    return instance.instanceData.get(this.name);
  }

  public set(instance: Model, value: any): void {
    if (value === defaultValue.s || value === defaultValue.n) {
      return;
    }
    instance.instanceData.set(this.name, value);
  }
}
