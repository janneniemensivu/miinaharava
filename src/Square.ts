import {
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Game } from "./Game";

@Entity()
export class Square {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  game!: Game;

  @Property()
  rowIndex!: number;

  @Property()
  colIndex!: number;

  @Property()
  value!: string;

  constructor(rowIndex: number, colIndex: number) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.value = "empty";
  }
}
