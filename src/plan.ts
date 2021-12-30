import { exec } from 'child_process';
import * as core from '@actions/core';

export const plan = () => {
	core.startGroup('Terraform Plan');
	exec('terraform plan', (err, stdout, stderr) => {
		if (err) {
			throw new Error(err.message);
		}

		if (stderr) {
			throw new Error(stderr);
		}

		console.log(stdout);
	});
	core.endGroup();
};
