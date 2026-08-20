type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    let res = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (data) {
      res += ` ${typeof data === "object" ? JSON.stringify(data) : data}`;
    }
    return res;
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      console.debug(this.format("debug", message, data));
    }
  }

  info(message: string, data?: any) {
    console.log(this.format("info", message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.format("warn", message, data));
  }

  error(message: string, data?: any, stack?: string) {
    console.error(this.format("error", message, data));
    if (stack) console.error(stack);
  }
}

export const logger = new Logger();