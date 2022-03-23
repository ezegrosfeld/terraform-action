import * as path from "path";
import * as fs from "fs";
import {load} from "js-yaml";

// get configuration from terraform.yaml file

export interface TerraformConfiguration {
    default_workspace: string;
    pr_workspace: string;
    default_dir: string;
    require_approval: boolean;
}

export class Configuration {
    #configuration: TerraformConfiguration;

    constructor(configPath: string) {
        this.#configuration = this.#getConfiguration(configPath);
    }

    #getConfiguration = (configPath: string): any => {
        const filePath = path.join(configPath, "terraform.yaml")
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return load(fileContent) as TerraformConfiguration;
    }

    getConfiguration = (): TerraformConfiguration => {
        return this.#configuration;
    }
}