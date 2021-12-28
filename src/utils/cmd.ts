export enum Commands {
	Null = 0,
	Plan = 'plan',
	Apply = 'apply',
	PlanDestroy = 'plan-destroy',
	ApplyDestroy = 'apply-destroy'
}

export const getCommand = (c: string): Commands => {
	const command = c.match(/terraform\s(\w+)/);
	const cmd = command ? command[1] : '';
	switch (cmd) {
		case Commands.Plan:
			return Commands.Plan;
		case Commands.Apply:
			return Commands.Apply;
		case Commands.PlanDestroy:
			return Commands.PlanDestroy;
		case Commands.ApplyDestroy:
			return Commands.ApplyDestroy;
		default:
			return Commands.Null;
	}
};

export const isCommand = (c: string): boolean => {
	const command = c.match(/terraform\s(\w+)/);
	return command ? true : false;
};
