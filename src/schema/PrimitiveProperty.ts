
import { Property } from '@src/schema';

export class PrimitiveProperty implements Property {
  public name: string;

  constructor(name: string | symbol, type: string) {
    this.name = name.toString();
  }

  public get(instance: any): any {
    return null;
  }

  public set(instance: any, value: any): void {
  }
}
