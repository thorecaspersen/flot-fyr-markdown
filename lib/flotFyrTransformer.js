var copy = require("recursive-copy");
const toComponentModule = require("./toComponentModule.js");
const prettier = require("prettier");
var path = require("path");
var through = require("through2");
var replaceExt = require("replace-ext");

module.exports = function(src, dest, markdownOptions) {
  markdownOptions = Object.assign(
    {
      prependJs: [],
      precompile: false,
      headings: false,
      remarkPlugins: [],
      defualtImport: false,
      importer: false
    },
    markdownOptions
  );

  prettierOption = {
    printWidth: 80,
    singleQuote: true,
    trailingComma: "none",
    jsxBracketSameLine: false,
    parser: "babel"
  };
  var options = {
    overwrite: true,
    expand: true,
    dot: true,
    junk: true,
    rename: function(filePath) {
      if (path.extname(filePath) === ".md") {
        return replaceExt(filePath, ".js");
      }
      return filePath;
    },
    transform: function(src, dest, stats) {
      if (path.extname(src) !== ".md") {
        return null;
      }
      // get filename without extention ( forxsampel .js)
      let filename = path.basename(src, path.extname(src));

      return through(function(chunk, enc, done) {
        var output = chunk.toString();

        // add name to the markdown option if its not set
        markdownOptions = Object.assign(
          {
            name: filename
          },
          markdownOptions
        );
        const jsx = toComponentModule(output, markdownOptions);
        const beautifulJsx = prettier.format(jsx, prettierOption);

        done(null, beautifulJsx);
      });
    }
  };

  copy(src, dest, options)
    .on(copy.events.COPY_FILE_START, function(copyOperation) {
      console.info("Copying file " + copyOperation.src + "...");
    })
    .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
      console.info("Copied to " + copyOperation.dest);
    })
    .on(copy.events.ERROR, function(error, copyOperation) {
      console.error("Unable to copy " + copyOperation.dest);
    })
    .then(function(results) {
      console.info(results.length + " file(s) copied");
    })
    .catch(function(error) {
      return console.error("Copy failed: " + error);
    });
};
