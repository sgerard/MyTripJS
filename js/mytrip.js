var options = {
    homeButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    infoBox: false,
    creditContainer: "creditsContainer",
    timeline: false,
    animation: false
};
var viewer = new Cesium.Viewer('cesiumContainer', options);
viewer.baseLayerPicker.viewModel.selectedImagery = viewer.baseLayerPicker.viewModel.imageryProviderViewModels[1];

var billboards = viewer.scene.primitives.add(new Cesium.BillboardCollection());
var destinations = {};

var duration = 3.0;
var started = false;

$("#carousel").slick({
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    //autoplay: true,
    //autoplaySpeed: 2000,
    //fade: true,
    arrows: true
});

var soundID = "music";
var soundInstance = null;

var handleLoad = function() {
    $("#soundControl").removeAttr("disabled");
};

var loadSound = function() {
    createjs.Sound.on("fileload", handleLoad);
    createjs.Sound.registerSound("sounds/music.mp3", soundID);
};

$("#soundControl").click(function() {
    if (soundInstance == null) {
        soundInstance = createjs.Sound.play(soundID, {loop: -1, volume: 0.5});
    } else {
        soundInstance.paused = !soundInstance.paused;
    }
    $(this).find("i").toggleClass("fa-play fa-stop");
});

var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var clearCarousel = function() {
    var numSlides = $("#carousel img").length;
    for (var i = numSlides - 1; i >= 0; i--) {
        $('#carousel').slick('slickRemove', 0);
    }
};

var fillCarousel = function(day) {
    clearCarousel();
    var dayStr = day.toISOString().slice(0, 10);
    if (dayStr in thumbs) {
        var dayThumbs = thumbs[dayStr];
        console.log(dayThumbs);
        var numSlides = dayThumbs.length;
        for (var i = numSlides - 1; i >= 0; i--) {
            var imageUrl = dayThumbs[i];
            $('#carousel').slick('slickAdd','<div><img class="thumb" src="thumbs/' + imageUrl + '"></div>');
        };
        //$('#carousel').slick('slickPlay');
        }
};

var thumbs = null;

var thumbsUrl = "data/thumbs.json";
$.getJSON(thumbsUrl, function(data) {
    console.log(data);
    thumbs = data;
});

var countryCodes = null;
var countryCodesUrl = "data/countryCodes.json";
$.getJSON(countryCodesUrl, function(data) {
    console.log(data);
    countryCodes = data;
});

function replaceFullImage() {
    var thumbUrl = $(".slick-current img.thumb").attr("src");
    var imgUrl = "images/" + thumbUrl.split("/")[1];
    $("img.full").attr("src", imgUrl);
    $(".slick-current img.thumb").addClass("gray");
}

function centerModal() {
    $(this).css('display', 'block');
    var $dialog = $(this).find(".modal-dialog");
    var offset = ($(window).height() - $dialog.height()) / 2;
    // Center modal vertically in window
    $dialog.css("margin-top", offset);
}

$('.modal').on('show.bs.modal', function() {
    replaceFullImage();
    centerModal();
});

$('.modal').on('hidden.bs.modal', function() {
    $(".slick-current img.thumb").removeClass("gray");
});

$(window).on("resize", function () {
    $('.modal:visible').each(centerModal);
});

var polylines = new Cesium.PolylineCollection();
viewer.scene.primitives.add(polylines);

var addLine = function(data1, data2) {
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var coords1 = data1.coords;
    var lon1 = parseFloat(coords1.lon);
    var lat1 = parseFloat(coords1.lat);
    var coords2 = data2.coords;
    var lon2 = parseFloat(coords2.lon);
    var lat2 = parseFloat(coords2.lat);
    var p0 = Cesium.Cartesian3.fromDegrees(lon1, lat1);
    var p1 = Cesium.Cartesian3.fromDegrees(lon2, lat2);
    var pm = new Cesium.Cartesian3();
    pm = Cesium.Cartesian3.add(p0, p1, pm);
    pm = Cesium.Cartesian3.normalize(pm, pm);
    var r = ellipsoid.radii.z;
    pm = Cesium.Cartesian3.multiplyByScalar(pm, r * 1.2, pm);

    var times = [0.0, 0.5, 1.0];
    var points = [p0, pm, p1];

    var crspline = new Cesium.CatmullRomSpline({
        times: times,
        points: points
    });

    var tangents = [crspline.firstTangent];

    for (var i = 1; i < points.length - 1; i++) {
        var val = new Cesium.Cartesian3();
        val = Cesium.Cartesian3.subtract(points[i + 1], points[i - 1], val);
        tangents.push(Cesium.Cartesian3.multiplyByScalar(val, 1.0, val));
    }

    tangents.push(crspline.lastTangent);

    hspline = Cesium.HermiteSpline.createC1({
        points: points,
        tangents: tangents,
        times: times
    });

    var positions = [];
    var segments = 32;
    for (var i = 0; i <= segments; i++) {
        positions.push(hspline.evaluate(i * 1.0 / segments));
    }

    var polyline = polylines.add({
        positions: positions,
        //material: material,
        width: 6.0
    });
};

