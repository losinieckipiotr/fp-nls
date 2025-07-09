import { testCustomData, testJsonData, testMergeResult } from '../../__mocks__/data';
import { debug } from '../../src/debug';
import { mergeJsonData } from '../../src/main';

jest.mock('../../src/debug', () => {
	return {
		debug: jest.fn(() => {}),
	};
});

test('mergeJsonData', () => {
	expect(mergeJsonData(testCustomData, testJsonData)).toStrictEqual(testMergeResult);
	expect(debug).toHaveBeenCalledTimes(1);
});
