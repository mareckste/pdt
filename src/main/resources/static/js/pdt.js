$(document).ready(function () {

    console.log('jQuery working nicely!')

    mapboxgl.accessToken = 'pk.eyJ1IjoibWVyZXRoIiwiYSI6ImNqbXA3Z2ZoNzB4YzIzeHFjb3VwdXJuN2oifQ.LlSXvjk8lCZDBl6OYq0xdA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [-122.4494, 37.7588],
        zoom: 12
    });

    var marker = new mapboxgl.Marker({draggable: true}).setLngLat([-122.4494, 37.7588]).addTo(map);

    $("#pdtForm").submit(function (event) {
        console.log('Search was pressed !');
        event.preventDefault();
        ajaxGet();
    });

    function ajaxGet() {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: "/search",
            success: function (geoData) {
                console.log(geoData)
            }
        });
    }

});

