import {Configuration} from "../src/configuration";
import {expect, test} from "@jest/globals";
import * as fs from "fs";

const createConfigFile = () => {
    // create terraform.yaml file inside tmp folder
    const config = `
       default_workspace: prod
       pr_workspace: dev
       default_dir: .
       require_approval: true
    `
    const file = `/tmp/terraform.yaml`;
    fs.writeFileSync(file, config);
}

test("Get Configuration from data file", async() => {
    createConfigFile()
    const config = new Configuration(`/tmp`);
    const data = await config.getConfiguration();
    expect(data.default_workspace).toBe("prod");
    expect(data.default_dir).toBe(".");
    expect(data.require_approval).toBe(true);
    expect(data.pr_workspace).toBe("dev");
})