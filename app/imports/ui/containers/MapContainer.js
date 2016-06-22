import { Meteor } from 'meteor/meteor';
import { Locations } from '../../api/Locations/collection';
import { createContainer } from 'meteor/react-meteor-data';
import Map from '../pages/Map.js';

export default createContainer(() => {

  Meteor.subscribe('locations');
  let locations = Locations.find({});

  return {
    locations: locations.fetch(),
    route: locations.fetch().map( loc => {
      return loc.coords
    }),
    currentLocation: locations.count() ? locations.fetch().pop().coords : [-87.1,41.1]
  };

}, Map);
