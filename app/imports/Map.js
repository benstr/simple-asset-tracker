import {Meteor} from 'meteor/meteor';
import React from 'react';

// Had to import form within the node module because this library is trying too hard
// With meteor it does not treat it as client-side
// https://github.com/mapbox/mapbox-gl-js/issues/1649
import mapboxgl from '../node_modules/mapbox-gl/dist/mapbox-gl';

export default class Map extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    mapboxgl.accessToken = Meteor.settings.public.mapbox_accessToken;

    const map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
      center: [-87.63167179, 41.8905963], // starting position
      zoom: 16 // starting zoom
    });

    // Some generic coordinates and map layers to get something on the screen
    map.on('load', function () {
      map.addSource("markers", {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": [{
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [-87.63167179, 41.8905963]
            },
            "properties": {
              "marker-color": "#3bb2d0",
              "marker-symbol": "circle"
            }
          }, {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [-122.414, 37.776]
            },
            "properties": {
              "title": "Mapbox SF",
              "marker-symbol": "harbor"
            }
          }]
        }
      });

      map.addSource("route", {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [-87.63167179, 41.8905963],
              [-87.62420654296875, 41.89077715660123],
              [-87.62506484985352, 41.87933910702067],
              [-87.63442039489746, 41.879275201550634],
              [-87.63167179, 41.8905963]
            ]
          }
        }
      });

      map.addLayer({
        "id": "route",
        "type": "line",
        "source": "route",
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": "#888",
          "line-width": 8
        }
      });

      map.addLayer({
        "id": "markers",
        "type": "symbol",
        "source": "markers",
        "layout": {
          "icon-image": "{marker-symbol}-15",
          "text-field": "{title}",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0.6],
          "text-anchor": "top"
        }
      });
    });
  }

  render() {
    return (
      <div id='map'></div>
    )
  }
}