

function getEnv() {
    return process.env.NODE_ENV || 'development';
}

function isDev() {
    return getEnv() === 'development'
}

export function Loggable(fn: Function, ...args: any[]) {
    try {
        fn(...args);
    } catch (error) {
        isDev() && log(error, 'error');
    }
}

export default class Logger{
    source:'SERVER'|'CLIENT'

    constructor(src: "SERVER" | "CLIENT" = "CLIENT") {
        this.source = src;
    }

    public log(msg: any, logType: 'error' | 'info' | 'warn' | 'success' = 'info') {
        isDev() && (() => {
            switch (logType) {
                case 'error': return console.error(errorTag('ERROR'),this.source, msg);
                case 'info': return console.error(infoTag('INFO'), this.source, msg);
                case 'warn': return console.error(warnTag('WARN'), this.source, msg);
                case 'success': return console.error(successTag('SUCCESS'), this.source, msg);
            }
        })()
    }
}

export function log(msg: any, logType: 'error' | 'info' | 'warn' | 'success' = 'info') {
    isDev() && (() => {
        switch (logType) {
            case 'error': return console.error(errorTag('ERROR'), msg);
            case 'info': return console.error(infoTag('INFO'), msg);
            case 'warn': return console.error(warnTag('WARN'), msg);
            case 'success': return console.error(successTag('SUCCESS'), msg);
        }
    })()
}

export function errorTag(tagString: string) {
    return `[\x1b[31m${tagString}\x1b[0m]\x1b[31m`
}
export function infoTag(tagString: string) {
    return `[\x1b[34m${tagString}\x1b[0m]`
}
export function warnTag(tagString: string) {
    return `[\x1b[33m${tagString}\x1b[0m]`
}
export function successTag(tagString: string) {
    return `[\x1b[32m${tagString}\x1b[0m]`
}

