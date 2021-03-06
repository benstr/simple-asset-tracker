import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Locations } from '../api/Locations/collection'

const API_LIMIT = 1000;

Meteor.startup( () => {
  if (Locations.find().count() === 0 && Meteor.settings.seedDb ) {
    
    let rawResult, prevId = "1000000", allDataFetched = false;

    while (!allDataFetched) {
      try {
        rawResult = HTTP.call("GET",
          `https://dashboard.konekt.io/api/1/csr/rdm/?apikey=${Meteor.settings.hologram_api}&tagname=${Meteor.settings.hologram_device_tag}&startat=${prevId}&limit=${API_LIMIT}`
        );      } catch (e) {
        console.log(e);
        throw new Meteor.Error("hologram-get-failed", "Error calling Hologram API, see console for message");
      }

      if (rawResult.statusCode !== 200) {
        throw new Meteor.Error("hologram-error-code", `Error calling Hologram API, status code: ${rawResult.statusCode}`);
      }

      //console.log(rawResult.data);
      if(rawResult.data.data){

        let resultLength = rawResult.data.data.length;

        console.log(resultLength);
        if(resultLength != API_LIMIT) {
          allDataFetched = true;
        }

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
            let prevLocation = Locations.findOne({},{sort:{logged:-1}}) || {coords:[0,0]};

            if( !locationExists && prevLocation.coords != lonLat.coords ) {
              let newLocation = Locations.insert(newDoc);
              console.log("Inserted new Location received from Hologram.io Cloud ", newLocation);
            } else {
              console.log("DUP location found");
            }
          }

        });

        let lastLoc = rawResult.data.data.pop();
        prevId = lastLoc.id;

      }
    }

  }
});