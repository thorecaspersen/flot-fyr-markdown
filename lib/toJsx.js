"use strict";

const stripIndent = require("strip-indent");
const unified = require("unified");
const remarkParse = require("remark-parse");
const remarkRehype = require("remark-rehype");
const rehypeRaw = require("rehype-raw");
const tableCellStyle = require("./hastUtilTableCellStyle");
const parseablePlaceholders = require("./parseablePlaceholders");
const flotFyrHastCompiler = require("./flotFyrHastCompiler");

// Disable parsing of indented lines as code blocks. Indentation can be a little
// weird, because users might indent lines within interpolated tags, but the
// Markdown parser doesn't know about those tags. As a result, the Markdown
// parser should not trust indentation to indicate a code block.
delete remarkParse.Parser.prototype.blockTokenizers.indentedCode;

module.exports = (input, options) => {
  options = Object.assign(
    {
      delimiters: ["{{", "}}"],
      escapeDelimiter: "#",
      bodyWrapper: false,
      transformHtmlTags: {},
      removeHtmlTags: []
    },
    options
  );

  const parseable = parseablePlaceholders(
    input,
    options.delimiters,
    options.escapeDelimiter
  );

  const tidyMarkdown = stripIndent(parseable.text).trim();

  let unifiedProcessor = unified().use(remarkParse, { commonmark: true });

  if (options.remarkPlugins) {
    options.remarkPlugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        unifiedProcessor.use(plugin[0], plugin[1]);
      } else {
        unifiedProcessor.use(plugin);
      }
    });
  }

  // HTML comments qualify as "dangerous HTML" for rehype, because remark
  // passes them in as raw elements. That's why we need that option and need to
  // use rehype-raw.
  unifiedProcessor
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw)
    .use(() => tableCellStyle);

  if (options.rehypePlugins) {
    options.rehypePlugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        unifiedProcessor.use(plugin[0], plugin[1]);
      } else {
        unifiedProcessor.use(plugin);
      }
    });
  }

  unifiedProcessor.use(flotFyrHastCompiler, {
    placeholders: parseable.placeholders,
    htmlElementsToTransform: options.transformHtmlTags,
    htmlElementsToRemove: options.removeHtmlTags,
    cutSrcLinks: options.cutSrcLinks,
    bodyWrapper: options.bodyWrapper
  });

  const jsx = unifiedProcessor.processSync(tidyMarkdown).contents;

  return {
    jsx: jsx.jsx,
    uniqReactComponentName: parseable.allUniqueReactComponents,
    allUsedHtmlToJsxTags: jsx.allUsedHtmlToJsxTags
  };
};
