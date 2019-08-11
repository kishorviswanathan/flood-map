function notify(msg){
	alert(msg);
}
function clearMap(){
	for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}

function redrawPolyLine(){
	if(polyline != null)
		map.removeLayer(polyline);
	if(startPoint != null)
		map.removeLayer(startPoint);
	if(selectedPoints.length == 0)
		return;
	startPoint = L.circle(selectedPoints[0], 5, polyline_options).addTo(map)
	polyline = L.polyline(selectedPoints, polyline_options).addTo(map);
}

function showStep(step){
	$(".reportStep").removeClass("show");
	$("#reportStep-"+step).addClass("show");
}

function startMarking(){
	isreporting = true;
	showStep(1);
}

function stopMarking(){
	isreporting = false;
	if(polyline != null)
		map.removeLayer(polyline);
	if(startPoint != null)
		map.removeLayer(startPoint);
	startPoint = null;
	polyline = null;
	selectedPoints = [];
	showStep(0);
}

function undoMarking(){
	selectedPoints.pop();
	if(selectedPoints.length == 0){
		showStep(1);
	}
	redrawPolyLine();
}

//Save a new report
function reportMarking(){
	var minified = [];
	for(var i=0; i < selectedPoints.length; i++){
		minified.push([selectedPoints[i].lat,selectedPoints[i].lng]);
	}
	$.get('backend/saveData.php',{'road':JSON.stringify(minified)},function(data){
		L.polyline(selectedPoints, polyline_options).addTo(map);
		stopMarking();
		toastr.success('Report Submitted.', 'Thank you!');
		loadFloodedRegions();
	});
}

//Delete a report given its id.
function deleteRoad(id){
	map.closePopup();
	$.get("backend/deleteData.php?id="+id,function(data){
		if(data == ""){
		    toastr.success('Report Deleted.', 'Thank you!');
		    loadFloodedRegions();
	    }else{
	        toastr.error("Error",data);
	    }
	});
}

//Load regions json data
function loadFloodedRegions(){
	$.getJSON('backend/getData.php',function(data){
		clearMap();
		Object.keys(data).forEach(function(key){
			var road = data[key];
			var converted = [];
			for(var i=0;i < road.length; i++){
				converted.push(L.latLng(road[i]));
			}
			var line = L.polyline(converted, polyline_options).addTo(map);
			line.on("click",function(e){
				var popup = L.popup()
			   .setLatLng(e.latlng) 
			   .setContent('<h3> Delete this report ? </h3> <button class="btn btn-small btn-danger" onclick="deleteRoad(\''+key+'\')">Delete</button>')
			   .openOn(map);
			});
		});
	})
}

//Update water level for simulation
function updateWaterLevel(value){
	waterLevel = value;
	$("#waterLevelValue").html(value + " Mtrs");
	if(floodLayer != null){
		map.removeLayer(floodLayer);
	}
	showFlood();
}

//Show flood simulation
function showFlood(){
	$(".slidecontainer").show();
	floodLayer = L.tileLayer(
		'http://flood.firetree.net/solidtile/m_'+waterLevel+'/x_{x}/y_{y}/z_{z}',{
			opacity : 0.2,
			attribution: '&copy; <a href="http://flood.firetree.net">Firetree</a>'
		}
	).addTo(map);
	$("#showflood").hide();
	$("#hideflood").show();
}

//Hide flood simulation
function hideFlood(){
	$(".slidecontainer").hide();
	if(floodLayer != null){
		map.removeLayer(floodLayer);
		floodLayer = null;
	}
	$("#showflood").show();
	$("#hideflood").hide();
}

function init_map(){
	map.setView([10.4399233,76.445535], 7.5);

	// Add zoom control
	L.control.zoom({
	     position:'topright'
	}).addTo(map);

	// Set up the OSM layer
	L.tileLayer(
		'https://b.tiles.mapbox.com/v4/openstreetmap.1b68f018/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoib3NtLWluIiwiYSI6ImNqcnVxMTNrNTJwbHc0M250anUyOW81MjgifQ.cZnvZEyWT5AzNeO3ajg5tg',{
			attribution: '&copy; <a href="https://www.openstreetmap.in">OpenStreetMap</a> contributors'
		}
	).addTo(map);

	// Add the location Control
	var lc = L.control.locate({
		flyTo : true,
		drawCircle : false,
		position:'topright'
	}).addTo(map);

	//Add onclick listner
	map.on('click', function(e) {
		if(!isreporting){
			return;
		}else if(map.getZoom() < 18){
			toastr.error('Please Zoom-In and try again.');
			return;
		}
		showStep(2);
	    selectedPoints.push(e.latlng);
	    redrawPolyLine();
	});

	lc.start();
	loadFloodedRegions();

	setInterval(function(){
		if(!isreporting){
			toastr.info('Refreshing Flood Map...');
			loadFloodedRegions();
		}
	},5*60000);
}


var map = L.map('map',{
	zoomControl : false
});
var floodLayer;

var selectedPoints = [];
var polyline;
var startPoint;
var waterLevel = 1;

var polyline_options = {
    color: '#DC143C',
    weight: 10
};
var isreporting = false;
toastr.options = {
  "positionClass": "toast-bottom-right",
  "timeOut": 3000,
  "extendedTimeOut": 3000,
};
init_map();