/*---
Everything is ok
---*/
import React from 'react';
const Timer = require('./timer');
import { Watcher } from './watcher';
import PrintNote from 'antd/PrintNote';

const frontMatter = {
  title: 'Everything is ok',
  type: 'print'
};

export default class DefualtNameSetByFlotFyrToComponentModuleFunc extends React.PureComponent {
  render() {
    const props = this.props;
    return (
      <div>
        <PrintNote bg="#ec985a">
          <p>
            This is a Print
            <br />
            with random text
            <br />
            lol lol lol
          </p>
        </PrintNote>

        <PrintNote bg="#ec985a">
          <p>Another print</p>
          <ul>
            <li>first to do</li>
            <li>second</li>
            <li>and so on...</li>
          </ul>
        </PrintNote>

        <PrintNote bg="#ec985a">
          <p>Print with code</p>
          <pre>
            <code className="language-js">var test = "hello";{'\n'}</code>
          </pre>
        </PrintNote>
      </div>
    );
  }
}
