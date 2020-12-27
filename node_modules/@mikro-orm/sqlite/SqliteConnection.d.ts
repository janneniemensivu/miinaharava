import { AbstractSqlConnection, Knex } from '@mikro-orm/knex';
export declare class SqliteConnection extends AbstractSqlConnection {
    static readonly RUN_QUERY_RE: RegExp;
    connect(): Promise<void>;
    getDefaultClientUrl(): string;
    getClientUrl(): string;
    loadFile(path: string): Promise<void>;
    protected getKnexOptions(type: string): Knex.Config;
    protected transformRawResult<T>(res: any, method: 'all' | 'get' | 'run'): T;
    /**
     * monkey patch knex' sqlite Dialect so it returns inserted id when doing raw insert query
     */
    private getPatchedDialect;
    private getCallMethod;
}
