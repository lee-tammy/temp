"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lint_1 = require("./lint");
const util_1 = require("util");
// Exported for testing purposes.
exports.clangFormat = require('clang-format');
exports.xml2js = require('xml2js');
exports.jsdiff = require('diff');
exports.chalk = require('chalk');
const BASE_ARGS_FILE = ['-style=file'];
const BASE_ARGS_INLINE = ['-style', '{Language: JavaScript, BasedOnStyle: Google, ColumnLimit: 80}'];
/**
 * Run tslint fix and clang fix with the default configuration
 * @param options
 * @param fix whether to automatically fix the format
 * @param files files to format
 */
function format(options, files = [], fix = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.dryRun && fix) {
            options.logger.log('format: skipping auto fix since --dry-run was passed');
            fix = false;
        }
        // If the project has a .clang-format – use it. Else use the default as an
        // inline argument.
        const baseClangFormatArgs = fs.existsSync(path.join(options.targetRootDir, '.clang-format')) ?
            BASE_ARGS_FILE :
            BASE_ARGS_INLINE;
        const program = lint_1.createProgram(options);
        // Obtain a list of source files to format.
        // We use program.getRootFileNames to get only the files that match the
        // include patterns specified in the given tsconfig.json file (as specified
        // through options). This is necessary because we only want to format files
        // over which the developer has control (i.e. not auto-generated or
        // third-party source files).
        const srcFiles = files.length > 0 ?
            files :
            program.getRootFileNames().filter(f => !f.endsWith('.d.ts'));
        if (fix) {
            return fixFormat(srcFiles, baseClangFormatArgs);
        }
        else {
            const result = yield checkFormat(srcFiles, baseClangFormatArgs, options);
            if (!result) {
                options.logger.log('clang-format reported errors... run `gts fix` to address.');
            }
            return result;
        }
    });
}
exports.format = format;
/**
 * Runs clang-format to automatically fix the format of supplied files.
 *
 * @param srcFiles list of source files
 */
function fixFormat(srcFiles, baseArgs) {
    return new Promise((resolve, reject) => {
        const args = baseArgs.concat(['-i'], srcFiles);
        exports.clangFormat.spawnClangFormat(args, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        }, 'inherit');
    });
}
/**
 * Runs clang-format on the list of files and checks whether they are formatted
 * correctly. Returns true if all files are formatted correctly.
 *
 * @param srcFiles list of source files
 */
function checkFormat(srcFiles, baseArgs, options) {
    return new Promise((resolve, reject) => {
        let output = '';
        const arrOffset = [];
        const arrOffsetLength = [];
        const args = baseArgs.concat(['-output-replacements-xml'], srcFiles);
        const out = exports.clangFormat
            .spawnClangFormat(args, (err) => {
            if (err) {
                reject(err);
            }
        }, ['ignore', 'pipe', process.stderr])
            .stdout;
        out.setEncoding('utf8');
        out.on('data', (data) => {
            output += data;
            console.log(output);
        });
        out.on('end', () => {
            findFormatErrorLines(output, options)
                .then(() => {
                resolve(output.indexOf('<replacement ') === -1 ? true : false);
            });
        });
    });
}
/**
 * Parses through xml string for the replacement offsets and lengths. Uses those values
 * to locate the formatting error lines.
 *
 * @param output xml string
 */
function findFormatErrorLines(output, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const parser1 = new exports.xml2js.Parser();
        const parser2 = new exports.xml2js.Parser({ ignoreAttrs: true, mergeAttrs: true });
        const files = output.split('<?xml version=\'1.0\'?>\n');
        for (let i = 1; i < files.length; i++) {
            let errOffset = [];
            let errLength = [];
            let replacement = [];
            // For getting offsets and lengths of the formatting errors
            parser1.parseString(files[i], function (err, xmlOutput) {
                if (err) {
                    throw err;
                }
                if (xmlOutput['replacements']['replacement'] === undefined) {
                    return;
                }
                let j = 0;
                while (xmlOutput['replacements']['replacement'][j] !== undefined) {
                    let replacementObj = xmlOutput['replacements']['replacement'][j];
                    errOffset[j] = replacementObj.$.offset;
                    errLength[j] = replacementObj.$.length;
                    j++;
                }
            });
            // For getting the string that will replace the formatting errors
            parser2.parseString(files[i], function (err, xmlOutput) {
                if (err) {
                    throw err;
                }
                if (xmlOutput['replacements']['replacement'] === undefined) {
                    return;
                }
                let j = 0;
                while (xmlOutput['replacements']['replacement'][j] !== undefined) {
                    let replacementObj = xmlOutput['replacements']['replacement'][j];
                    replacement[j] = replacementObj._;
                    j++;
                }
            });
            console.log('replacement: ' + replacement);
            const read = util_1.promisify(fs.readFile);
            const argNum = 3;
            const file = process.argv[argNum + i - 1];
            const data = yield read(file, 'utf8');
            let dataAfterFixes = performFixes(data, errOffset, errLength, replacement);
            var diff = exports.jsdiff.diffLines(data, dataAfterFixes);
            diff.forEach(function (part) {
                // green for additions, red for deletions
                // grey for common parts
                if (part.added) {
                    part.value.split('\n').map((n) => {
                        console.log(exports.chalk.green.bold("+ " + n));
                    });
                }
                else if (part.removed) {
                    part.value.split('\n').map((n) => {
                        console.log(exports.chalk.red.bold("- " + n));
                    });
                }
                else {
                    part.value.split('\n').map((n) => {
                        console.log(exports.chalk.black.bold("  " + n));
                    });
                }
            });
            console.log();
        }
    });
}
function performFixes(before, errOffset, errLength, replacement) {
    let replacementArr = [];
    replacementArr.push(before.substring(0, errOffset[0]));
    for (let i = 0; i < errOffset.length - 1; i++) {
        replacementArr.push(replacement[i]);
        replacementArr.push(before.substring(+errOffset[i] + +errLength[i], errOffset[i + 1]));
    }
    let last = errOffset.length - 1;
    replacementArr.push(replacement[last]);
    replacementArr.push(before.substring(+errOffset[last] + +errLength[last]));
    return replacementArr.join("");
}
//# sourceMappingURL=format.js.map