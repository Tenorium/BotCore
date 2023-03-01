import moment from 'moment';

export default class Logger {
    static #config = {
        debug: false,
        dateformat: 'DD.MM.YYYY HH:mm:ss'
    };

    static setConfig(config_) {
        this.#config = config_;
    }

    /**
     * Print INFO log
     * @param message
     */
    static info(message) {
        this.#printLog(message.info, 'info');
    }

    /**
     * Print WARNING log
     * @param message
     */
    static warning(message) {
        this.#printLog(message.warn, 'warning');
    }

    /**
     * Print ERROR log
     * @param message
     * @param {Error|null} e
     */
    static error(message, e = null) {
        this.#printLog(message.error, 'error');
        if (e) {
            console.log(
                '<ERROR DUMP START>\n',
                `Error name: ${e.name}\n`,
                `Error message: ${e.message}\n`,
                `Error stack: ${e.stack}\n`,
                '<ERROR DUMP END>'
            );
        }
    }

    /**
     * Print FATAL log
     * @param message
     */
    static fatal(message) {
        this.#printLog(message.error, 'fatal');
    }

    /**
     * Print DEBUG log
     * @param message
     */
    static debug(message) {
        if (!this.#config?.debug) {
            return;
        }

        this.#printLog(message.debug, 'debug');
    }

    static #printLog(message, level) {
        const date = moment().format(this.#config?.dateformat)
        console.log(`[${date}] [${level.toUpperCase()}] ${message}`);
    }
}

export class ClassLogger {

    static _className = 'UnknownClass';

    /**
     * Print WARNING log
     * @param message
     */
    static _warning(message) {
        Logger.warning(`[${this._className}] ${message}`);
    }

    /**
     * Print ERROR log
     * @param message
     * @param {Error|null} e
     */
    static _error(message, e = null) {
        Logger.error(`[${this._className}] ${message}`, e);
    }

    /**
     * Print FATAL log
     * @param message
     */
    static _fatal(message) {
        Logger.fatal(`[${this._className}] ${message}`);
    }

    /**
     * Print DEBUG log
     * @param message
     */
    static _debug(message) {
        Logger.debug(`[${this._className}] ${message}`);
    }

    static _info(message) {
        Logger.info(`[${this._className}] ${message}`);
    }
}
