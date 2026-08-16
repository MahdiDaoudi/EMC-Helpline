const fs = require("fs");
const path = require("path");

const moduleName = process.argv[2];

if (!moduleName) {
  console.log("Usage: npm run make <module-name>");
  process.exit(1);
}

if (!moduleName.endsWith("s")) {
  console.log("Module name must be plural.");
  console.log("Example: users, products, orders");
  process.exit(1);
}

const moduleDir = path.join(__dirname, "..", "src", "modules", moduleName);

if (fs.existsSync(moduleDir)) {
  console.log(`Module "${moduleName}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(moduleDir, { recursive: true });

const singularName = moduleName.slice(0, -1);
const pascalName = singularName.charAt(0).toUpperCase() + singularName.slice(1);

const controller = `
import { Request, Response } from "express";
import * as ${moduleName}Service from "./${moduleName}.service";
import { Create${pascalName}Dto, Update${pascalName}Dto } from "./${moduleName}.schema";

export async function get${pascalName}s(req: Request, res: Response) {
    const result = await ${moduleName}Service.getAll${pascalName}s();
    res.json(result);
}

export async function get${pascalName}(req: Request<{ id: string }>, res: Response) {
    const result = await ${moduleName}Service.get${pascalName}ById(Number(req.params.id));
    res.json(result);
}

export async function create${pascalName}(
    req: Request<{}, {}, Create${pascalName}Dto>,
    res: Response
) {
    const result = await ${moduleName}Service.add${pascalName}(req.body);
    res.status(201).json(result);
}

export async function update${pascalName}(
    req: Request<{ id: string }, {}, Update${pascalName}Dto>,
    res: Response
) {
    const result = await ${moduleName}Service.update${pascalName}(Number(req.params.id), req.body);
    res.json(result);
}

export async function delete${pascalName}(
    req: Request<{ id: string }>,
    res: Response
) {
    await ${moduleName}Service.delete${pascalName}(Number(req.params.id));
    res.status(204).send();
}`;

const service = `
import * as ${moduleName}Repository from "./${moduleName}.repository";
import { Create${pascalName}Dto, Update${pascalName}Dto } from "./${moduleName}.schema";

export function getAll${pascalName}s() {
    return ${moduleName}Repository.findAll();
}

export function get${pascalName}ById(id: number) {
    return ${moduleName}Repository.findById(id);
}

export function add${pascalName}(data: Create${pascalName}Dto) {
    return ${moduleName}Repository.create(data);
}

export function update${pascalName}(id: number, data: Update${pascalName}Dto) {
    return ${moduleName}Repository.update(id, data);
}

export function delete${pascalName}(id: number) {
    return ${moduleName}Repository.deleteById(id);
}`;

const repository = `import { prisma } from "../../config/prisma";
import { Create${pascalName}Dto, Update${pascalName}Dto } from "./${moduleName}.schema";

export function findAll() {}

export function findById(id: number) {}

export function create(data: Create${pascalName}Dto) {}

export function update(id: number, data: Update${pascalName}Dto) {}

export function deleteById(id: number) {}`;

const routes = `import { Router } from "express";
import * as ${moduleName}Controller from "./${moduleName}.controller";
import { validate } from "../../middleware/validate";
import {
    create${pascalName}Schema,
    update${pascalName}Schema,
} from "./${moduleName}.schema";

const ${moduleName}Router = Router();

${moduleName}Router.get("/", ${moduleName}Controller.get${pascalName}s);
${moduleName}Router.get("/:id", ${moduleName}Controller.get${pascalName});
${moduleName}Router.post("/", validate(create${pascalName}Schema), ${moduleName}Controller.create${pascalName});
${moduleName}Router.patch("/:id", validate(update${pascalName}Schema), ${moduleName}Controller.update${pascalName});
${moduleName}Router.delete("/:id", ${moduleName}Controller.delete${pascalName});

export { ${moduleName}Router };`;

const schema = `import { z } from "zod";

export const create${pascalName}Schema = z.object({

});

export const update${pascalName}Schema = create${pascalName}Schema.partial();

export type Create${pascalName}Dto = z.infer<typeof create${pascalName}Schema>;
export type Update${pascalName}Dto = z.infer<typeof update${pascalName}Schema>;`;

const templates: Record<string, string> = {
  [`${moduleName}.controller.ts`]: controller,
  [`${moduleName}.repository.ts`]: repository,
  [`${moduleName}.service.ts`]: service,
  [`${moduleName}.routes.ts`]: routes,
  [`${moduleName}.schema.ts`]: schema,
  [`${moduleName}.types.ts`]: "\n",
};

for (const [file,content] of Object.entries(templates)) {
  fs.writeFileSync(path.join(moduleDir, file),content );
}

console.log(`Module "${moduleName}" created successfully.`);
