import { Meteor } from 'meteor/meteor';
import { Locations } from './collection';

Meteor.publish("locations", function (){
  return Locations.find({},{sort:{logged:1}});
});