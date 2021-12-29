import { exec } from 'child_process';

export const setWorkspace = (ws: string) => {
	exec(
		`terraform workspace select ${ws} || terraform workspace new ${ws}`,
		(err, stdout, stderr) => {
			if (err) {
				throw new Error(err.message);
			}

			if (stderr) {
				throw new Error(stderr);
			}

			console.log(stdout);
		}
	);
};
