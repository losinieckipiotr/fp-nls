import * as path from 'path';

interface CfgOptions {
	debug: boolean;
	root: string,
	customFolder: string;
	translationsFolder: string;
	outputFolder: string;
}

interface Cfg {
	DEBUG: boolean;
	ROOT_PATH: string;
	CUSTOM_FOLDER: string;
	TRANSLATIONS_FOLDER: string;
	OUTPUT_PATH: string;
	TRANSLATIONS_PATH: string;
}

export const defaultOptions: CfgOptions = {
	debug: true,
	root: '../',
	customFolder: 'custom',
	translationsFolder: 'nls',
	outputFolder: 'output',
};

export function getConfig(config: CfgOptions = defaultOptions): Cfg {
	const DEBUG = config.debug;
	const ROOT_PATH = path.resolve(path.join(__dirname, config.root));
	const CUSTOM_FOLDER = config.customFolder;
	const TRANSLATIONS_FOLDER = config.translationsFolder;
	const OUTPUT_PATH = path.join(ROOT_PATH, config.outputFolder);
	const TRANSLATIONS_PATH = path.join(ROOT_PATH, TRANSLATIONS_FOLDER);

	const CFG: Cfg = {
		DEBUG,
		ROOT_PATH,
		CUSTOM_FOLDER,
		TRANSLATIONS_FOLDER,
		OUTPUT_PATH,
		TRANSLATIONS_PATH,
	};

	return CFG;
}
