import { parse } from "@babel/parser";
import * as esbuild from "esbuild";
import fs from "fs/promises";
import MagicString from "magic-string";
import path from "path";
import resolveConfig from "tailwindcss/resolveConfig";
import { existsSync } from "fs";
import type { Plugin } from "vite";
import type { JSXElement, JSXOpeningElement } from "@babel/types";

// Utility to find root
function findProjectRoot(startPath = process.cwd()): string {
  try {
    let currentPath = startPath;
    let count = 0;
    while (currentPath !== path.parse(currentPath).root && count < 20) {
      if (existsSync(path.join(currentPath, "package.json"))) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
      count++;
    }
    return process.cwd();
  } catch (error) {
    console.error("Error finding project root:", error);
    return process.cwd();
  }
}

// Skip tagging 3D elements
function shouldTagElement(elementName: string): boolean {
  return !["mesh", "camera", "scene", "ambientLight"].includes(elementName); // simplified
}

// Plugin logic
export function componentTaggerCustom(): Plugin {
  const projectRoot = findProjectRoot();
  const tailwindInputFile = path.resolve(projectRoot, "./tailwind.config.ts");
  const tailwindJsonOutfile = path.resolve(projectRoot, "./src/tailwind.config.lov.json");
  const tailwindIntermediateFile = path.resolve(projectRoot, "./.lov.tailwind.config.js");
  const isSandbox = process.env.LOVABLE_DEV_SERVER === "true";
  const validExtensions = new Set([".jsx", ".tsx"]);

  return {
    name: "vite-plugin-component-tagger-custom",
    enforce: "pre",

    async transform(code, id) {
      if (!validExtensions.has(path.extname(id)) || id.includes("node_modules")) return null;

      const cwd = process.cwd();
      const relativePath = path.relative(cwd, id);
      const parserOptions = {
        sourceType: "module",
        plugins: ["jsx", "typescript"] as const
      };

      try {
        const ast = parse(code, parserOptions);
        const magicString = new MagicString(code);
        let currentElement: JSXElement | null = null;

        const { walk } = await import("estree-walker");
        walk(ast, {
          enter(node: any) {
            if (node.type === "JSXElement") {
              currentElement = node;
            }

            if (node.type === "JSXOpeningElement") {
              const jsxNode = node as JSXOpeningElement;
              let elementName = "";

              if (jsxNode.name.type === "JSXIdentifier") {
                elementName = jsxNode.name.name;
              } else if (jsxNode.name.type === "JSXMemberExpression") {
                elementName = `${jsxNode.name.object.name}.${jsxNode.name.property.name}`;
              } else {
                return;
              }

              // Gather useful content
              const attributes = jsxNode.attributes.reduce<Record<string, string>>((acc, attr: any) => {
                if (attr.type === "JSXAttribute") {
                  if (attr.value?.type === "StringLiteral") {
                    acc[attr.name.name] = attr.value.value;
                  } else if (
                    attr.value?.type === "JSXExpressionContainer" &&
                    attr.value.expression.type === "StringLiteral"
                  ) {
                    acc[attr.name.name] = attr.value.expression.value;
                  }
                }
                return acc;
              }, {});

              let textContent = "";
              if (currentElement?.children) {
                textContent = currentElement.children
                  .map((child: any) => {
                    if (child.type === "JSXText") {
                      return child.value.trim();
                    } else if (
                      child.type === "JSXExpressionContainer" &&
                      child.expression.type === "StringLiteral"
                    ) {
                      return child.expression.value;
                    }
                    return "";
                  })
                  .filter(Boolean)
                  .join(" ")
                  .trim();
              }

              const content: Record<string, string> = {};
              if (textContent) content.text = textContent;
              if (attributes.placeholder) content.placeholder = attributes.placeholder;
              if (attributes.className) content.className = attributes.className;

              const line = jsxNode.loc?.start?.line ?? 0;
              const col = jsxNode.loc?.start?.column ?? 0;
              const fileName = path.basename(id);
              const componentId = `${relativePath}:${line}:${col}`;

              if (shouldTagElement(elementName)) {
                const attrString = ` 
                  data-mwf-id="${componentId}" 
                  data-mwf-name="${elementName}" 
                  data-mwf-path="${relativePath}" 
                  data-mwf-line="${line}" 
                  data-mwf-file="${fileName}" 
                  data-mwf-component="${elementName}" 
                  data-mwf-content="${encodeURIComponent(JSON.stringify(content))}"`;

                magicString.appendLeft(jsxNode.name.end ?? 0, attrString);
              }
            }
          }
        });

        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true })
        };
      } catch (error) {
        console.error(`Error processing file ${relativePath}:`, error);
        return null;
      }
    },

    async buildStart() {
      if (!isSandbox) return;
      await generateTailwindConfig(tailwindInputFile, tailwindIntermediateFile, tailwindJsonOutfile);
    },

    configureServer(server) {
      if (!isSandbox) return;
      server.watcher.add(tailwindInputFile);
      server.watcher.on("change", async (changedPath) => {
        if (path.normalize(changedPath) === path.normalize(tailwindInputFile)) {
          await generateTailwindConfig(tailwindInputFile, tailwindIntermediateFile, tailwindJsonOutfile);
        }
      });
    }
  };
}

// Tailwind config generator
async function generateTailwindConfig(input: string, intermediate: string, output: string) {
  try {
    await esbuild.build({
      entryPoints: [input],
      outfile: intermediate,
      bundle: true,
      format: "esm",
      banner: {
        js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
      }
    });

    const userConfig = await import(intermediate + "?update=" + Date.now());
    if (!userConfig?.default) throw new Error("Invalid Tailwind config");

    const resolvedConfig = resolveConfig(userConfig.default);
    await fs.writeFile(output, JSON.stringify(resolvedConfig, null, 2));
    await fs.unlink(intermediate).catch(() => {});
  } catch (err) {
    console.error("Tailwind config generation failed:", err);
  }
}
