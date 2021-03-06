"use strict";

const blockElements = require("block-elements");
const balancedMatch = require("balanced-match");
const lineColumn = require("line-column");

const blockElementsSet = new Set(blockElements);

const endsWithNewline = input => {
  return /^\s*$/.test(input) || /\r?\n\s*$/.test(input);
};

const startsWithNewline = input => {
  return /^\s*$/.test(input) || /^\r?\n/.test(input);
};

const getTagName = input => {
  const tagNameMatch = /^<\/?([a-zA-Z0-9-]+)/.exec(input);
  if (!tagNameMatch) return;
  return tagNameMatch[1];
};

const insertUniqReactComponents = (newComepoent, componentNames) => {
  if (!componentNames.includes(newComepoent)) {
    componentNames.push(newComepoent);
  }

  return componentNames;
};

module.exports = (input, delimiters, escapeDelimiter) => {
  const startDelimiter = delimiters[0];
  const endDelimiter = delimiters[1];
  const placeholders = {};
  let allUniqueReactComponents = [];
  let text = "";
  let char;
  let index;

  // With resumeAt, we tell the loop to ignore all characters before a certain
  // index (the end of the interpolation).
  let resumeAt = null;

  for (index = 0; index < input.length; index++) {
    char = input[index];

    if (resumeAt !== null) {
      if (index <= resumeAt) continue;
      resumeAt = null;
    }

    const startInterpolation =
      input.substr(index, startDelimiter.length) === startDelimiter;
    if (!startInterpolation) {
      text += char;
      continue;
    }

    const delimerIsEscaped = input[index - 1] === escapeDelimiter;
    if (delimerIsEscaped) {
      text = text.slice(0, -1) + char;
      continue;
    }

    const delimiterBalancedMatch = balancedMatch(
      startDelimiter,
      endDelimiter,
      input.slice(index)
    );
    if (!delimiterBalancedMatch) {
      continue;
    }
    resumeAt = index + delimiterBalancedMatch.end + endDelimiter.length - 1;

    // We can count on the match's starting position being unique, so usable as
    // a numeric id.
    const matchId = index + delimiterBalancedMatch.start;
    const matchValue = delimiterBalancedMatch.body.trim();

    // Distinguish between expressions and tags, and inline- and block-level
    // tags.
    const isTag = /^</.test(matchValue);
    let isInline = !isTag;
    if (isTag) {
      const lineBefore = endsWithNewline(input.slice(0, index));
      const lineAfter = startsWithNewline(
        input.slice(index + delimiterBalancedMatch.end + endDelimiter.length)
      );

      // making the list for the template to import this components, in the top.
      allUniqueReactComponents = insertUniqReactComponents(
        getTagName(matchValue),
        allUniqueReactComponents
      );

      isInline = !lineBefore || !lineAfter;
      if (isInline) {
        const tagName = getTagName(matchValue);

        if (blockElementsSet.has(tagName)) {
          const errorIndex = !lineBefore
            ? delimiterBalancedMatch.start + index
            : delimiterBalancedMatch.end + index + endDelimiter.length - 1;
          const position = lineColumn(input, errorIndex);
          const message = `<${tagName}> is a block-level element. Interpolated tags for block-element JSX elements should be separated from surrounding Markdown by newlines. (${
            position.line
          }:${position.col})`;
          const error = new Error(message);
          error.code = "BADBLOCK";
          error.position = position;
          throw error;
        }
      }
    }

    // Inline representation is a number in case it gets inserted into syntax
    // highlighting in a way that should be numeric. Block representation is a
    // <div> so it doesn't mess with the paragraphs in Markdown.
    const representation = isInline
      ? `12345${matchId}54321`
      : `\n<div data-flotfyr-placeholder="${matchId}"></div>\n`;

    placeholders[matchId] = {
      value: matchValue,
      representation,
      isTag,
      isInline
    };
    text += representation;
  }

  return {
    text,
    placeholders,
    allUniqueReactComponents
  };
};
