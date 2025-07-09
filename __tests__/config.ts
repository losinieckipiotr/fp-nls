import { getConfig } from '../src/config';

test('Configuration test', () => {
	// get default config
	const CFG = getConfig();

	expect(CFG).toStrictEqual({
			DEBUG: false,
			ROOT_PATH: './',
			CUSTOM_FOLDER: 'custom',
			TRANSLATIONS_FOLDER: 'nls',
			OUTPUT_FOLDER: 'output',
	});
});
