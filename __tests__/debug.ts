import { debug } from '../src/debug';

jest.mock('../src/config');

test('debug function should call console.log with multiple arguments only if debug flag is true', () => {
	jest.spyOn(console, 'log').mockImplementation();

	const args = [
		'arg1',
		'arg2',
		3,
		{arg: 4},
	];

	debug(false, 'test');
	debug(false, ...args);

	expect(console.log).not.toHaveBeenCalled();

	debug(true, 'test');
	debug(true, ...args);

	expect(console.log).toHaveBeenCalledTimes(2);
	expect(console.log).toHaveBeenNthCalledWith(1, 'test');
	expect(console.log).toHaveBeenNthCalledWith(2, ...args);
});
