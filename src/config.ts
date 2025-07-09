import * as path from 'path';

interface Cfg {
	debug: boolean;
	root: string,
	custom: string;
	commonTranslationPaths: string;
	outputPath: string;
}

const defaultCfg = {
	debug: true,
	root: '../',
	custom: 'custom',
	commonTranslationPaths: 'nls',
	outputPath: 'output',
};

export default function getConfig(config: Cfg = defaultCfg) {
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
