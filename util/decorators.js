import {ClassLogger} from "#util/log";

/**
 *
 * @param {Function} constructor
 */
export function classLogger(constructor) {
    Object.assign(constructor.prototype, ClassLogger);
}