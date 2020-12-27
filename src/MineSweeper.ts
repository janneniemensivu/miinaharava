import { stringify } from "querystring";

class MineSweeper {
  size: number;
  mineCount: number;
  gameBoard: string[][];
  gameStatus: string;

  constructor(size: number, mineCount: number) {
    this.size = size;
    this.mineCount = mineCount;
    this.gameBoard = [];
    this.gameStatus = "playing";
  }

  initialize = () => {
    for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
      const row = [];
      for (let colIndex = 0; colIndex < this.size; colIndex++) {
        row.push("empty");
      }
      this.gameBoard.push(row);
    }
  };

  setUpMines = () => {
    let mineIndex = this.mineCount;
    while (mineIndex > 0) {
      const rowIndex = Math.floor(Math.random() * this.size);
      const colIndex = Math.floor(Math.random() * this.size);
      if (this.gameBoard[rowIndex][colIndex] == "empty") {
        this.gameBoard[rowIndex][colIndex] = "mine";
        mineIndex--;
      }
    }
  };

  shootAtTarget = (rowIndex: number, colIndex: number) => {
    if (this.gameStatus != "playing") return "not playing";
    switch (this.gameBoard[rowIndex][colIndex]) {
      case "empty": {
        this.sweepForMines(rowIndex, colIndex);
      }
      case "cleared": {
        return;
      }
      case "mine": {
        this.endGame();
      }
    }
  };
  getMineCount = (rowIndex: number, colIndex: number) => {
    let mineCount = 0;
    for (let i = -1; i <= 1; i++) {
      if (rowIndex + i < 0 || rowIndex + i > this.size - 1) continue;
      for (let j = -1; j <= 1; j++) {
        if (i == 0 && j == 0) continue;
        if (colIndex + j < 0 || colIndex + j > this.size - 1) continue;
        if (this.gameBoard[rowIndex + i][colIndex + j] == "mine") mineCount++;
      }
    }
    return mineCount;
  };
  sweepForMines = (rowIndex: number, colIndex: number) => {
    const mineCount = this.getMineCount(rowIndex, colIndex);
    if (mineCount > 0) {
      this.gameBoard[rowIndex][colIndex] = mineCount.toString();
      return;
    } else {
      this.gameBoard[rowIndex][colIndex] = "cleared";
      for (let i = -1; i <= 1; i++) {
        if (rowIndex + i < 0 || rowIndex + i > this.size - 1) continue;
        for (let j = -1; j <= 1; j++) {
          if (i == 0 && j == 0) continue;
          if (colIndex + j < 0 || colIndex + j > this.size - 1) continue;
          if (this.gameBoard[rowIndex + i][colIndex + j] == "empty") {
            this.sweepForMines(rowIndex + i, colIndex + j);
          }
        }
      }
    }
  };
  endGame = () => {
    this.gameStatus = "ended";
    console.log("you lost, faggot");
  };
  draw = (show: boolean) => {
    for (const row of this.gameBoard) {
      let rowString = "";
      for (const column of row) {
        switch (column) {
          case "empty": {
            rowString += "-";
            break;
          }
          case "cleared": {
            rowString += "0";
            break;
          }
          case "mine": {
            rowString += "X";
            break;
          }
          default: {
            rowString += column;
            break;
          }
        }
      }
      console.log(rowString);
    }
  };
}

const game = new MineSweeper(10, 10);
game.initialize();
game.setUpMines();
game.shootAtTarget(0, 0);

game.draw(true);
