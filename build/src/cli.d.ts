export interface Logger {
    log: (...args: Array<{}>) => void;
    error: (...args: Array<{}>) => void;
    dir: (obj: {}, options?: {}) => void;
}
export interface Options {
    dryRun: boolean;
    gtsRootDir: string;
    targetRootDir: string;
    yes: boolean;
    no: boolean;
    logger: Logger;
}
export declare type VerbFilesFunction = (options: Options, files: string[], fix?: boolean) => Promise<boolean>;
