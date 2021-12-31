import { exec } from 'child_process';
import { apply } from './apply';
import { plan } from './plan';
import { Commands } from './utils/cmd';
import { setWorkspace } from './workspace';
import * as core from '@actions/core';

export const executeTerraform = async (
	cmd: Commands,
	dir: string,
	workspace: string
): Promise<void> => {
	try {
		let ws = 'dev';
		if (workspace !== '') {
			ws = workspace;
		}

		switch (cmd) {
			case Commands.Plan:
				terraformInit(ws, plan);
			case Commands.Apply:
				terraformInit(ws, apply);
			default:
				break;
		}
	} catch (e: any) {
		throw new Error(e);
	}
};

const terraformInit = (ws: string, fn: () => void) => {
	core.startGroup('Terraform Init');
	exec('terraform init', (err, stdout, stderr) => {
		if (err) {
			throw new Error(err.message);
		}

		if (stderr) {
			throw new Error(stderr);
		}

		console.log(stdout);
		core.endGroup();
		setWorkspace(ws, fn);
	});
};
