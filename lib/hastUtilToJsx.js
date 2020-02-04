"use strict";

const postcss = require("postcss");
const postcssJs = require("postcss-js");
const reactAttrConverter = require("react-attr-converter");
const propertyInformation = require("property-information");
const kebabCase = require("kebab-case");
const stringifyEntities = require("stringify-entities");
const stringifyObject = require("stringify-object");

let ALL_HTML_JSX_TAGS = [];

function addElementToList(newHtmlToJsx) {
  if (!ALL_HTML_JSX_TAGS.includes(newHtmlToJsx)) {
    ALL_HTML_JSX_TAGS.push(newHtmlToJsx);
  }
}

// Render all of a node's children to a single string.
function renderChildren(ctx, parent, index) {
  if (!parent.children || parent.children.length === 0) {
    // let data = renderNode(ctx, node, index, parent);
    return {
      allNotes: null
    };
  }
  // let htmlToJsxTag = [];
  let all = parent.children
    .map((node, index) => {
      let data = renderNode(ctx, node, index, parent);
      addElementToList(data.htmlToJsx);
      return data.element;
    })
    .join("");
  return {
    allNotes: all
  };
}

function renderElement(ctx, node) {
  const tagName = node.tagName;
  let elementName;

  // oldElementName is for remeber tag name. Forexsampel we change pre to codeView,
  // then the pre content still need the to be transformed
  // (see the if for textarea, style and pre)
  let oldElementName = tagName;
  // this is for keeping track of the change tags. so we can make a special import for that later
  // forexsampel h1 to headline, then we need to import the headline component in the end file.
  let UsedHtmlToJsxTag = "";
  // If the element is set to be tranformted in the options to some react component.
  if (tagName in ctx.htmlElementsToTransform) {
    // then use that:
    elementName = ctx.htmlElementsToTransform[tagName];
    UsedHtmlToJsxTag = ctx.htmlElementsToTransform[tagName];
  } else if (ctx.htmlElementsToRemove.includes(tagName.toString())) {
    // if the element is set to be removed in the options, then return empty string
    return "";
  } else {
    elementName = tagName;
  }
  let renderedChildrenData = renderChildren(
    ctx,
    elementName === "template" || oldElementName === "template"
      ? node.content
      : node
  );
  let renderedChildren = renderedChildrenData.allNotes;
  let props = hastPropertiesToJsxProps(node.properties, elementName);
  if (ctx.transformElement) {
    const transformed = ctx.transformElement(elementName, props);
    if (transformed) {
      elementName = transformed.name || elementName;
      props = transformed.props || props;
    }
  }

  let renderedProps = renderProps(props);
  if (renderedProps) {
    renderedProps = ` ${renderedProps}`;
  }

  if (!renderedChildren) {
    return `<${elementName}${renderedProps} />`;
  }

  if (elementName === "textarea" || oldElementName === "textarea") {
    const dangerousChild = JSON.stringify(renderedChildren);
    return `<textarea${renderedProps} defaultValue=${dangerousChild} />`;
  }
  if (elementName === "style" || oldElementName === "style") {
    const dangerousChild = JSON.stringify(renderedChildren);
    return `<style${renderedProps} dangerouslySetInnerHTML={{__html: ${dangerousChild} }} />`;
  }

  if (elementName === "pre" || oldElementName === "pre") {
    renderedChildren = renderedChildren.replace(
      /( {2,}|\n|\t)/g,
      whitespace => {
        return `{${JSON.stringify(whitespace)}}`;
      }
    );
  }

  return {
    tag: `<${elementName}${renderedProps}>${renderedChildren}</${elementName}>`,
    usedHtmlToJsxTag: UsedHtmlToJsxTag
  };
}

// Transform a HAST property name to its HTML equivalent.
function hastPropertyNameToHtmlName(hastName) {
  if (hastName === "className") {
    return "class";
  }
  if (hastName === "htmlFor") {
    return "for";
  }
  const kebabed = kebabCase(hastName);
  return kebabed.replace(/^(data|aria)([0-9])/, "$1-$2");
}

