import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';

import MapContainer from '../imports/ui/containers/MapContainer.js';

Meteor.startup(() => {
  render(<MapContainer />, document.getElementById('app'));
});
