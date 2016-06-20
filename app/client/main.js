import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';

import Map from '../imports/Map.js';

Meteor.startup(() => {
  render(<Map />, document.getElementById('app'));
});
