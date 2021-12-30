import { exec } from 'child_process';
import * as core from '@actions/core';

export const setWorkspace = (ws: string) => {
	core.startGroup('Terraform Workspace');
	exec(
		`terraform workspace select ${ws} || terraform workspace new ${ws}`,
		(err, stdout, stderr) => {
			if (err) {
				console.error(err.message);
				throw new Error(err.message);
			}

			if (stderr) {
				console.error(stderr);
				throw new Error(stderr);
			}

			console.log(stdout);
		}
	);
	core.endGroup();
};
