import { exec } from 'child_process';
import * as core from '@actions/core';

export const plan = () => {
	exec('terraform plan', (err, stdout, stderr) => {
		core.startGroup('Terraform Plan');

		if (err) {
			throw new Error(err.message);
		}

		if (stderr) {
			throw new Error(stderr);
		}

		console.log(stdout);
		core.endGroup();
	});
};
