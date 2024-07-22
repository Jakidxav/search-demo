const style = (theme) => {
  return {
    version: 8,
    sources: {
      basemap: {
        type: 'vector',
        tiles: ['https://carbonplan-maps.s3.us-west-2.amazonaws.com/basemaps/{z}/{x}/{y}.pbf'],
      },
    },
    layers: [
      {
        id: 'ocean-fill',
        type: 'fill',
        source: 'basemap',
        'source-layer': 'ocean',
        paint: {
          'fill-color': 'black',
          'fill-opacity': 1,
        },
        layout: { visibility: 'visible' },
      },
      {
        id: 'land-outline',
        type: 'line',
        source: 'basemap',
        'source-layer': 'land',
        paint: {
          'line-color': 'white',
          //   'fill-opacity': 1,
        },
        layout: { visibility: 'visible' },
      },
      {
        id: 'places-points',
        type: 'circle',
        source: 'basemap',
        'source-layer': 'ne_10m_populated_places',
        minzoom: 6,
        paint: {
          'circle-color': theme.colors.primary,
          'circle-opacity': 0.3,
          'circle-radius': 4,
        },
      },
      {
        id: 'places-text',
        type: 'symbol',
        source: 'basemap',
        'source-layer': 'ne_10m_populated_places',
        minzoom: 6,
        paint: {
          'text-color': theme.colors.primary,
          'text-opacity': 0.3,
          'text-translate': [0, -20],
        },
        layout: {
          'text-ignore-placement': false,
          'text-font': ['relative-faux-book'],
          'text-field': ['format', ['get', 'name_en'], { 'font-scale': 1.2 }],
        },
      },
    ],
  }
}

export default style