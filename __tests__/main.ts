import { debug } from '../src/main';

test('debug function should call console.log with multiple arguments', () => {
	const spy = jest.spyOn(console, 'log').mockImplementation();

	const args = [
		'arg1',
		'arg2',
		3,
		{arg: 4},
	];

	debug('test');
	debug(...args);

	expect(console.log).toHaveBeenCalledTimes(2);
	expect(console.log).toHaveBeenNthCalledWith(1, 'test');
	expect(console.log).toHaveBeenNthCalledWith(2, ...args);

	spy.mockRestore();
});
