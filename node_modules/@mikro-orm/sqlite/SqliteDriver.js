"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDriver = void 0;
const knex_1 = require("@mikro-orm/knex");
const SqliteConnection_1 = require("./SqliteConnection");
const SqlitePlatform_1 = require("./SqlitePlatform");
class SqliteDriver extends knex_1.AbstractSqlDriver {
    constructor(config) {
        super(config, new SqlitePlatform_1.SqlitePlatform(), SqliteConnection_1.SqliteConnection, ['knex', 'sqlite3']);
    }
    async nativeInsertMany(entityName, data, ctx, processCollections = true) {
        var _a;
        const res = await super.nativeInsertMany(entityName, data, ctx, processCollections);
        const pks = this.getPrimaryKeyFields(entityName);
        const first = res.insertId - data.length + 1;
        res.rows = (_a = res.rows) !== null && _a !== void 0 ? _a : [];
        data.forEach((item, idx) => { var _a; return res.rows[idx] = { [pks[0]]: (_a = item[pks[0]]) !== null && _a !== void 0 ? _a : first + idx }; });
        res.row = res.rows[0];
        return res;
    }
}
exports.SqliteDriver = SqliteDriver;
