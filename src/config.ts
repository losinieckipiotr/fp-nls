export interface CfgOptions {
	debug: boolean;
	root: string,
	customFolder: string;
	translationsFolder: string;
	outputFolder: string;
}

export interface Cfg {
	DEBUG: boolean;
	ROOT_PATH: string;
	CUSTOM_FOLDER: string;
	TRANSLATIONS_FOLDER: string;
	OUTPUT_FOLDER: string;
}

export const defaultOptions: CfgOptions = {
	debug: false,
	root: './',
	customFolder: 'custom',
	translationsFolder: 'nls',
	outputFolder: 'output',
};

export function getConfig(config: CfgOptions = defaultOptions): Cfg {
	const CFG: Cfg = {
		DEBUG: config.debug,
		ROOT_PATH: config.root,
		CUSTOM_FOLDER: config.customFolder,
		TRANSLATIONS_FOLDER: config.translationsFolder,
		OUTPUT_FOLDER: config.outputFolder,
	};

	return CFG;
}
