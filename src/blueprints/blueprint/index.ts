import {Blueprint, BlueprintParameter, Change, ValidationError} from "clicore";
import * as path from "path";
import * as fs from "fs-extra";

interface TemplateParams {
    [k: string]: string;
    __name__: string;
    __description__: string;
}

const filesMap: [string, string][] = [
    ['index.ts.txt', 'src/blueprints/__name__/index.ts'],
    ['README.md.txt', 'src/blueprints/__name__/templates/README.md'],
];

export default //noinspection JSUnusedGlobalSymbols
class NewProjectBlueprint extends Blueprint {
    name = 'blueprint';
    description = 'Create new blueprint';
    options: BlueprintParameter[] = [
        {name: 'name', type: 'string', description: 'Blueprint name', require: true, ask: true},
        {name: 'description', type: 'string', description: 'Blueprint description', require: true, ask: true},
    ];

    private templateParams: TemplateParams;

    precondition(): Promise<boolean> {
        // file must exist
        return new Promise((r) => fs.exists('src/cli.ts', r));
    }

    prepare(options: {
        [k: string]: string | boolean;
    }): void {
        this.templateParams = {
            __name__: options['name'] as string,
            __description__: options['description'] as string,
        }
    }

    generateChanges(): Change[] {
        return [
            ...this.createFilesFromTemplates(path.join(__dirname, 'templates'), filesMap, this.templateParams)
        ];
    }

}
