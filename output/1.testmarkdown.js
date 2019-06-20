/*---
Everything is ok
---*/
import React from 'react';
const Timer = require('./timer');
import { Watcher } from './watcher';
import Chil from 'tequila-ui/Chil';
import LetsDoThis from 'tequila-ui/LetsDoThis';
import FancyReactComponent from 'antd/FancyReactComponent';
import headline from 'semantic-ui-react/headline';
import quotes from 'tequila-ui/quotes';

const frontMatter = {
  title: 'Everything is ok',
  quantity: 834
};

export default class Testmarkdown extends React.PureComponent {
  render() {
    const props = this.props;
    return (
      <div>
        <headline>An h1 header</headline>
        <Chil />
        <p>Paragraphs are separated by a blank line. </p>
        <p>
          2nd paragraph. <em>Italic</em>, <strong>bold</strong>, and{' '}
          <code>monospace</code>. Itemized lists look like:
        </p>
        <ul>
          <li>this one</li>
          <li>that one</li>
        </ul>
        <quotes>
          <p>Block quotes are written like so.</p>
        </quotes>
        <h2>An h2 header</h2>
        <p>Here's a numbered list:</p>
        <ol>
          <li>first item</li>
          <li>second item</li>
          <li>third item</li>
        </ol>
        <hr />
        <p>
          Note again how the actual text starts at 4 columns in (4 characters
          from the left side). Here's a code sample:
        </p>
        <headline>Let me re-iterate ...</headline>
        <p>
          {' '}
          for i in 1 .. 10 {'{'} do-something(i) {'}'}
        </p>
        <p>
          As you probably guessed, indented 4 spaces. By the way, instead of{' '}
          <LetsDoThis />
          indenting the block, you can use delimited blocks, if you like:
        </p>
        <pre>
          <code>
            define foobar() {'{'}
            {'\n'}
            {'    '}print "Welcome to flavor country!";{'\n'}
            {'}'}
            {'\n'}
          </code>
        </pre>
        <p>
          <img src="/images/yaktocat.png" alt="Image of Yaktocat" />
        </p>
        <FancyReactComponent />
        <p>
          (which makes copying & pasting easier). You can optionally mark the
          delimited block for Pandoc to syntax highlight it:
        </p>
        <pre>
          <code className="language-python">
            import time{'\n'}# Quick, count to ten!{'\n'}for i in range(10):
            {'\n'}
            {'    '}# (but not *too* quick){'\n'}
            {'    '}time.sleep(0.5){'\n'}
            {'    '}print i{'\n'}
          </code>
        </pre>
        <pre>
          <code className="language-bash">
            $ cd dillinger{'\n'}$ npm install -d{'\n'}$ node app{'\n'}
          </code>
        </pre>
        <h3>An h3 header</h3>
        <p>Now a nested list:</p>
        <ol>
          <li>
            <p>First, get these ingredients:</p>
            <ul>
              <li>carrots</li>
              <li>celery</li>
              <li>lentils</li>
            </ul>
          </li>
          <li>
            <p>Boil some water.</p>
          </li>
          <li>
            <p>Dump everything in the pot and follow this algorithm:</p>
            <p>
              {' '}
              find wooden spoon uncover pot stir cover pot balance wooden spoon
              precariously on pot handle wait 10 minutes goto first step (or
              shut off burner when done)
            </p>
          </li>
        </ol>
        <p>
          Here's a link to <a href="http://foo.bar">a website</a>, to a{' '}
          <a href="local-doc.html">local doc</a>, and to a{' '}
          <a href="#an-h2-header">section heading in the current doc</a>. Here's
          a footnote [^1].
        </p>
        <p>[^1]: Footnote text goes here.</p>
        <details>
          <summary>Spoiler text</summary>
          whatever
        </details>

        <table>
          <thead>
            <tr>
              <th>First Header</th>
              <th>Second Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Content Cell</td>
              <td>Content Cell</td>
            </tr>
            <tr>
              <td>Content Cell</td>
              <td>Content Cell</td>
            </tr>
          </tbody>
        </table>
        <p>
          named links to <a href="http://google.com/">Google</a>
          <br />
          <a href="http://fest.com/">http://fest.com/</a>
        </p>
        <headline>React test</headline>
        <FancyReactComponent />
      </div>
    );
  }
}
