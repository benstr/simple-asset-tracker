import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Locations } from '../api/Locations/collection'

// Every 5 seconds check the Hologram Cloud for new coordinates

Meteor.setInterval(() => {
  console.log("Checking for new locations from Hologram.io Cloud");

  let rawResult, result, payload, coords;

  try {
    rawResult = HTTP.call("GET",
      `https://dashboard.hologram.io/api/1/csr/rdm/?apikey=${Meteor.settings.hologram_api}&tagname=${Meteor.settings.hologram_device_tag}&limit=1`
    );
  } catch (e) {
    console.log(e);
    throw new Meteor.Error("hologram-get-failed", "Error calling Hologram API, see console for message");
  }

  if (rawResult.statusCode !== 200) {
    throw new Meteor.Error("hologram-error-code", `Error calling Hologram API, status code: ${rawResult.statusCode}`);
  }

  // Returned results are in a string and the coordinates are base64 encoded, we need to fix that
  result = rawResult.data.data[0];
  payload = JSON.parse(result.data);
  coords = new Buffer(payload.data, "base64" );

  try {
    coords = JSON.parse(coords.toString());
  } catch (e) {
    console.log("Unable to parse coordinates from Hologram data");
  }

  // Yay, we have coordinate data, now lets check if we should create a new document or not

  if(coords) {

    // newLocation will be the document we insert to the DB
    let newLocation = {
      logged: new Date(result.logged),
      hologramId: result.id,
      hologramRecordId: result.record_id,
      coords: coords.coords
    };

    // Check if the new location is not a duplication
    const locationExists = Locations.findOne({hologramId: newLocation.hologramId});

    if( locationExists ) {

      console.log("Location already exists");

    } else {

      // Check if coordinates are too close to each other
      // Checking to the 5th decimal of the coordinates (about 4feet)
      const prevLocation = Locations.findOne({},{sort:{logged:-1}}) || { coords: [0,0]};
      let prevLon = parseInt(prevLocation.coords[0] * 100000);
      let prevLat = parseInt(prevLocation.coords[1] * 100000);
      let newLon = parseInt(newLocation.coords[0] * 100000);
      let newLat = parseInt(newLocation.coords[1] * 100000);

      if ( newLon !== prevLon && newLat !== prevLat ) {
        let newLocationId = Locations.insert(newLocation);
        console.log("Inserted new Location received from Hologram.io Cloud ", newLocationId);
      } else {

        console.log("Locations are too close together");
        
      }
    }
  }

}, 5000);