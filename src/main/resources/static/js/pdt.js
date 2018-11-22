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
            amenity_types: ['school', 'library']
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
                console.log(marker);

                return {
                    lng        : marker.getLngLat().lng,
                    lat        : marker.getLngLat().lat,
                    amenities  : checkedAmenities(),
                    max_dist   : $(DOM_STRINGS.it_max_dist).val(),
                    max_result : $(DOM_STRINGS.it_max_results).val()
                };

            },

            createMap: function() {
                if (map === undefined && marker === undefined) {
                    map = createMap();
                    marker = createMarker();
                    marker.addTo(map);
                }
            },

            getMap: function () {
                return map;
            },

            getMarker: function() {
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

            $(DOM.btn_search).click(searchInstitutions);

        };

        var searchInstitutions = function() {
            var map = viewCtrl.getMap();

            // == get data from ui ==
            var inputData = viewCtrl.getInputData();

            // == create model/params ==
            var filter = modelCtrl.createFilter(inputData);
            console.log(filter);

            // == call server ==
            ajaxCall(map, filter);

            // == update UI ==

        };

        var createMap = function () {
          viewCtrl.createMap();
        };

        var ajaxCall = function(map, filter) {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                url: "/search",
                data: JSON.stringify(filter),
                success: function (geoData) {
                    console.log(geoData);
                    // var geoJSON = jQuery.parseJSON(geoData);

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

        return {
            init: function () {
                setupEventListeners();
                createMap();
            }
        }

    })(modelController, viewController);


    // == INIT APPLICATION ==
    pdtController.init();
});

