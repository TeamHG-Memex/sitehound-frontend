/*jslint browser: true, unparam: true */

/*globals tangelo, $, d3 */

var transition_time = 1000;

var width = 960,
    height = 480;

var overlay;
var svg;
var g;
var googleMapProjection;
var currentGeoJson = [];
var map;
var startTime = new Date();
var endTime = new Date();
var mySlider;
var animate = false;
var playSpeed = .1;
var animateInterval = 10;
var timeout = null;

var defaultColors = ["red", "blue", "green", "magenta", "sienna", "teal", "goldenrod", "cyan", "indigo", "springgreen"];


// set up the map and its overlay
$(function () {

    //create google map
    var $map=$("#map");
    map = new google.maps.Map($map[0], {
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(0, 0)
//        mapTypeControl: false
    });

    //create the overlay on which we will draw our heatmap
    overlay = new google.maps.OverlayView();

    overlay.onAdd = function () {
        var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "SvgOverlay");
        svg = layer.append("svg");
        g = svg.append("g");//.attr("id", "polys");

        overlay.draw = function () {
            var markerOverlay = this;
            var overlayProjection = markerOverlay.getProjection();

            // Turn the overlay projection into a d3 projection
            googleMapProjection = function (coordinates) {
                var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
                var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
                return [pixelCoordinates.x+4000, pixelCoordinates.y+4000];
            }

            path = d3.geo.path().projection(googleMapProjection);

            geodata = g.selectAll("path")
                .data(currentGeoJson, trackid)
                .attr("d", path);

            geodata.enter()
                .append("svg:path")
                .attr("opacity", .5)
                .attr("fill", "none")
                .attr("stroke", function (d) { return getColor(d.index); })
                .attr("d", path);

            geodata.exit().remove();

            var node = g.selectAll("circle")

            var geocircles = g.selectAll("circle")
                .data(currentGeoJson, trackid)

                .attr('cx', function(d) {
                    var coordinates = googleMapProjection([d.coordinates[0][0], 0]);
                    return coordinates[0];
                })
                .attr('cy', function(d) {
                    var coordinates = googleMapProjection([0, d.coordinates[0][1]]);
                    return coordinates[1];
                });


           var nodes =  geocircles.enter().append("g")
           nodes.each(function(d,i){

                // this doesn't work? should be able to display node text next to circles
               d3.select(this).append("text")

                   .text(function(d) {  return "hello"} )
                   .attr("fill","black")
                   .attr("stroke","black")
                   .attr("font-size","5pt")
                   .attr("stroke-width","0.5px")
                   .attr("opacity", 1)


               d3.select(this).append('svg:circle')
/*
                   .attr('cx', function(d) {
                       var coordinates = googleMapProjection([d.coordinates[0][0], 0]);
                       return coordinates[0];
                   })
                   .attr('cy', function(d) {
                       var coordinates = googleMapProjection([0, d.coordinates[0][1]]);
                       return coordinates[1];
                   })*/
                   .attr('r', 7)
                   .attr("opacity", 1)
                   .attr("fill", function (d) { return getColor(d.index); })
                   .attr('stroke', "gray")
                   .append("title").text(function(d) {return d.track_id})

           })


            geocircles.exit().remove();

        };



    };

    overlay.setMap(map);

    $("#play").click(playClicked)


    $("#refresh").click(function () {
        Reset(false);
    });


    $("#reset").click(function () {
        Reset(true);
    });
});



// define a function to get url parameters
$.urlParam = function(name, url) {
    if (!url) {
        url = window.location.href;
    }
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) {
        return 0;
    }
    return results[1] || 0;
}



function playClicked() {
    animate = !animate;

    var buttonLabel = "Play";
    if (animate) {
        buttonLabel = "Pause";
        timeout = setInterval(AnimateTracks, animateInterval);
    } else {
        clearInterval(timeout);
    }
    $("#play").text(buttonLabel);

    if (timeSlider.value() >= 100) {
        timeSlider.value(0);
    }
}

function Reset(full) {
    console.log("Current Bounds: "+map.getBounds());

    map.setCenter(new google.maps.LatLng(0, 0));
    map.setZoom(2);

    currentGeoJson = [];
    if (overlay && overlay.draw) overlay.draw();
}




