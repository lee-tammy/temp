import { Options } from './cli';
export declare const clangFormat: any;
export declare const xml2js: any;
export declare const jsdiff: any;
export declare const chalk: any;
/**
 * Run tslint fix and clang fix with the default configuration
 * @param options
 * @param fix whether to automatically fix the format
 * @param files files to format
 */
export declare function format(options: Options, files?: string[], fix?: boolean): Promise<boolean>;
