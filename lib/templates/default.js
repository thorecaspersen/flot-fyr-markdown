"use strict";

const _ = require("lodash");
const stringifyObject = require("stringify-object");

module.exports = data => {
  let prepended = "";
  if (data.prependJs !== undefined) {
    data.prependJs.forEach(m => {
      prepended += `${m}\n`;
    });
  }
  const importer = data.importer;
  // defualt import for every react components used in markdown
  // also it check the impoter list, if the component is in ther, then use that importer
  if (data.defualtImport && data.listOfReactComponentsUsed.length > 0) {
    data.listOfReactComponentsUsed.forEach(value => {
      // use special impoter, if it is defined in the impoter list

      if (importer && value in importer) {
        prepended += `import ${value} from '${importer[value]}/${value}';\n`;
      } else {
        prepended += `import ${value} from '${data.defualtImport}/${value}';\n`;
      }
    }); // eksampel: import button from 'tequila-ui/button';
  }
  // the import for all html tags that have been tranformted (f.eks. h1 -> headhline), then headline need a special import (if defined in import)
  if (data.defualtImport && data.allUsedHtmlToJsxTags.length > 0) {
    data.allUsedHtmlToJsxTags.forEach(value => {
      // the array contains empty string, so we hva to check for that
      if (value !== "") {
        // use special impoter, if it is defined in the impoter list
        if (importer && value in importer) {
          prepended += `import ${value} from '${importer[value]}/${value}';\n`;
        } else {
          prepended += `import ${value} from '${
            data.defualtImport
          }/${value}';\n`;
        }
      }
    }); // eksampel: import button from 'tequila-ui/button';
  }

  if (data.wrapper) {
    prepended += `import Wrapper from '${data.wrapper}';\n`;
  }

  let body = data.jsx;
  if (data.wrapper) {
    body = `<Wrapper {...props} frontMatter={frontMatter}>${body}</Wrapper>`;
  }

  const frontMatterComment = data.rawFrontMatter
    ? `/*---\n${data.frontMatter.title}\n---*/`
    : "";

  const js = `
    ${frontMatterComment}
    import React from 'react';
    ${prepended}
    const frontMatter = ${stringifyObject(
      _.omit(data.frontMatter, ["prependJs", "wrapper"])
    )};

    export default class ${data.name} extends React.PureComponent {
      render() {
        const props = this.props;
        return ${body};
      }
    }
  `;

  return js;
};
