import {Meteor} from 'meteor/meteor';
import React from 'react';

// Had to import form within the node module because this library is trying too hard
// With meteor it does not treat it as client-side
// https://github.com/mapbox/mapbox-gl-js/issues/1649
import mapboxgl from '../../../node_modules/mapbox-gl/dist/mapbox-gl';

export default class Map extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    let newRoute = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": nextProps.route
      }
    };

    let newMarker = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": nextProps.currentLocation
        },
        "properties": {
          "marker-color": "#3bb2d0",
          "marker-symbol": "circle"
        }
      }]
    };

    if (this.state) {
      this.state.routeSource.setData(newRoute);
      this.state.markerSource.setData(newMarker);
      this.state.mapbox.setCenter(nextProps.currentLocation);
    }
  }

  componentDidMount() {
    let self = this;
    mapboxgl.accessToken = Meteor.settings.public.mapbox_accessToken;

    const mapbox = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
      center: self.props.currentLocation, // starting position
      zoom: 15 // starting zoom
    });

    let routeSource = new mapboxgl.GeoJSONSource({
      data: {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": self.props.route
        }
      }
    });

    let markerSource = new mapboxgl.GeoJSONSource({
      data: {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": self.props.currentLocation
          },
          "properties": {
            "marker-color": "#3bb2d0",
            "marker-symbol": "circle"
          }
        }]
      }
    });

    self.setState({
      mapbox: mapbox,
      routeSource: routeSource,
      markerSource: markerSource
    });

    // Some generic coordinates and map layers to get something on the screen
    mapbox.on('load', function () {
      mapbox.addSource("route", self.state.routeSource);
      mapbox.addLayer({
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

      mapbox.addSource("marker", self.state.markerSource);
      mapbox.addLayer({
        "id": "marker",
        "type": "symbol",
        "source": "marker",
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