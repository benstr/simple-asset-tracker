import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Locations } from '../imports/api/Locations/collection'

const apiLimit = 1000;

Meteor.startup( () => {
  if (Locations.find().count() === 0) {
    
    let rawResult, prevId = "1000000", allDataFetched = false;

    while (!allDataFetched) {
      try {
        rawResult = HTTP.call("GET",
          `https://dashboard.konekt.io/api/1/csr/rdm/?apikey=${Meteor.settings.hologram_api}&tagname=${Meteor.settings.hologram_device_tag}&startat=${prevId}&limit=${apiLimit}`
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
        let prevLoc = {};

        console.log(resultLength);
        if(resultLength != apiLimit) {
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
              coords: lonLat.coords
            };

            if( !prevLoc.coords || prevLoc.coords != lonLat.coords ) {
              prevLoc = newDoc;
              Locations.insert(newDoc);
            }
          }

        });

        let lastLoc = rawResult.data.data.pop();
        prevId = lastLoc.id;

      }
    }

  }
});