function get_attribute_paths(attr,id,type){

    $.ajax({
        url: 'trackservice/attrpaths',
        data: {'attr':attr, 'id':id,'type':type},
        dataType: 'text',

        success: function (response){
            Reset(false);
            var data = jQuery.parseJSON(response)
            currentGeoJson = data.result


            var xdiff = data.bounds.east - data.bounds.west;
            var ydiff = data.bounds.north - data.bounds.south;

            var centerx = xdiff / 2 + data.bounds.west;
            var centery = ydiff / 2 + data.bounds.south;

            map.setCenter(new google.maps.LatLng(centery, centerx));

            var sw = new google.maps.LatLng(data.bounds.south, data.bounds.west);
            var ne = new google.maps.LatLng(data.bounds.north, data.bounds.east);
            map.fitBounds(new google.maps.LatLngBounds(sw, ne));
            console.log("Current Bounds: "+map.getBounds());

            startTime = new Date(data.start * 1000);
            endTime = new Date(data.end *1000);

            d3.select('#slidertext').text(startTime);

            tau = 2 * Math.PI;
            angle = tau / data["result"].length;
            $.each(data["result"], function (i, v) {
                data["result"][i].x = (width / 4) * Math.cos(i * angle) + (width / 2);
                data["result"][i].y = (height / 4) * Math.sin(i * angle) + (height / 2);
            });
            overlay.draw();

        },
        error: function (jqxhr,textStatus,reason){
            alert("error "+textStatus+" "+reason)
        }

    })
}





function SetCircles(value) {
    console.log("setCicles. value= "+value)
    var currentDate = new Date(startTime.getTime() + ((endTime.getTime() - startTime.getTime()) * value / 100));
    d3.select('#slidertext').text(currentDate);

    //update circles
    var geocircles = g.selectAll("circle")
        .attr('cx', function(d) {
            var xCoord = 0;
            var yCoord = 0;

            var beforeIndex = 0;
            var afterIndex = 0;
            for(var i=0;i<d.timestamps.length;i++) {
                var compareDate = new Date( d.timestamps[i] *1000);
                if (currentDate > compareDate) {
                    beforeIndex = i;
                    afterIndex = i;
                } else if (currentDate < compareDate) {
                    afterIndex = i;
                    break;
                } else {
                    beforeIndex = i;
                    afterIndex = i;
                    break;
                }
            }

            if (beforeIndex == afterIndex) {
                return googleMapProjection(d.coordinates[beforeIndex])[0];
            } else {
                var beforeTime = new Date(d.timestamps[beforeIndex] * 1000);
                var afterTime = new Date(d.timestamps[afterIndex] * 1000);

                var indexDiff = new Date(afterTime.getTime() - beforeTime.getTime());
                var currentDiff = new Date(currentDate.getTime() - beforeTime.getTime());

                var percent = currentDiff / indexDiff;

                var beforeX = d.coordinates[beforeIndex][0];
                var afterX = d.coordinates[afterIndex][0];

                var beforeY = d.coordinates[beforeIndex][1];
                var afterY = d.coordinates[afterIndex][1];

                xCoord = (afterX - beforeX) * percent + beforeX;
                yCoord = (afterY - beforeY) * percent + beforeY;
            }

            var brng = bearing(beforeY, afterY, beforeX, afterX);
            var dist = distance(beforeY, afterY, beforeX, afterX);
            var newCoords = destination(beforeY, beforeX, brng, dist * percent);

            var coordinates = googleMapProjection(newCoords);
            return coordinates[0];
        })
        .attr('cy', function(d) {
            var xCoord = 0;
            var yCoord = 0;

            var beforeIndex = 0;
            var afterIndex = 0;
            for(var i=0;i<d.timestamps.length;i++) {
                var compareDate = new Date( d.timestamps[i] * 1000 );
                if (currentDate > compareDate) {
                    beforeIndex = i;
                    afterIndex = i;
                } else if (currentDate < compareDate) {
                    afterIndex = i;
                    break;
                } else {
                    beforeIndex = i;
                    afterIndex = i;
                    break;
                }
            }


            if (beforeIndex == afterIndex) {
                return googleMapProjection(d.coordinates[beforeIndex])[1];
            } else {
                var beforeTime = new Date(d.timestamps[beforeIndex] * 1000);
                var afterTime = new Date( d.timestamps[afterIndex] * 1000);

                var indexDiff = new Date(afterTime.getTime() - beforeTime.getTime());
                var currentDiff = new Date(currentDate.getTime() - beforeTime.getTime());

                var percent = currentDiff / indexDiff;

                var beforeX = d.coordinates[beforeIndex][0];
                var afterX = d.coordinates[afterIndex][0];

                var beforeY = d.coordinates[beforeIndex][1];
                var afterY = d.coordinates[afterIndex][1];

                xCoord = (afterX - beforeX) * percent + beforeX;
                yCoord = (afterY - beforeY) * percent + beforeY;
            }

            var brng = bearing(beforeY, afterY, beforeX, afterX);
            var dist = distance(beforeY, afterY, beforeX, afterX);
            var newCoords = destination(beforeY, beforeX, brng, dist * percent);

            var coordinates = googleMapProjection(newCoords);
            return coordinates[1];
        });




}

