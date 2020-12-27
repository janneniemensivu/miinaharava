import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core"
import { Duplex } from "stream"
import { DI } from "./server"
import { Square } from "./Square"

@Entity()
export class Game {
  @PrimaryKey()
  id!: number

  @Property()
  size!: number

  @Property()
  mineCount!: number

  @Property()
  status!: string

  @OneToMany(() => Square, (square) => square.game)
  gameBoard = new Collection<Square>(this)

  constructor(size: number, mineCount: number) {
    this.size = size
    this.mineCount = mineCount
    this.status = "playing"
  }

  setupBoard = async () => {
    for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
      for (let colIndex = 0; colIndex < this.size; colIndex++) {
        const cell = new Square(rowIndex, colIndex)
        this.gameBoard.add(cell)
        DI.em.persist(this)
      }
    }
    await DI.em.flush()
  }
  setUpMines = async () => {
    console.log("setting up miinees: " + this.mineCount)
    console.log(this.size)
    let mineIndex = this.mineCount
    while (mineIndex > 0) {
      const rowIndex = Math.floor(Math.random() * this.size)
      const colIndex = Math.floor(Math.random() * this.size)
      console.log("adding #: " + rowIndex + ":" + colIndex)
      const square = await DI.em.findOne(Square, {
        $and: [{ game: this }, { rowIndex: rowIndex }, { colIndex: colIndex }],
      })
      if (!square) return
      if (square.value == "empty") {
        square.value = "mine"
        console.log("mine set and alarmed")
        mineIndex--
      }
    }
    await DI.em.flush()
  }

  getGameBoardAsArray = async () => {
    const gameBoard = this.emptyGameBoard()

    for (const square of this.gameBoard) {
      gameBoard[square.rowIndex][square.colIndex] = square.value
    }

    return gameBoard
  }
  setGameBoardFromArray = async (gameBoard: string[][]) => {
    for (const square of this.gameBoard) {
      square.value = gameBoard[square.rowIndex][square.colIndex]
    }
    DI.em.flush()
  }

  gameWon() {
    let won = true
    for (const square of this.gameBoard)
      if (square.value == "empty") won = false
    if (won) {
      this.status = "won"
      DI.em.flush()
    }
    return won
  }

  draw = async (gameBoard: string[][], show: boolean) => {
    const returnArray: string[] = []

    for (const row of gameBoard) {
      let rowString = ""

      for (const column of row) {
        switch (column) {
          case "empty": {
            rowString += "-"
            break
          }
          case "cleared": {
            rowString += "0"
            break
          }
          case "mine": {
            rowString += "-"
            break
          }
          default: {
            rowString += column
            break
          }
        }
      }
      returnArray.push(rowString)
    }

    return returnArray
  }
  emptyGameBoard = () => {
    const emptyGameBoard: string[][] = []
    for (let i = 0; i < this.size; i++) {
      const row = []
      for (let j = 0; j < this.size; j++) {
        row.push("-")
      }
      emptyGameBoard.push(row)
    }
    return emptyGameBoard
  }
}
