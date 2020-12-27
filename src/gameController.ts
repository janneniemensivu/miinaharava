import { Request, Response } from "express"
import { getTypeParameterOwner } from "typescript"
import { Game } from "./Game"
import { DI } from "./server"
import { Square } from "./Square"

class GameController {
  static initGame = async (req: Request, res: Response) => {
    console.log("at initgame")
    console.log("mineCount: " + req.query.mineCount)
    if (!req.query.size || !req.query.mineCount)
      return res.send("missing parameter")
    const size = parseInt(req.query.size as string)
    const mineCount = parseInt(req.query.mineCount as string)

    const game = new Game(size, mineCount)
    await DI.em.persistAndFlush(game)

    await game.setupBoard()
    await game.setUpMines()

    const gameBoard = await game.getGameBoardAsArray()
    console.log(gameBoard)
    return res.send({ gameId: game.id, gameBoard: gameBoard })
  }

  static shootAtTarget = async (req: Request, res: Response) => {
    if (!req.query.gameId || !req.query.rowIndex || !req.query.colIndex)
      return res.send("missing parameter")

    const gameId = parseInt(req.query.gameId as string)
    const rowIndex = parseInt(req.query.rowIndex as string)
    const colIndex = parseInt(req.query.colIndex as string)
    const game = await DI.orm.em.findOne(Game, gameId)

    if (game?.status != "playing") return res.send("not playing")
    const gameBoard: string[][] = await game.getGameBoardAsArray()

    switch (gameBoard[rowIndex][colIndex]) {
      case "empty": {
        GameController.sweepForMines(gameBoard, rowIndex, colIndex)
        game.setGameBoardFromArray(gameBoard)
        if (game.gameWon()) {
          return res.send({ won: true, lost: false, gameBoard: gameBoard })
        } else {
          return res.send({
            won: false,
            lost: false,
            gameBoard: gameBoard,
            message: "Good shot!",
          })
        }
      }

      case "cleared": {
        return res.send({
          won: false,
          lost: false,
          gameBoard: gameBoard,
          message: "Already shot there",
        })
      }

      case "mine": {
        game.status = "lost"
        await DI.em.flush()
        return res.send({
          lost: true,
          gameBoard: gameBoard,
          message: "You lost, fucker",
        })
      }
    }
  }

  static getMineCount = (
    gameBoard: string[][],
    rowIndex: number,
    colIndex: number
  ) => {
    let mineCount = 0
    for (let i = -1; i <= 1; i++) {
      if (rowIndex + i < 0 || rowIndex + i > gameBoard.length - 1) continue
      for (let j = -1; j <= 1; j++) {
        if (i == 0 && j == 0) continue
        if (colIndex + j < 0 || colIndex + j > gameBoard.length - 1) continue
        if (gameBoard[rowIndex + i][colIndex + j] == "mine") mineCount++
      }
    }
    return mineCount
  }

  static sweepForMines = async (
    gameBoard: string[][],
    rowIndex: number,
    colIndex: number
  ) => {
    const mineCount = GameController.getMineCount(gameBoard, rowIndex, colIndex)

    if (mineCount > 0) {
      gameBoard[rowIndex][colIndex] = mineCount.toString()
      return
    } else {
      gameBoard[rowIndex][colIndex] = "cleared"

      for (let i = -1; i <= 1; i++) {
        if (rowIndex + i < 0 || rowIndex + i > gameBoard.length - 1) continue

        for (let j = -1; j <= 1; j++) {
          if (
            (i == 0 && j == 0) ||
            colIndex + j < 0 ||
            colIndex + j > gameBoard.length - 1
          )
            continue

          if (gameBoard[rowIndex + i][colIndex + j] == "empty") {
            GameController.sweepForMines(gameBoard, rowIndex + i, colIndex + j)
          }
        }
      }
    }
    return gameBoard
  }
}

export default GameController