function AnimateTracks() {
    var currentValue = timeSlider.value()+playSpeed;
    timeSlider.value(currentValue);

    if (timeSlider.value() >= 100) {
        animate = false;
        $("#play").text("Play");
        clearInterval(timeout);
    } else {
        SetCircles(currentValue);
    }

    d3.select('#time-slider').selectAll("a").attr("style", "left: "+currentValue+"%;");
}

function pad(num, size) {
    var s = "000000" + num;
    return s.substr(s.length-size);
}

function edgeid(edge) {
    return edge.source + ':' +  edge.target;
}

function trackid(track) {
    return track.track_id;
}

function getColor(index) {
    var trackColor;
    if (index >= defaultColors.length) {
        trackColor = '#'+pad(Math.floor(Math.random()*16777215).toString(16),6);
        defaultColors.push(trackColor);
    } else {
        trackColor = defaultColors[index];
    }

    return trackColor;
}

function destination(lat1, lon1, brng, d) {
    var R = 6371;
    var brngR = brng.toRad();
    var lat1r = lat1.toRad();
    var lon1r = lon1.toRad();
    var lat2 = Math.asin( Math.sin(lat1r)*Math.cos(d/R) +
        Math.cos(lat1r)*Math.sin(d/R)*Math.cos(brngR) );
    var lon2 = lon1r + Math.atan2(Math.sin(brngR)*Math.sin(d/R)*Math.cos(lat1r),
            Math.cos(d/R)-Math.sin(lat1r)*Math.sin(lat2));
    return [lon2.toDeg(), lat2.toDeg()];
}

function bearing(lat1, lat2, lon1, lon2) {
    var dLon = (lon2 - lon1).toRad();
    var lat1r = lat1.toRad();
    var lat2r = lat2.toRad();
    var y = Math.sin(dLon) * Math.cos(lat2r);
    var x = Math.cos(lat1r)*Math.sin(lat2r) -
        Math.sin(lat1r)*Math.cos(lat2r)*Math.cos(dLon);
    var brng = Math.atan2(y, x).toDeg();
    return brng;
}

function distance(lat1, lat2, lon1, lon2) {
    var R = 6371; // km
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var lat1r = lat1.toRad();
    var lat2r = lat2.toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1r) * Math.cos(lat2r);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
}

Number.prototype.toRad = function() {
    return this * Math.PI / 180;
}


// Load the UI controls
window.onload = function () {

    // Create control panel.
    $("#control-panel").controlPanel();


    // check for query params on the page, search if a query was submited
    var attr = decodeURI($.urlParam("attr"))
    var id = decodeURI($.urlParam("id"))
    var type = decodeURI($.urlParam("type"))
    if (attr != 0 && id != 0){
        get_attribute_paths(attr,id,type)
    }
    else if (id !=0){
        get_attribute_paths(undefined,id,type)
    }

    d3.select('#slidertext').text(startTime);
    d3.select('#time-slider').call(timeSlider = d3.slider().on("slide", function(evt, value) {
        SetCircles(value);
    }));


};