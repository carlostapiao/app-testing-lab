import type { ILogger } from '../logger.interface';

export class ConsoleLogger implements ILogger {
    private readonly colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m',
    };

    private formatTimestamp(): string {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];
        return `${this.colors.gray}${date} ${time}${this.colors.reset}`;
    }

    private formatMessage(message: string, level: string, color: string, meta?: Record<string, unknown>): string {
        const timestamp = this.formatTimestamp();
        const levelColor = `${color}${this.colors.bright}${level.padEnd(5)}${this.colors.reset}`;

        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        let formattedMessage = messageStr;
        if (messageStr.includes('\n')) {
            formattedMessage = messageStr
                .split('\n')
                .map((line, index) => {
                    if (index === 0) return line;
                    return `${this.colors.dim}│${this.colors.reset} ${line}`;
                })
                .join('\n');
        }

        let out = `${timestamp} ${levelColor} ${formattedMessage}`;
        if (meta !== undefined && meta !== null && Object.keys(meta).length > 0) {
            try {
                const metaStr = JSON.stringify(meta, null, 2)
                    .split('\n')
                    .map((line, index) => {
                        if (index === 0) return line;
                        return `${this.colors.dim}│${this.colors.reset} ${line}`;
                    })
                    .join('\n');
                out += `\n${this.colors.dim}${metaStr}${this.colors.reset}`;
            } catch {
                out += ` ${JSON.stringify(meta)}`;
            }
        }
        return out;
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        const formatted = this.formatMessage(message, 'DEBUG', this.colors.blue, meta);
        console.debug(formatted);
    }

    info(message: string, meta?: Record<string, unknown>): void {
        const formatted = this.formatMessage(message, 'INFO', this.colors.green, meta);
        console.info(formatted);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        const formatted = this.formatMessage(message, 'WARN', this.colors.yellow, meta);
        console.warn(formatted);
    }

    error(message: string, trace?: string, meta?: Record<string, unknown>): void {
        const formatted = this.formatMessage(message, 'ERROR', this.colors.red, meta);
        console.error(formatted);
        if (trace) {
            const traceFormatted = trace
                .split('\n')
                .map(line => `${this.colors.dim}│${this.colors.reset} ${this.colors.red}${line}${this.colors.reset}`)
                .join('\n');
            console.error(traceFormatted);
        }
    }
}
