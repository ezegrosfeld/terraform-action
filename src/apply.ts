import { exec } from 'child_process';

export const apply = () => {
	exec('terraform apply', (err, stdout, stderr) => {
		if (err) {
			throw new Error(err.message);
		}

		if (stderr) {
			throw new Error(stderr);
		}

		console.log(stdout);
	});
};
