
export interface ClientOptions {
    alias?: string,
    autoReconnect?: boolean,
    retryLimit?: number,
    retryTimeoutMs?: number
}

export function createDefaultOptions(): ClientOptions {
    return {
        alias: 'mm_client',
        autoReconnect: true,
        retryLimit: 3,
        retryTimeoutMs: 1000
    }
}
