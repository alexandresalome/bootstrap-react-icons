#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

//
// Template used for the index file
//
const indexTemplate = (classNames: string[]) => `${HEADER}

// Props type
export type IconProps = {
    size?: number;
    className?: string;
}

// Imports
${classNames.map(
    (className: string) => `import ${className} from './${className}';`
).join("\n")}

// Exports
export {${classNames.join(", ")}};
`;

//
// Template used for icon class files
//
const classTemplate = (className: string, file: string,) => `${HEADER}

import { ReactComponent } from "bootstrap-icons/icons/${file}";
import { IconProps } from "./index";

export default function ${className}(props: IconProps) {
    const size = props.size || 16;
    const className = props.className;

    return (<ReactComponent
        width={size}
        height={size}
        className={\`bi \${className}\`}
    />);
}
`;

//
// Program
//
listAndWriteFiles(
    `${__dirname}/node_modules/bootstrap-icons/icons`,
    `${__dirname}/dist`,
    `${__dirname}/dist/index.ts`,
);

//
// Library
//
const HEADER = "// This code is generated. Do not modify it";

function listAndWriteFiles(dir: string, classOutputDir: string, indexOutputFile: string) {
    if (!fs.existsSync(classOutputDir)) {
        fs.mkdirSync(classOutputDir);
    }

    fs.readdir(dir, (err: Error, files: string[]) => {
        if (err) {
            console.error('Error reading directory:', err);

            return;
        }

        const classNames = writeClassFiles(files, classOutputDir);
        writeFile(indexOutputFile, indexTemplate(classNames));
    });
}

function writeClassFiles(files: string[], classOutputDir: string): string[] {
    const classNames: string[] = [];

    files.forEach(file => {
        const className = `${createClassName(file)}Icon`;
        classNames.push(className);

        const fileContent = classTemplate(className, file);
        writeFile(`${classOutputDir}/${className}.tsx`, fileContent);
    });

    return classNames;
}

function createClassName(file: string) {
    const fileNameWithoutExtension = path.parse(file).name;
    const numberNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const className = camelCase(fileNameWithoutExtension);
    const matches = fileNameWithoutExtension.match(/^\d+/g);
    if (!matches) {
        return className;
    }

    const transformedName = matches[0].split('').reduce((previousValue: number, match: string) => {
        const number = parseInt(match, 10);
        const numberName = numberNames[number];
        return previousValue + numberName;
    }, '');

    if (transformedName === "undefined") {
        console.log(file, fileNameWithoutExtension, className, matches);
    }

    return transformedName + className.slice(matches.join('').length);
}

function writeFile(file: string, content: string): void {
    fs.writeFile(file, content, (err: Error) => {
        if (err) {
            console.error('Error writing to file:', err);
        }
    });
}

function camelCase(text: string) {
    return capitalizeFirstCharacter(text.replace(/[-_]+(.)?/g, (_, c) => c ? c.toUpperCase() : ''));
}

function capitalizeFirstCharacter(inputString: string) {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}
