"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
const ava_1 = __importDefault(require("ava"));
const path = __importStar(require("path"));
const util_1 = require("../src/util");
ava_1.default('get should parse the correct tsconfig file', (t) => __awaiter(this, void 0, void 0, function* () {
    const FAKE_DIRECTORY = '/some/fake/directory';
    const FAKE_CONFIG = { a: 'b' };
    function fakeReadFilep(configPath, encoding) {
        t.is(configPath, path.join(FAKE_DIRECTORY, 'tsconfig.json'));
        t.is(encoding, 'utf8');
        return Promise.resolve(JSON.stringify(FAKE_CONFIG));
    }
    const contents = yield util_1.getTSConfig(FAKE_DIRECTORY, fakeReadFilep);
    t.deepEqual(contents, FAKE_CONFIG);
}));
// TODO: test errors in readFile, JSON.parse.
//# sourceMappingURL=test-util.js.map