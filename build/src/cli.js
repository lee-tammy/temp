#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const meow_1 = __importDefault(require("meow"));
const update_notifier_1 = __importDefault(require("update-notifier"));
const init_1 = require("./init");
const clean_1 = require("./clean");
const packageJson = require('../../package.json');
const logger = console;
const cli = meow_1.default({
    help: `
	Usage
	  $ gts <verb> [<file>...] [options]

    Verb can be:
      init        Adds default npm scripts to your package.json.
      check       Checks code for formatting and lint issues.
      fix         Fixes formatting and linting issues (if possible).
      clean       Removes all files generated by the build.

  Options
    --help        Prints this help message.
    -y, --yes     Assume a yes answer for every prompt.
    -n, --no      Assume a no answer for every prompt.
    --dry-run     Don't make any acutal changes.

	Examples
    $ gts init -y
    $ gts check
    $ gts fix
    $ gts fix src/file1.ts src/file2.ts
    $ gts clean`,
    flags: {
        help: { type: 'boolean' },
        yes: { type: 'boolean', alias: 'y' },
        no: { type: 'boolean', alias: 'n' },
        'dry-run': { type: 'boolean' }
    }
});
function usage(msg) {
    if (msg) {
        logger.error(msg);
    }
    cli.showHelp(1);
}
function run(verb, files) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            dryRun: cli.flags.dryRun || false,
            // Paths are relative to the transpiled output files.
            gtsRootDir: path.resolve(__dirname, '../..'),
            targetRootDir: process.cwd(),
            yes: cli.flags.yes || cli.flags.y || false,
            no: cli.flags.no || cli.flags.n || false,
            logger
        };
        // Linting/formatting depend on typescript. We don't want to load the
        // typescript module during init, since it might not exist.
        // See: https://github.com/google/ts-style/issues/48
        if (verb === 'init') {
            return yield init_1.init(options);
        }
        const lint = require('./lint').lint;
        const format = require('./format').format;
        switch (verb) {
            case 'check':
                const passLint = yield lint(options, files);
                const passFormat = yield format(options, files);
                return passLint && passFormat;
            case 'fix':
                return ((yield lint(options, files, true)) &&
                    (yield format(options, files, true)));
            case 'clean':
                return yield clean_1.clean(options);
            default:
                usage(`Unknown verb: ${verb}`);
                return false;
        }
    });
}
update_notifier_1.default({ pkg: packageJson }).notify();
if (cli.input.length < 1) {
    usage();
}
run(cli.input[0], cli.input.slice(1)).then(success => {
    if (!success) {
        process.exit(1);
    }
});
//# sourceMappingURL=cli.js.map