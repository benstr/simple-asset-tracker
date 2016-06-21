import '../imports/api/Locations/publications'

import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Locations } from '../imports/api/Locations/collection'

Meteor.setInterval(() => {
  console.log("Checking for new locations from Hologram.io Cloud");

  let rawResult;

  try {
    rawResult = HTTP.call("GET",
      `https://dashboard.konekt.io/api/1/csr/rdm/?apikey=${Meteor.settings.hologram_api}&tagname=${Meteor.settings.hologram_device_tag}&limit=1`
    );
  } catch (e) {
    console.log(e);
    throw new Meteor.Error("hologram-get-failed", "Error calling Hologram API, see console for message");
  }

  if (rawResult.statusCode !== 200) {
    throw new Meteor.Error("hologram-error-code", `Error calling Hologram API, status code: ${rawResult.statusCode}`);
  }

  console.log("returned id: ",rawResult.data.data[0].record_id);

  //console.log(rawResult.data);
  if(rawResult.data.data){


    rawResult.data.data.forEach( d => {

      let payload = JSON.parse(d.data);
      let coords = new Buffer(payload.data, "base64" );
      let lonLat;
      try {
        lonLat = JSON.parse(coords.toString());
      } catch (e) {
        console.log(e);
      }

      if(lonLat) {
        let newDoc = {
          logged: new Date(d.logged),
          hologramId: d.id,
          hologramRecordId: d.record_id,
          coords: lonLat.coords
        };

        let locationExists = Locations.findOne({hologramRecordId: d.record_id});

        if( !locationExists ) {
          let newLocation = Locations.insert(newDoc);
          console.log("Inserted new Location received from Hologram.io Cloud ", newLocation);
        } else {
          console.log("No new location found");
        }
      }

    });

  }

}, 10000);
