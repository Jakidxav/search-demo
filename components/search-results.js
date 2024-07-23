// Adapted from Carbonplan's <Input /> component:
// https://github.com/carbonplan/components/blob/main/src/input.js

import { useEffect, useState } from 'react'
import { Box, Text, useThemeUI } from 'theme-ui'
import { useMapbox } from '@carbonplan/maps'
import * as turf from '@turf/turf'

const SearchResults = ({ 
    results, setResults, 
    searchText, setSearchText, 
    lookup, setLookup, 
    coordinates, setCoordinates,
    bbox, setBbox
}) => {

    const { theme } = useThemeUI()
    const [place, setPlace] = useState(null)

    console.log(results)

    const sx = {
        'search-results': {
            color: 'primary',
            border: '1px solid',
            borderColor: 'primary',
            bg: theme.colors.background,
            transition: 'border 0.15s',
            fontSize: [3, 3, 3, 4],
            fontFamily: 'body',
            letterSpacing: 'body',
            lineHeight: [1.0],
            // width: '100%',
            width: ['300px'],
            p: ['5px'],
            ':focus': {
                borderColor: 'primary',
            },
            ':focus-visible': {
                outline: 'none !important',
                background: 'none !important',
            },
            '&:hover': {
                backgroundColor: "#ef4836",
                borderColor: 'primary',
            },
        },
    }

    const { map } = useMapbox()

    const handleResultClick = ((event) => {
        let place = event.target.innerHTML
        console.log(place)
        setSearchText(place)
        setPlace(place)
        setLookup(results.filter(result => result[0] == place)[0][1])
        setResults([])
    })

    useEffect(() => {
        if (place && lookup) {
            console.log(place, lookup)
            fetch(`https://storage.googleapis.com/risk-maps/search/${lookup}.geojson`)
            .then((response) => response.json())
            .then((json) => {
                let filtered = json.features.filter(feature => feature.properties.NAME == searchText)[0];
                if (filtered.geometry.type == 'Point') {
                    let coords = filtered.geometry.coordinates
                    console.log(coords)
                    setCoordinates(coords)
                } else {
                    // currently there are only two other options: Polygon and MultiPolygon
                    // in the future, there could be MultiLineString options, too, but
                    // the turf.bbox() method should work for all three
                    setBbox(turf.bbox(filtered))
                }
            })
        }
    }, [place, lookup])

    useEffect(() => {
        if (coordinates) {
            map.flyTo({
                center: coordinates,
                zoom: 7.5,
            })
        }
    }, [coordinates])

    useEffect(() => {
        if (bbox) {
            map.fitBounds(bbox)
            console.log(map.getZoom())
        }
    }, [bbox])


    return (
        <Box>
            {results.length == 0 ?
                <Box></Box>
                :
                results.map((result, index) => {
                    return (
                        <Box key={index} sx={sx['search-results']} >
                            <Box onClick={handleResultClick}>
                                <Text>{result[0]}</Text>
                            </Box>
                            <Box>
                                <Text sx={{
                                    fontStyle: 'italic',
                                    fontSize: [2, 2, 2, 3],

                                }}>
                                    {result[1]}
                                </Text>
                            </Box>
                        </Box>
                    )
                })
            }
        </Box>
    )
}

export default SearchResults