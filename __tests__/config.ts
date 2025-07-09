import getConfig from '../src/config';

test('Configuration test', () => {
	// get default config
	const CFG = getConfig();

	expect(CFG).toStrictEqual({
		DEBUG: true,
		ROOT_PATH: '/home/plosiniecki/Desktop/fp-nls',
		CUSTOM_FOLDER: 'custom',
		TRANSLATIONS_FOLDER: 'nls',
		OUTPUT_PATH: '/home/plosiniecki/Desktop/fp-nls/output',
		TRANSLATIONS_PATH: '/home/plosiniecki/Desktop/fp-nls/nls',
	});
});
