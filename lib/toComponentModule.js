"use strict";

const _ = require("lodash");
const babel = require("babel-core");
const presetEnv = require("babel-preset-env");
const presetReact = require("babel-preset-react");
const frontMatter = require("front-matter");
const pascalCase = require("pascal-case");
const toJsx = require("./toJsx.js");
const remarkExtractHeadings = require("./remarkExtractHeadings");
const defaultTemplate = require("./templates/default");

module.exports = (input, options) => {
  options = Object.assign(
    {
      name: "MarkdownReact",
      prependJs: [],
      precompile: false,
      headings: false,
      remarkPlugins: [],
      defualtImport: false,
      importer: false,
      cutSrcLinks: false
    },
    options
  );

  if (options.headings) {
    options.remarkPlugins = [remarkExtractHeadings.plugin].concat(
      options.remarkPlugins
    );
  }

  const frontMatterResult = frontMatter(input);
  const toJsxData = toJsx(frontMatterResult.body, options); // it give jsx AND react components used list

  const extendedFrontMatter = frontMatterResult.attributes;
  if (options.headings && !extendedFrontMatter.headings) {
    extendedFrontMatter.headings = remarkExtractHeadings.getHeadings();
  }
  const jsx = toJsxData.jsx;
  const templateData = {
    name: pascalCase(options.name),
    rawFrontMatter: frontMatterResult.frontmatter,
    frontMatter: extendedFrontMatter,
    wrapper: frontMatterResult.attributes.wrapper || options.wrapper,
    defualtImport: options.defualtImport,
    importer: options.importer,
    listOfReactComponentsUsed: toJsxData.uniqReactComponentName, // new data of all react components used
    allUsedHtmlToJsxTags: toJsxData.allUsedHtmlToJsxTags, // new data of all html to jsx element used (so we also can make special import for them)
    prependJs: _.union(
      options.prependJs,
      frontMatterResult.attributes.prependJs
    ),
    jsx
  };

  if (options.template) return options.template(templateData);
  const code = defaultTemplate(templateData);
  if (!options.precompile) return code;
  return babel.transform(code, { presets: [presetEnv, presetReact] }).code;
};
