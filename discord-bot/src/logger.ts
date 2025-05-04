import pino from "pino";
import { basename, join } from "node:path";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync
} from "node:fs";
import { schedule, ScheduledTask } from "node-cron";
import archiver from "archiver";

/**
 * Used to log things to file and/or console.
 */
class Logger {
  private pino!: pino.Logger;
  private logDir = join(import.meta.dirname.split("/src")[0], "data", "logs");
  private logFile = join(this.logDir, "latest.log");
  private cron: ScheduledTask | undefined;

  constructor() {
    // create the needed log directory
    if (!existsSync(this.logDir)) mkdirSync(this.logDir, { recursive: true });

    //empty the latest log file
    if (existsSync(this.logFile) && readFileSync(this.logFile).length == 0)
      this.compressLogFile();

    //check whether we are in DEV_ENV
    const DEV_ENV = (process.env.DEV as boolean | undefined) ?? false;

    //create a pino instance
    this.pino = pino.pino({
      level: DEV_ENV ? "trace" : "info",
      transport: DEV_ENV
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
              sync: true
            }
          }
        : {
            targets: [
              {
                target: "pino-pretty",
                options: {
                  colorize: false,
                  translateTime: "yyyy-mm-dd HH:MM:ss",
                  ignore: "pid,hostname",
                  sync: false
                }
              },
              {
                target: "pino/file",
                options: {
                  destination: this.logFile,
                  append: true,
                  sync: false
                }
              }
            ]
          }
    });

    //schedule the CRON task
    if (!DEV_ENV) {
      const now = new Date(Date.now());
      this.cron = schedule(
        `${now.getMinutes()} ${now.getHours()} * * *`,
        () => {
          this.pino.debug("Logger CRON Task tick.");

          this.pino.flush();
          this.compressLogFile();

          this.pino.info("Archived latest.log and starting a new one!");
        },
        {
          scheduled: true
        }
      );
    }
  }

  private compressLogFile() {
    //create the name of the log file
    const nowDate = new Date(Date.now());
    const logFileName = `log_${nowDate.getUTCFullYear()}-${nowDate.getUTCMonth()}-${nowDate.getUTCDate()}_${nowDate.getUTCHours()}:${nowDate.getUTCMinutes()}:${nowDate.getUTCSeconds()}`;
    const logFilePath = join(this.logDir, `${logFileName}.log`);

    //rename the latest one
    renameSync(this.logFile, logFilePath);

    //compress it and delete the original
    const zipper = archiver("tar", {
      gzip: true,
      zlib: { level: 9 }
    });

    zipper.pipe(createWriteStream(join(this.logDir, `${logFileName}.tar.gz`)));

    zipper.file(logFilePath, { name: basename(logFilePath) });

    zipper.finalize().then(
      () => unlinkSync(logFilePath),
      () => console.log("Failed to compress a log file... Wierd.")
    );
  }

  /**
   * Run when it's time to stop using the logger.
   */
  destroy() {
    this.pino.flush();
    this.cron?.stop();
  }

  trace(obj: object) {
    this.pino.trace(obj);
  }

  debug(msg: string) {
    this.pino.debug(msg);
  }

  info(msg: string) {
    this.pino.info(msg);
  }

  warn(obj?: object, msg?: string) {
    this.pino.warn(obj, msg);
  }

  error(obj: object, msg?: string) {
    this.pino.error(obj, msg);
  }

  fatal(obj: object, msg?: string) {
    this.pino.fatal(obj, msg);
  }
}

export default new Logger();
