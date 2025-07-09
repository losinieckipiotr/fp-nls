import { isJsonData } from '../src/json-data';

test('isJsonData', () => {
	expect(isJsonData(undefined)).toBe(false);
	expect(isJsonData(null)).toBe(false);
	expect(isJsonData('')).toBe(false);
	expect(isJsonData('a')).toBe(false);
	expect(isJsonData(0)).toBe(false);
	expect(isJsonData(NaN)).toBe(false);

	expect(isJsonData({prop1: '1', prop2: 2})).toBe(false);
	expect(isJsonData({prop1: 1, prop2: '2'})).toBe(false);

	expect(isJsonData({prop1: '1', prop2: '2'})).toBe(true);
	expect(isJsonData({prop1: 'a', prop2: 'b'})).toBe(true);
	expect(isJsonData({ prop: '' })).toBe(true);
	expect(isJsonData({})).toBe(true);
});
