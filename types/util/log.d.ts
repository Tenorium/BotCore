export default class Logger {
    static setConfig(config_: any): void;
    /**
     * Print INFO log
     * @param message
     */
    static info(message: any): void;
    /**
     * Print WARNING log
     * @param message
     */
    static warning(message: any): void;
    /**
     * Print ERROR log
     * @param message
     * @param {Error|null} e
     */
    static error(message: any, e?: Error | null): void;
    /**
     * Print FATAL log
     * @param message
     */
    static fatal(message: any): void;
    /**
     * Print DEBUG log
     * @param message
     */
    static debug(message: any): void;
    static "__#7@#printLog"(message: any, level: any): void;
}
export namespace ClassLoggerMixin {
    /**
     * Print WARNING log
     * @param {string} message
     */
    function _warning(message: string): void;

    /**
     * Print ERROR log, and if second argument provided prints dump of error
     * @param {string} message
     * @param {?Error} e
     */
    function _error(message: string, e?: Error): void;
    /**
     * Print FATAL log
     * @param message
     */
    function _fatal(message: string): void;
    /**
     * Print DEBUG log if debug mode enabled in core config
     * @param message
     */
    function _debug(message: string): void;

    /**
     * Print INFO log
     * @param {string} message
     */
    function _info(message: string): void;
}
export class ClassLogger {
    protected static _className: string;
}
//# sourceMappingURL=log.d.ts.map
