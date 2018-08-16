// Simple map
var SELECTED_ROADS_SOURCE;

mapboxgl.accessToken = PUBLIC_ACCESS_TOKEN;
var map = new mapboxgl.Map({
    container: 'map',
    style: STYLESHEET,
    hash: true
});

map.on('style.load', function(e) {

    addSourcesAndLayers();

});

function deleteRoad(features) {
    $('#map').toggleClass('loading');
    var url = DATASETS_BASE + 'features/' + features[0].properties.id + '?access_token=' + DATASETS_ACCESS_TOKEN;
    $.ajax({
        method: 'DELETE',
        url: url,
        contentType: 'application/json',
        success: function() {
            $('#map').toggleClass('loading');
	    refreshTiles();
        },
        error: function() {
            $('#map').toggleClass('loading');
        }
    });
}

function refreshTiles(){
    var url = DATASETS_BASE + 'features';
    var params = {
        'access_token': DATASETS_ACCESS_TOKEN
    };

    $.getJSON(url+"?random="+new Date().getTime(), params, function(data) {
	if(map.getSource('custom-roads')){
		map.removeLayer('selected-roads');
		map.removeSource('custom-roads');
	}
        map.addSource('custom-roads', {
            type: 'geojson',
            data: data
        });
	$("#feature-count").text(data.features.length)
        map.addLayer({
            'id': 'selected-roads',
            'type': 'line',
	    'source': 'custom-roads',
            'interactive': true,
            'paint': {
                'line-color': 'rgba(255,5,230,1)',
                'line-width': 3,
                'line-opacity': 1
            }
        });
   });
}

function addRoad(features) {
    $('#map').toggleClass('loading');
    var tempObj = {
        type: 'Feature',
        geometry: features[0].geometry,
        properties: features[0].properties,
    };
    tempObj.properties['is_flooded'] = true;
    tempObj.properties['timestamp'] = Date.now();
    tempObj.id = md5(JSON.stringify(tempObj));
    tempObj.properties['id'] = tempObj.id;

    var url = DATASETS_BASE + 'features/' + tempObj.id + '?access_token=' + DATASETS_ACCESS_TOKEN;
    $.ajax({
        method: 'PUT',
        url: url,
        data: JSON.stringify(tempObj),
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
            $('#map').toggleClass('loading');
	    refreshTiles();
        },
        error: function() {
            $('#map').toggleClass('loading');
        }
    });
}

function addSourcesAndLayers() {
    refreshTiles();
    map.on('click', function(e) {
            if (map.getZoom() >= 15) {
                var features = map.queryRenderedFeatures(e.point, {
                    radius: 5,
                    includeGeometry: true,
                    layers: ['selected-roads']
                });
                if (features.length) {
                    deleteRoad(features);
                } else {
                    var features = map.queryRenderedFeatures(e.point, {
                        radius: 5,
                        includeGeometry: true,
                        layers: ['road']
                    });
                    if (features.length) {
                        addRoad(features);
                    }
                }
            }else{
		$("#copy").html("Zoom in to mark area as affected.");
	    }
        });

    map.addSource('terrain-data', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-terrain-v2'
    });
    map.addLayer({
        'id': 'terrain-data',
        'type': 'line',
        'source': 'terrain-data',
        'source-layer': 'contour',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#ff69b4',
            'line-opacity': 0.3,
            'line-width': 1
        }
    });
}

$(function() {
    $('#sidebar').mCustomScrollbar({
        theme: 'rounded-dots',
        scrollInertia: 100,
        callbacks: {
            onInit: function() {
                $('#sidebar').css('overflow', 'auto');
            }
        }
    });
});

