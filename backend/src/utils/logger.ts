import winston from 'winston';
import path from 'path';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.json()
);

const transports = [
    new winston.transports.Console({
        format: consoleFormat,
    }),
    new winston.transports.File({
        filename: path.join(process.cwd(), 'error.log'),
        level: 'error',
        format: fileFormat,
    }),
    new winston.transports.File({
        filename: path.join(process.cwd(), 'combined.log'),
        format: fileFormat,
    }),
];

const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

export default logger;