// Transform an object of HAST properties to a props object
// that is suitable for a React component.
function hastPropertiesToJsxProps(hastProperties, elementName) {
  return Object.keys(hastProperties).reduce((result, hastName) => {
    let value = hastProperties[hastName];

    if (value === undefined || (typeof value == "number" && isNaN(value))) {
      return result;
    }

    const htmlName = hastPropertyNameToHtmlName(hastName);
    const info = propertyInformation(htmlName);
    const propName = reactAttrConverter(htmlName);

    // Transform input values to defaultX props, to allow for changes.
    if (elementName === "input" && propName === "value") {
      result.defaultValue = value;
      return result;
    }
    if (elementName === "input" && propName === "checked") {
      result.defaultChecked = value;
      return result;
    }

    // Transform style string values to JSX-ready objects.
    if (propName === "style") {
      result.style = cssToJs(value, {
        inlineCharacterLimit: Infinity,
        singleQuotes: false
      });
      return result;
    }

    // HAST stores list values as actual arrays, but JSX needs
    // them to be strings. The property-information module
    // provides the information we need to determine how to
    // stringify HAST's arrays.
    if (Array.isArray(value)) {
      const punc = info && info.commaSeparated ? ", " : " ";
      value = value.join(punc);
    }

    // If a property value is supposed to be numeric but is a string,
    // and we can safely coerce it to a number, do that.
    if (
      info &&
      info.numeric &&
      typeof value === "string" &&
      isNumberyString(value)
    ) {
      result[propName] = Number(value);
    }

    result[propName] = value;
    return result;
  }, {});
}

function cssToJs(css) {
  return postcssJs.objectify(postcss.parse(css, { from: undefined }));
}

function isNumberyString(str) {
  return String(Number(str)) === str;
}

// Render a React-ready property to a JSX-ready string.
function renderJsxProp(name, value) {
  if (name === "style") {
    value = stringifyObject(value, {
      singleQuotes: false,
      inlineCharacterLimit: Infinity
    });
    return `style={${value}}`;
  }

  if (typeof value === "string") {
    const encodedValue = stringifyEntities(value, {
      subset: ['"'],
      attribute: true
    });
    return `${name}=${JSON.stringify(encodedValue)}`;
  }

  return `${name}={${value}}`;
}

function renderProps(props) {
  return Object.keys(props)
    .map(propName => {
      return renderJsxProp(propName, props[propName]);
    })
    .filter(x => !!x)
    .join(" ");
}

function renderComment(ctx, node) {
  return `{/*${node.value}*/}`;
}

// For text, escape < and > and wrap { and }
// in more curly braces, so JSX doesn't interpret
// these symbols as indicating elements or expressions.
function renderText(ctx, node, index, parent) {
  if (parent.tagName === "style") {
    return node.value;
  }
  return stringifyEntities(node.value, {
    subset: ["<", ">"],
    useNamedReferences: true
  }).replace(/\{|\}/g, brace => {
    return `{${JSON.stringify(brace)}}`;
  });
}

function renderRaw(ctx, node) {
  return stringifyEntities(node.value, {
    subset: ["<", "&"],
    useNamedReferences: true
  });
}

function getHandler(nodeType) {
  switch (nodeType) {
    case "root":
      return renderChildren;
    case "text":
      return renderText;
    case "raw":
      return renderRaw;
    case "element":
      return renderElement;
    case "comment":
      return renderComment;
    default:
      throw new Error(`Cannot compile node of unknown type "${nodeType}"`);
  }
}

function renderNode(ctx, node, index, parent) {
  const type = node && node.type;

  if (!type) {
    throw new Error("Expected node with a type property");
  }

  const handler = getHandler(type);
  const rendered = handler(ctx, node, index, parent);
  let element = "";
  let htmlToJsx = "";

  if (typeof rendered != "string" && "tag" in rendered) {
    element = rendered.tag;
    htmlToJsx = rendered.usedHtmlToJsxTag;
  } else {
    element = rendered;
  }

  // if it goes in to this if, its because its the last run. And element.allNotes is every elements in one string
  if (type === "root" && node.children.length > 0) {
    let wrapperName = ctx.wrapper === "fragment" ? "React.Fragment" : "div";

    // if the wrapper for body is set, the its gonna overwrite the wrapperName
    if (ctx.bodyWrapper) {
      wrapperName = ctx.bodyWrapper;
    }
    // return `<${wrapperName}>${element.allNotes}</${wrapperName}>`;

    let listOfElements = ALL_HTML_JSX_TAGS;
    ALL_HTML_JSX_TAGS = [];
    return {
      element: `<${wrapperName}>${element.allNotes}</${wrapperName}>`,
      htmlToJsx: listOfElements
    };
  }

  return {
    element: element,
    htmlToJsx: htmlToJsx
  };

  // return element;
}

function toJsx(node, options) {
  options = Object.assign(
    {
      htmlElementsToTransform: {}, // list set a the options, so forexsampel all h1 gonna be transformed to headline
      htmlElementsToRemove: [], // list of html elements to remove
      bodyWrapper: false, // the element to wrap all the content, defualt= Div tag
      wrapper: ""
    },
    options
  );

  // options is called ctx in other place...
  return renderNode(options, node);
}

module.exports = toJsx;
