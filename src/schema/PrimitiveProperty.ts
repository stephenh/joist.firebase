
import { Model } from '@src/model';
import { Property } from '@src/schema';

export class PrimitiveProperty implements Property {
  public name: string;

  constructor(name: string | symbol, type: string) {
    this.name = name.toString();
  }

  public get(instance: Model): any {
    return instance.metadata.get(this.name);
  }

  public set(instance: Model, value: any): void {
    instance.metadata.set(this.name, value);
  }
}
