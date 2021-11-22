

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

export type LoggerSource = 'SERVER' | 'CLIENT';
export type LogType = 'error' | 'info' | 'warn' | 'success';

export default class Logger{
    source: LoggerSource

    constructor(src: LoggerSource = "CLIENT") {
        this.source = src;
    }

    public log(msg: any, logType: LogType = 'info') {
        isDev() && (() => {
            switch (logType) {
                case 'error': return console.error(warnTag(this.source), errorTag('ERROR'), msg);
                case 'info': return console.error(warnTag(this.source), infoTag('INFO'), msg);
                case 'warn': return console.error(warnTag(this.source), warnTag('WARN'), msg);
                case 'success': return console.error(warnTag(this.source), successTag('SUCCESS'), msg);
            }
        })()
    }
}

export function log(msg: any, logType: LogType = 'info') {
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

