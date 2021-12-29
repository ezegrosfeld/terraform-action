import { exec } from 'child_process';

export const plan = () => {
	exec('terraform plan', (err, stdout, stderr) => {
		if (err) {
			throw new Error(err.message);
		}

		if (stderr) {
			throw new Error(stderr);
		}

		console.log(stdout);
	});
};
