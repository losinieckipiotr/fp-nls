"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const defaultCfg = {
    debug: true,
    root: '../',
    custom: 'custom',
    commonTranslationPaths: 'nls',
    outputPath: 'output',
};
function getConfig(config = defaultCfg) {
    const DEBUG = config.debug;
    const ROOT_PATH = path.resolve(path.join(__dirname, defaultCfg.root));
    const CUSTOM_FOLDER = config.custom;
    const TRANSLATIONS_FOLDER = config.commonTranslationPaths;
    const OUTPUT_PATH = path.join(ROOT_PATH, config.outputPath, TRANSLATIONS_FOLDER);
    const TRANSLATIONS_PATH = path.join(ROOT_PATH, TRANSLATIONS_FOLDER);
    const CFG = {
        DEBUG,
        ROOT_PATH,
        CUSTOM_FOLDER,
        TRANSLATIONS_FOLDER,
        OUTPUT_PATH,
        TRANSLATIONS_PATH,
    };
    return CFG;
}
exports.default = getConfig;
