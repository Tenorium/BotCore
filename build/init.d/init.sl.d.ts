import ConfigManager from '../util/configManager.js';
export declare class ServiceLocator {
    static services: Record<string, any>;
    static register(name: string, service: any): void;
    static get(name: string): any;
    static has(name: string): boolean;
    static remove(name: string): void;
    static removeAll(): void;
}
export default function (): void;
declare global {
    var app: <T extends keyof AppServices>(serviceName: T) => AppServices[T];
    interface AppServices {
        ConfigManager: typeof ConfigManager;
        ServiceLocator: typeof ServiceLocator;
    }
}
