import { exec } from 'child_process';
import * as core from '@actions/core';

export const apply = () => {
	core.startGroup('Terraform Apply');
	exec('terraform apply', (err, stdout, stderr) => {
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
