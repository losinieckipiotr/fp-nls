import * as path from 'path';
import { defaultOptions } from '../src/config';

const rootPath = path.resolve(path.join(__dirname, defaultOptions.root));
const outpuPath = path.join(rootPath, defaultOptions.outputFolder);
const translationsPath = path.join(rootPath, defaultOptions.translationsFolder);

export const testCfg = {
	DEBUG: defaultOptions.debug,
	ROOT_PATH: rootPath,
	CUSTOM_FOLDER: defaultOptions.customFolder,
	TRANSLATIONS_FOLDER: defaultOptions.translationsFolder,
	OUTPUT_PATH: outpuPath,
	TRANSLATIONS_PATH: translationsPath,
};
