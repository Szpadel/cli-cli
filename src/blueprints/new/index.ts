import {Blueprint, BlueprintParameter, Change} from "clicore";
import * as path from "path";
import * as Chalk from "chalk";

interface TemplateParams {
    [k: string]: string;
    __name__: string;
    __description__: string;
    __bin_name__: string;
    __author__: string;
    __config_file_name__: string;
}

const filesMap: [string, string][] = [
    ['cli.ts.txt', '__name__/src/cli.ts'],
    ['gitignore.txt', '__name__/.gitignore.ts'],
    ['package.json.txt', '__name__/package.json'],
    ['tsconfig.json.txt', '__name__/tsconfig.json']
];

export default //noinspection JSUnusedGlobalSymbols
class NewProjectBlueprint extends Blueprint {
    name = 'new';
    description = 'Create new cli project';
    options: BlueprintParameter[] = [
        {name: 'name', type: 'string', description: 'Cli tool name', require: true, ask: true},
        {name: 'description', type: 'string', description: 'Cli tool description', require: false, ask: true},
        {name: 'bin-name', type: 'string', description: 'Cli tool command line name', require: false, ask: false},
        {name: 'author', type: 'string', description: 'Author', require: true, ask: true},
        {
            name: 'config-file-name',
            type: 'string',
            description: 'Name of the config file for cli',
            require: false,
            ask: false
        }
    ];

    private templateParams: TemplateParams;

    prepare(options: {
        [k: string]: string | boolean;
    }): void {
        options['bin-name'] = options['bin-name'] !== undefined ? options['bin-name'] : options['name'];
        options['config-file-name'] = options['config-file-name'] !== undefined ? options['config-file-name'] : `.${options['name']}.json`;

        this.templateParams = {
            __name__: options['name'] as string,
            __description__: options['description'] as string,
            __bin_name__: options['bin-name'] as string,
            __author__: options['author'] as string,
            __config_file_name__: options['config-file-name'] as string,
        }
    }

    generateChanges(): Change[] {
        return [
            ...this.createFilesFromTemplates(path.join(__dirname, 'templates'), filesMap, this.templateParams)
        ];
    }

    async postApply() {
        console.log(Chalk.green('Installing node packages for you... this may take a while'));
        await this.executeCommand(this.templateParams.__name__, 'yarn || npm i');
    }

}
