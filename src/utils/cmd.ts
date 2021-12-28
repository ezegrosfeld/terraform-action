export const getCommand = (c: string): string => {
	const command = c.match(/terraform\s(\w+)/);
	return command ? command[1] : '';
};

export const isCommand = (c: string): boolean => {
	const command = c.match(/terraform\s(\w+)/);
	return command ? true : false;
};
