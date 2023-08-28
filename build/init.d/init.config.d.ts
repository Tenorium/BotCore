import { DataObject, LoggerConfig } from 'utilslib';
export default function (): Promise<CoreConfig>;
export declare class CoreConfig extends DataObject {
    constructor(data?: CoreConfigDataType);
    getLoggerConfig(): LoggerConfig;
    setLoggerConfig(config: LoggerConfig): void;
    getClientConfig(): ClientConfig;
    setClientConfig(config: ClientConfig): void;
    getLocale(): string;
    setLocale(locale: string): void;
    getToken(): string;
    setToken(token: string): void;
    getPrefix(): string;
    setPrefix(prefix: string): void;
}
export declare class ClientConfig extends DataObject {
    constructor(data?: {
        intents: number[];
    });
    getIntents(): number[];
    setIntents(intents: number[]): void;
}
declare interface CoreConfigDataType {
    logger: LoggerConfig;
    client: ClientConfig;
    locale: string;
    token: string;
    prefix: string;
}
export {};
