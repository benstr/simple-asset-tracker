import { Meteor } from 'meteor/meteor';
import { Locations } from '../../api/Locations/collection';
import { createContainer } from 'meteor/react-meteor-data';
import Map from '../pages/Map.js';

export default createContainer(() => {

  Meteor.subscribe('locations');
  let locations = Locations.find({},{sort:{logged:1}}).fetch();
  let locationCount = Locations.find({},{sort:{logged:1}}).count();

  return {
    locations: locations,
    route: locations.map( loc => {
      return loc.coords
    }),
    currentLocation: locationCount ? locations.pop().coords : [-87.1,41.1]
  };

}, Map);
