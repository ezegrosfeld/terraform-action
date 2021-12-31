import { exec } from 'child_process';
import * as core from '@actions/core';

export const setWorkspace = (ws: string, fn: () => void) => {
	exec(
		`terraform workspace select ${ws} || terraform workspace new ${ws}`,
		(err, stdout, stderr) => {
			core.startGroup('Terraform Workspace');
			if (err) {
				throw new Error(err.message);
			}

			if (stderr) {
				throw new Error(stderr);
			}

			console.log(stdout);
			core.endGroup();
			fn();
		}
	);
};
