"use strict";

const hastToJsx = require("./hastUtilToJsx");
const parse = require("url-parse");

module.exports = function flotFyrHastCompiler(options) {
  const placeholders = options.placeholders;

  this.Compiler = compiler;

  function compiler(ast) {
    const jsxWithPlaceholders = hastToJsx(ast, options);

    // jsxWithPlaceholders.htmlToJsx = a array of all used htmltags to jsxtags
    // [ 'headline', ''. '', '', '',  'quotes', '', '', '', '', 'headline']
    // empty strings in the array is element that didt not match, so we have to remove dublicated:
    let uniqElementNames = [...new Set(jsxWithPlaceholders.htmlToJsx)];

    let result = jsxWithPlaceholders.element;

    Object.keys(placeholders).forEach(matchId => {
      const data = placeholders[matchId];
      if (!data.isTag) {
        // Expressions.
        result = result.replace(data.representation, `{${data.value}}`);
      } else if (data.isInline) {
        // Inline-level JSX elements.
        result = result.replace(data.representation, data.value);
      } else {
        // Block-level JSX elements.
        const blockPlaceholders = new RegExp(
          `<div data-flotfyr-placeholder=[{"]${matchId}[}"]\\s*/>`,
          "g"
        );
        result = result.replace(blockPlaceholders, data.value);
      }
    });

    // Alter href and src attributes, which might contain placeholders.
    result = result.replace(
      /(href|src)=(?:"([^"]+)"|{(.*)})/g,
      (match, p1, p2, p3) => {
        const rawUrl = p2 || p3;
        if (!/{/.test(rawUrl)) return match;
        let urlWithPlaceholders = rawUrl.replace(/{/g, "${");
        return `${p1}={\`${urlWithPlaceholders}\`}`;
      }
    );

    // if the options cutSrcLinks is set to true. Then:
    // change src link: remove domain.
    if (options.cutSrcLinks) {
      result = result.replace(
        /(src)=(?:"([^"]+)"|{(.*)})/g,
        (match, p1, p2, p3) => {
          const rawUrl = p2 || p3;
          let newUrl = parse(rawUrl, true);
          // test that is it not a url with placeholders
          if (!/{/.test(rawUrl)) {
            // newUrl.pathname is everything after the domain: https://octodex.github.com/images/yaktocat.png -> /images/yaktocat.png
            return `${p1}="${newUrl.pathname}"`;
          }
        }
      );
    }

    return {
      jsx: result,
      allUsedHtmlToJsxTags: uniqElementNames
    };
  }
};
