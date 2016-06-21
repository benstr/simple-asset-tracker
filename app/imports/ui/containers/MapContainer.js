import { Meteor } from 'meteor/meteor';
import { Locations } from '../../api/Locations/collection';
import { createContainer } from 'meteor/react-meteor-data';
import Map from '../pages/Map.js';

export default createContainer(() => {

  Meteor.subscribe('locations');
  console.log(Locations.find({}).count());

  let locations = Locations.find({}, { sort: { logged: 1 } }).fetch();

  return {
    locations: locations,
    route: locations.map( loc => {
      return loc.coords
    })
  };

}, Map);
