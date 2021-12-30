import { exec } from 'child_process';
import * as core from '@actions/core';

export const setWorkspace = async (ws: string) => {
	core.startGroup('Terraform Workspace');
	await exec(
		`terraform workspace select ${ws} || terraform workspace new ${ws}`,
		(err, stdout, stderr) => {
			if (err) {
				throw new Error(err.message);
			}

			if (stderr) {
				throw new Error(stderr);
			}

			core.info(`Workspace set to ${ws}`);
			core.info(stdout);
			console.log(stdout);
		}
	);
	core.endGroup();
};