//var coordsUrl = "https://script.google.com/macros/s/AKfycbyJy1PZ5SVtWSD9bTHJNOsFwS6lvaZjo8NdYzevdHlwuqhJgi1s/exec";
var coordsUrl = "data/coords.json";
$.getJSON(coordsUrl, function(data) {
    var index = 0;
    var lon = 0;
    var lat = 0;
    console.log(data);

    var onMoveCompleted = function() {

        if (index < data.length && started == true) {
            index++;
            var currentPlace = data[index];
            var previousPlace = data[index - 1];
            if (previousPlace.coords.lon == currentPlace.coords.lon &&
                previousPlace.coords.lat == currentPlace.coords.lat) {
                console.log("Same place");
                displayDestination(currentPlace);
                setTimeout(onMoveCompleted, duration * 1000);
            } else {
                console.log("Different place");
                gotoDestination(index);
            }
        }
    };

    var displayDestination = function(placeObj) {
        var day = new Date(placeObj.day);
        var countryParts = placeObj.place.split(", ");
        var city = countryParts[0];
        var country = countryParts[1];
        var place = '<span>' + city + '</span><span class="country">(<span class="flag-icon flag-icon-' + countryCodes[country] + '"></span><span>' + country + '</span>)</span>';
        $("#commands .panel .panel-body #place").html(place);
        $("#commands .panel .panel-body #day").text(day.toLocaleDateString());
        fillCarousel(day);
    };

    var gotoDestination = function(index) {
        var placeObj = data[index];
        var lon = parseFloat(placeObj.coords.lon);
        var lat = parseFloat(placeObj.coords.lat);

        if (placeObj.place in destinations) {
            console.log("A billboard already exists for: " + placeObj.place);
        } else {
            var billboard = billboards.add({
                show: true,
                id: 'pushpin-green',
                scale: 0.5,
                position : Cesium.Cartesian3.fromDegrees(lon, lat),
                image : 'pushpin-green.svg',
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            });
            destinations[placeObj.place] = billboard;
        }

        displayDestination(placeObj);

        addLine(data[index - 1], data[index]);

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 50000.0),
            duration: 3.0,
            complete: onMoveCompleted
        });
    };

    var log = function(text) {
        console.log(text);
        $("#logs").text(text);
    };

    var previousDestination = function() {
        if (index > 0) {
            index--;
            log("Return to previous destination: " + index);
            $("#nextButton").removeAttr("disabled");
            if (index == 0)
                $("#previousButton").attr("disabled", "disabled");
            gotoDestination(index);
        }
    };

    var nextDestination = function() {
        if (index < data.length) {
            index++;
            log("Go to next destination: " + index);
            $("#previousButton").removeAttr("disabled");
            if (index == data.length)
                $("#nextButton").attr("disabled", "disabled");
        }
        gotoDestination(index);
    };

    var init = function() {
        loadSound();

        $("#startButton").removeAttr("disabled");

        $("#startButton").click(function() {
            log("Start my trip");
            $("#stopButton").removeAttr("disabled");
            $("#startButton").attr("disabled", "disabled");

            started = true;

            gotoDestination(index);
        });

        $("#stopButton").click(function() {
            log("Stop my trip");
            $("#startButton").removeAttr("disabled");
            $("#stopButton").attr("disabled", "disabled");
            started = false;
        });

        $("#nextButton").click(nextDestination);

        $("#previousButton").click(previousDestination);

        $(document).on("click", "img.thumb", function() {
            log("Show image");
            $("#imgPopup").modal();
        });

        // display first place
        var placeObj = data[index];
        var lon = parseFloat(placeObj.coords.lon);
        var lat = parseFloat(placeObj.coords.lat);
        viewer.camera.setView({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 50000.0)
        })
        displayDestination(placeObj);
    };

    init();
});

