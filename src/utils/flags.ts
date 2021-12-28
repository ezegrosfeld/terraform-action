export const getDir = (c: string): string => {
	const dir = c.match(/-d\s(\w+\S+(\w))/);
	return dir ? dir[1] : '';
};

export const getWorkspace = (c: string): string => {
	const workspace = c.match(/-w\s(\w+\S+(\w))/);
	return workspace ? workspace[1] : '';
};
