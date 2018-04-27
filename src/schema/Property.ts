
export interface Property {
  name: string;
  get(instance: any): any;
  set(instance: any, value: any): void;
}
