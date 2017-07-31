import {Blueprint, BlueprintParameter, Change, InsertChange, ValidationError} from "clicore";
import * as path from "path";
import * as fs from 'fs-extra';
import {FileGenerator} from "clicore/dist/file-generator";

interface TemplateParams {
    [k: string]: string;
    __name__: string;
    __description__: string;
    __files_map__: string;
}

const filesMap: [string, string][] = [
    ['index.ts.txt', 'src/blueprints/__name__/index.ts'],
];

export default //noinspection JSUnusedGlobalSymbols
class NewProjectBlueprint extends Blueprint {
    name = 'blueprint-from-files';
    description = 'Create new blueprint basing on existing files';
    options: BlueprintParameter[] = [
        {name: 'name', type: 'string', description: 'Blueprint name', require: true, ask: true},
        {name: 'description', type: 'string', description: 'Blueprint description', require: true, ask: true},
        {
            name: 'path',
            type: 'dir',
            description: 'Path to directory with files on with blueprint should be based',
            require: true,
            ask: true
        },
    ];

    private templateParams: TemplateParams;
    private templateFiles: Change[] = [];
    private filesMap: string[] = [];

    readFiles(dir: string, blueprintName: string) {
        this.walkDir(dir, (file) => {
            const relative = path.relative(dir, file);
            this.templateFiles.push(
                new InsertChange(
                    `src/blueprints/${blueprintName}/templates/${relative}.txt`,
                    0,
                    fs.readFileSync(file, 'utf-8')
                )
            );
            this.filesMap.push(`['${relative}.txt', '${relative}'],`);
        });
    }

    walkDir(dir: string, cb: (file: string) => void) {
        const entities = fs.readdirSync(dir)
            .map((f) => path.join(dir, f));

        entities
            .filter((f) => fs.statSync(f).isFile())
            .forEach(cb);

        entities
            .filter((f) => fs.statSync(f).isDirectory())
            .forEach((d) => this.walkDir(d, cb));
    }

    precondition(): Promise<boolean> {
        // file must exist
        return new Promise((r) => fs.exists('src/cli.ts', r));
    }

    prepare(options: {
        [k: string]: string | boolean;
    }): void {
        const blueprintName = options['name'] as string;
        this.readFiles(options.path as  string, blueprintName);

        const fg = new FileGenerator(path.join(__dirname, 'templates', 'index.ts.txt'));
        const indexContent = fg.render({
            __name__: options['name'] as string,
            __description__: options['description'] as string,
            __files_map__: this.filesMap
                .map((l) => `    ${l}`)
                .join('\n')
        });
        this.templateFiles.push(new InsertChange(`src/blueprints/${blueprintName}/index.ts`, 0, indexContent));
    }

    generateChanges(): Change[] {
        return [
            ...this.templateFiles
        ];
    }

}
