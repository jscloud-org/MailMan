
export interface ClientOptions {
    alias?: string,
    reconnectStrategy?: 'FIXED_INTERVAL' | 'INCREMENTAL_INTERVAL',
    autoReconnect?: boolean,
    reconnectLimit?: number,
    reconnectTimeoutMs?: number
}

export function createDefaultOptions(): ClientOptions {
    return {
        alias: 'mm_client',
        reconnectStrategy: 'INCREMENTAL_INTERVAL',
        autoReconnect: true,
        reconnectLimit: 3,
        reconnectTimeoutMs: 1000
    }
}
