var map = L.map('map').setView([40.65,-73.93], 11);

var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

map.addLayer(CartoDBTiles);
/*
// set data layer as global variable so we can use it in the layer control below
var roofsGeoJSON;

// use jQuery get geoJSON to grab geoJson layer, parse it, then plot it on the map using the plotDataset function
$.getJSON( "data/NYC_Cool_Roofs_Buildings.geojson", function( data ) {
    var dataset = data;
    // draw the dataset on the map
    //plotDataset(dataset);
    //create the sidebar with links to fire polygons on the map
    createListForClick(dataset);
});

// function to plot the dataset passed to it
function plotDataset(dataset) {
    roofsGeoJSON = L.geoJson(dataset, {
        style: roofsStyle,
        onEachFeature: roofsOnEachFeature
    }).addTo(map);

    // create layer controls
    createLayerControls(); 
}

// function that sets the style of the geojson layer
var roofsStyle = function (feature, latlng){
        var value = feature.properties.TotalSF;
        var setRadius = null; 
        if(value >= 1000 && value <= 5500){
            setRadius = 100;
        }
        if(value > 5500 && value <= 12000){
            setRadius = 200;
        }
        if(value > 12000 && value <= 21250){
            setRadius = 300;
        }
        if(value > 21250 && value <= 40000){
            setRadius = 400;
        }
        if(value > 40000){
            setRadius = 500;
        }

    var CoolRoofsMarker = L.circle(latlng, setRadius, {
        stroke: true,
        color: '#ffffff',
        weight: 1,
        opacity: 1,
        fillColor: '#000000',
        fillOpacity: .5,

    })

    return CoolRoofsMarker;
}

function createLayerControls(){
    // add in layer controls
    var baseMaps = {
        "CartoDB Basemap": CartoDBTiles,
    };

    var overlayMaps = {
        "Cool Roofs": roofsGeoJSON,
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);
    
}
*/


/*
// add in a legend to make sense of it all
// create a container for the legend and set the location

var legend = L.control({position: 'bottomright'});

// using a function, create a div element for the legend and return that div
legend.onAdd = function (map) {

    // a method in Leaflet for creating new divs and setting classes
    var div = L.DomUtil.create('div', 'legend'),
        amounts = [0, 1, 3, 5, 7, 9];

        div.innerHTML += '<p>Percentage Population<br />That Moved to US in<br />the Last Year</p>';

        for (var i = 0; i < amounts.length; i++) {
            div.innerHTML +=
                '<i style="background:' + fillColorPercentage(amounts[i] + 1) + '"></i> ' +
                amounts[i] + (amounts[i + 1] ? '% &ndash;' + amounts[i + 1] + '%<br />' : '% +<br />');
        }

    return div;
};


// add the legend to the map
legend.addTo(map);
*/



// lets add data from the API now
// set a global variable to use in the D3 scale below
// use jQuery geoJSON to grab data from API
$.getJSON( "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$$app_token=rQIMJbYqnCnhVM9XNPHE9tj0g&complaint_type=Graffiti", function( data ) {
    var dataset = data;
    // draw the dataset on the map
    plotAPIData(dataset);
    createListForClick(dataset);
});

// create a leaflet layer group to add your API dots to so we can add these to the map
var apiLayerGroup = L.layerGroup();

// since these data are not geoJson, we have to build our dots from the data by hand
function plotAPIData(dataset) {
    // set up D3 ordinal scle for coloring the dots just once
    var ordinalScale = setUpD3Scale(dataset);
    console.log(ordinalScale("Noise, Barking Dog (NR5)"));

    var count = 0;

    var popup = new L.Popup();

    // loop through each object in the dataset and create a circle marker for each one using a jQuery for each loop
    $.each(dataset, function( index, value ) {

        // check to see if lat or lon is undefined or null
        if ((typeof value.latitude !== "undefined" || typeof value.longitude !== "undefined") || (value.latitude && value.longitude)) {
            // create a leaflet lat lon object to use in L.circleMarker
            var latlng = L.latLng(value.latitude, value.longitude);
     
            var apiMarker = L.circleMarker(latlng, {
                stroke: .1,
                color: '#ffffff',
                fillColor: ordinalScale(value.location_type),
                fillOpacity: 1,
                radius: 4
            });

            // bind a simple popup so we know what the noise complaint is
            //apiMarker.bindPopup(value.location_type);
            apiMarker.on("click", function (e) {
        var bounds = apiMarker.getBounds();
        var popupContent = "<strong>Type:</strong> " + value.location_type;
        popup.setLatLng(bounds.getCenter());
        popup.setContent(popupContent);
        map.openPopup(popup);
    });

            apiMarker._leaflet_id = 'LayerID' + count;
            count++;
            // add dots to the layer group
            apiLayerGroup.addLayer(apiMarker);

        }

    });

    apiLayerGroup.addTo(map);

}

function setUpD3Scale(dataset) {
    console.log(dataset);
    // create unique list of descriptors
    // first we need to create an array of descriptors
    var descriptors = [];

    // loop through descriptors and add to descriptor array
    $.each(dataset, function( index, value ) {
        descriptors.push(value.descriptor);
    });

    // use underscore to create a unique array
    var descriptorsUnique = _.uniq(descriptors);

    // create a D3 ordinal scale based on that unique array as a domain
    var ordinalScale = d3.scale.category20b()
        .domain(descriptorsUnique);

    return ordinalScale;

}
/*
// empty L.popup so we can fire it outside of the map
var popup = new L.Popup();

// set up a counter so we can assign an ID to each layer
var count = 0;

// on each feature function that loops through the dataset, binds popups, and creates a count
var OnEachFeature = function(feature,layer){ 
        // let's bind some feature properties to a pop up with an .on("click", ...) command. We do this so we can fire it both on and off the map
    layer.on("click", function (e) {
        var bounds = layer.getBounds();
        var popupContent = "<strong>Type:</strong> " + feature.location_type;
        popup.setLatLng(bounds.getCenter());
        popup.setContent(popupContent);
        map.openPopup(popup);
    });

    // we'll now add an ID to each layer so we can fire the popup outside of the map
    layer._leaflet_id = 'LayerID' + count;
    count++;

}
*/
// function to create a list in the right hand column with links that will launch the pop-ups on the map
function createListForClick(dataset) {
    // use d3 to select the div and then iterate over the dataset appending a list element with a link for clicking and firing
    // first we'll create an unordered list ul elelemnt inside the <div id='list'></div>. The result will be <div id='list'><ul></ul></div>
    var ULs = d3.select("#list")
                .append("ul");
console.log(dataset);
    // now that we have a selection and something appended to the selection, let's create all of the list elements (li) with the dataset we have 
    ULs.selectAll("li")
        .data(dataset)
        .enter()
        .append("li")
        .html(function(d) { 
            return '<a href="#">' + d.created_date + '</a>';
        })
        .on('click', function(d, i) {
            console.log(d);
            var leafletId = 'LayerID' + i;
            map._layers[leafletId].fire('click');
        })  

}





