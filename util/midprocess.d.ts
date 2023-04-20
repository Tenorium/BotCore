import {ChildProcessWithoutNullStreams} from "child_process";
// @ts-ignore
import EventEmitter from "events";

export class ClientManager {
    // @ts-ignore
    static #clients: Record<string, ChildProcessWithoutNullStreams>;
    // @ts-ignore
    static #prefix: string;
    // @ts-ignore
    static #number: number;
    static startClient(): void;
    static getClients(): Record<string, ChildProcessWithoutNullStreams>[];
    static sendMessage(message: ServerMessage, client: string): void;
    // @ts-ignore
    static #handleMessageFromClient(data: ClientMessage): void;
    // @ts-ignore
    static #handleLog(data: LogMessage): void;
}

export class Client extends EventEmitter {
    static init();
    static sendMessage(message: ClientMessage): void;
    // @ts-ignore
    static #handleMessageFromServer(message: ServerMessage): void;
    static getEventEmitter(): ClientEventEmitter;
}

export class Message<Data, Type> {
    constructor(type: Type, data: Data, headers: MessageHeaders);
    type: Type;
    data: Data;
    headers: MessageHeaders;
    toJSON(): {
        type: Type;
        data: Data;
        headers: MessageHeaders;
    };
}

type MessageHeaders = {
    name: string|undefined
}

type ClientMessage<Data=Object, Type=string> = Message<Data, Type>;
type ServerMessage<Data=Object, Type=string> = Message<Data, Type>;

type LogMessage = ClientMessage<{
    date: string,
    message: string,
    level: 'info'|'warning'|'fatal'|'debug'|'error'
}, 'log'>

type ClientEventEmitter = EventEmitter & {
    emit(eventName: string | symbol, message: ServerMessage): boolean;
    // @ts-ignore
    on(eventName: string | symbol, listener: (message: ServerMessage) => void): this;
    // @ts-ignore
    once(eventName: string | symbol, listener: (message: ServerMessage) => void): this;
}

//# sourceMappingURL=midprocess.d.ts.map
