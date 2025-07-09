import { getConfig } from '../src/config';
import { testCfg } from '../__mocks__/testCfg';

test('Configuration test', () => {
	// get default config
	const CFG = getConfig();

	expect(CFG).toStrictEqual(testCfg);
});
