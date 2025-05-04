import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '@utils/logger';

interface LogEntry {
    timestamp: string;
    method: string;
    endpoint: string;
    ipAddress: string;
    status: number;
    responseTime: number;
}

class LogService {
    private logFile: string;
    private maxLogs: number = 1000; // Maximum number of logs to keep

    constructor() {
        // Use absolute path to ensure the logs directory exists
        this.logFile = path.resolve(__dirname, '../../logs/server.log');
        this.ensureLogFile();
        logger.info(`LogService initialized with log file: ${this.logFile}`);
    }

    private ensureLogFile() {
        try {
            const logDir = path.dirname(this.logFile);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
                logger.info(`Created log directory: ${logDir}`);
            }
            if (!fs.existsSync(this.logFile)) {
                fs.writeFileSync(this.logFile, '[]');
                logger.info(`Created empty log file: ${this.logFile}`);
            }
        } catch (error) {
            logger.error(`Error ensuring log file exists: ${error.message}`);
        }
    }

    public logRequest(req: Request, res: Response, responseTime: number) {
        try {
            const logEntry: LogEntry = {
                timestamp: new Date().toISOString(),
                method: req.method,
                endpoint: req.path,
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                status: res.statusCode,
                responseTime: responseTime
            };

            this.addLog(logEntry);
            logger.debug(`Logged request: ${req.method} ${req.path} - ${res.statusCode} (${responseTime}ms)`);
        } catch (error) {
            logger.error(`Error logging request: ${error.message}`);
        }
    }

    private addLog(logEntry: LogEntry) {
        try {
            const logs = this.getLogs();
            logs.unshift(logEntry); // Add new log at the beginning

            // Keep only the latest maxLogs entries
            if (logs.length > this.maxLogs) {
                logs.length = this.maxLogs;
            }

            fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            logger.error(`Error writing to log file: ${error.message}`);
        }
    }

    public getLogs(): LogEntry[] {
        try {
            if (!fs.existsSync(this.logFile)) {
                this.ensureLogFile();
                return [];
            }
            
            const content = fs.readFileSync(this.logFile, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            logger.error(`Error reading log file: ${error.message}`);
            return [];
        }
    }

    public getLogsByDate(date: string): LogEntry[] {
        try {
            const logs = this.getLogs();
            return logs.filter(log => {
                const logDate = new Date(log.timestamp).toDateString();
                return logDate === new Date(date).toDateString();
            });
        } catch (error) {
            logger.error(`Error filtering logs by date: ${error.message}`);
            return [];
        }
    }

    public searchLogs(query: string): LogEntry[] {
        try {
            const logs = this.getLogs();
            const searchTerm = query.toLowerCase();
            return logs.filter(log => 
                log.method.toLowerCase().includes(searchTerm) ||
                log.endpoint.toLowerCase().includes(searchTerm) ||
                log.ipAddress.toLowerCase().includes(searchTerm) ||
                log.status.toString().includes(searchTerm)
            );
        } catch (error) {
            logger.error(`Error searching logs: ${error.message}`);
            return [];
        }
    }
}

export const logService = new LogService(); 