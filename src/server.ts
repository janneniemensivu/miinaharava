import { MikroORM } from "@mikro-orm/core"
import {
  EntityManager,
  EntityRepository,
  SqliteDriver,
} from "@mikro-orm/sqlite"
import { TsMorphMetadataProvider } from "@mikro-orm/reflection"
import express from "express"
import { Game } from "./Game"
import { Square } from "./Square"
import GameController from "./gameController"

export const DI = {} as {
  orm: MikroORM<SqliteDriver>
  em: EntityManager
}

export const initTables = async () => {
  const generator = DI.orm.getSchemaGenerator()
  await generator.dropSchema()
  await generator.createSchema()
  await generator.updateSchema()
}

const app: express.Application = express()

const initDb = async () => {
  DI.orm = await MikroORM.init({
    dbName: "minesweeper",
    type: "sqlite",
    entities: [Game, Square],
    debug: process.env.NODE_ENV === "development",
    metadataProvider: TsMorphMetadataProvider,
  })
  DI.em = DI.orm.em
}

app.get("/", (req, res) => {
  console.log("vittuuko tässä")
  GameController.initGame(req, res)
})

app.get("/paska", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.get("/target", (req, res) => {
  GameController.shootAtTarget(req, res)
})

app.listen(3000, async () => {
  await initDb()
  await initTables()
  console.log("App is listening on port 3000!")
})
