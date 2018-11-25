$(document).ready(function () {

    // model --> holds data selected by user
    var modelController = (function () {

        var FilterEdu = function (lon, lat, amenities, max_dist, max_results) {
            this.lon = lon;
            this.lat = lat;
            this.amenityTypes = amenities;
            this.maxRadius = max_dist;
            this.maxResults = max_results;
        };

        return {
            createFilter: function (inputData) {
                return new FilterEdu(
                    inputData.lng,
                    inputData.lat,
                    inputData.amenities,
                    inputData.max_dist,
                    inputData.max_result
                );
            }
        }

    })();


    // view --> responsible for DOM manipulation
    var viewController = (function () {

        var DOM_STRINGS = {
            fr_school_cb: '#cbschool',
            fr_library_cb: '#cblibrary',
            it_max_results: '#it_max',
            it_max_dist: '#it_maxdist',
            btn_search: '#btn_search',
            btn_heatmap: '#btn_heatmap',
            amenity_checkboxes: '.amecb',
            amenity_types: ['school', 'college', 'university']
        };

        var createMap = function () {
            var tokenKey = 'pk.eyJ1IjoibWVyZXRoIiwiYSI6ImNqbXA3Z2ZoNzB4YzIzeHFjb3VwdXJuN2oifQ.LlSXvjk8lCZDBl6OYq0xdA';
            mapboxgl.accessToken = tokenKey;

            return new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v9',
                center: [-122.4494, 37.7588],
                zoom: 12
            });
        };

        var createMarker = function () {
            return new mapboxgl.Marker({draggable: true})
                .setLngLat([-122.4494, 37.7588]);
        };

        var map = undefined;
        var marker = undefined;

        var checkedAmenities = function () {
            return $(DOM_STRINGS.amenity_checkboxes).map(function (index) {
                if (this.checked) {
                    return DOM_STRINGS.amenity_types[index];
                }
            }).get();
        };

        return {
            getInputData: function () {

                return {
                    lng: marker.getLngLat().lng,
                    lat: marker.getLngLat().lat,
                    amenities: checkedAmenities(),
                    max_dist: $(DOM_STRINGS.it_max_dist).val(),
                    max_result: $(DOM_STRINGS.it_max_results).val()
                };

            },

            createMap: function () {
                if (map === undefined && marker === undefined) {
                    map = createMap();
                    marker = createMarker();
                    marker.addTo(map);
                }
            },

            getMap: function () {
                return map;
            },

            getMarker: function () {
                return marker;
            },

            getDOMStrings: function () {
                return DOM_STRINGS;
            }
        }
    })();


    // controller --> chains model and view
    var pdtController = (function (modelCtrl, viewCtrl) {

        var setupEventListeners = function () {
            var DOM = viewCtrl.getDOMStrings();
            var marker = viewCtrl.getMarker();

            $(DOM.btn_search).click(searchInstitutions);
            $(DOM.btn_heatmap).click(createParkHeatMap);
            marker.on('dragend',searchInstitutions);


        };

        var searchInstitutions = function () {
            var map = viewCtrl.getMap();

            // == get data from ui ==
            var inputData = viewCtrl.getInputData();

            // == create model/params ==
            var filter = modelCtrl.createFilter(inputData);

            // == call server ==
            ajaxCall(map, filter);

            // == update UI ==

        };

        var createParkHeatMap = function () {
            ajaxHeat(viewCtrl.getMap());
        };

        var createMap = function () {
            viewCtrl.createMap();
        };

        var ajaxCall = function (map, filter) {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                url: "/search",
                data: JSON.stringify(filter),
                success: function (geoData) {
                    console.log(geoData);

                    if (map.getLayer("points") !== undefined)
                        map.removeLayer("points");

                    if (map.getSource('edu') !== undefined)
                        map.removeSource('edu');

                    map.addSource("edu", {
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": geoData
                        }
                    });

                    map.addLayer({
                        "id": "points",
                        "type": "symbol",
                        "source": "edu",
                        "layout": {
                            "icon-image": "school-15",
                            "text-field": "{title}",
                            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                            "text-offset": [0, 0.6],
                            "text-anchor": "top"
                        }
                    });
                }
            });
        };

        var ajaxHeat = function (map) {
            $.ajax({
                type: "GET",
                contentType: "application/json",
                dataType: 'json',
                url: "/heatmap",

                success: function (geoData) {

                    map.addSource('fires', {
                        type: 'geojson',
                        "data": {
                            "type": "FeatureCollection",
                            "features": geoData
                        }
                    });

                    map.addLayer({
                        id: 'fires-heat',
                        type: 'heatmap',
                        source: 'fires',
                        maxzoom: 15,
                        paint: {
                            // increase weight as diameter breast height increases
                            'heatmap-weight': {
                                property: 'dbh',
                                type: 'exponential',
                                stops: [
                                    [1, 0],
                                    [62, 1]
                                ]
                            },
                            // increase intensity as zoom level increases
                            'heatmap-intensity': {
                                stops: [
                                    [11, 1],
                                    [15, 3]
                                ]
                            },
                            // assign color values be applied to points depending on their density
                            'heatmap-color':
                                [
                                'interpolate',
                                ['linear'],
                                ['heatmap-density'],
                                0, 'rgba(236,222,239,0)',
                                0.2, 'rgb(208,209,230)',
                                0.4, 'rgb(166,189,219)',
                                0.6, 'rgb(103,169,207)',
                                0.8, 'rgb(28,144,153)'
                            ],
                            // increase radius as zoom increases
                            'heatmap-radius': {
                                stops: [
                                    [11, 15],
                                    [15, 20]
                                ]
                            },
                            // decrease opacity to transition into the circle layer
                            'heatmap-opacity': {
                                default: 1,
                                stops: [
                                    [14, 1],
                                    [15, 0]
                                ]
                            },
                        }
                    }, 'waterway-label');

                    map.addLayer({
                        id: 'fires-point',
                        type: 'circle',
                        source: 'fires',
                        minzoom: 14,
                        paint: {
                            // increase the radius of the circle as the zoom level and dbh value increases
                            'circle-radius': {
                                property: 'dbh',
                                type: 'exponential',
                                stops: [
                                    [{ zoom: 15, value: 1 }, 5],
                                    [{ zoom: 15, value: 62 }, 10],
                                    [{ zoom: 22, value: 1 }, 20],
                                    [{ zoom: 22, value: 62 }, 50],
                                ]
                            },
                            'circle-color': {
                                property: 'dbh',
                                type: 'exponential',
                                stops: [
                                    [0, 'rgba(236,222,239,0)'],
                                    [10, 'rgb(236,222,239)'],
                                    [20, 'rgb(208,209,230)'],
                                    [30, 'rgb(166,189,219)'],
                                    [40, 'rgb(103,169,207)'],
                                    [50, 'rgb(28,144,153)'],
                                    [60, 'rgb(1,108,89)']
                                ]
                            },
                            'circle-stroke-color': 'white',
                            'circle-stroke-width': 1,
                            'circle-opacity': {
                                stops: [
                                    [14, 0],
                                    [15, 1]
                                ]
                            }
                        }
                    }, 'waterway-label');
                }
            });
        };

        return {
            init: function () {
                createMap();
                setupEventListeners();
            }
        }

    })(modelController, viewController);


    // == INIT APPLICATION ==
    pdtController.init();
});

