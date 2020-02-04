/*---
react development env
---*/
import React from 'react';
import headline from 'semantic-ui-react/headline';

const frontMatter = {
  title: 'react development env'
};

export default class Testmarkdown extends React.PureComponent {
  render() {
    const props = this.props;
    return (
      <div>
        <headline>react development env</headline>
      </div>
    );
  }
}
