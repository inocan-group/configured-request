import { Model, model, property } from "firemodel";

@model()
export class Person extends Model {
  @property name: string;
  @property age: number;
}
