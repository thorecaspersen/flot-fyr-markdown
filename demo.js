const flotFyrTransformer = require("./lib/flotFyrTransformer");

option = {
  defualtImport: `tequila-ui`,
  importer: {
    FancyReactComponent: "antd",
    headline: "semantic-ui-react"
  },
  transformHtmlTags: {
    h1: "headline",
    blockquote: "quotes"
  },
  cutSrcLinks: true // <img src="https://octodex.github.com/images/yaktocat.png" /> -> <img src="/images/yaktocat.png" />
};

flotFyrTransformer("./input", "./output", option);
