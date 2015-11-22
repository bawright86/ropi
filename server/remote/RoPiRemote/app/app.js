﻿var socket = null;
var baseServerUrl = "";
var robotIpEntry = null;
var cameraButton = null;
var connectButton = null;
var controlsButton = null;
var robotIpCookieName = "RobotIP";

$(document).ready(function () {

    var getRobotIp = function () {
        var tmp = robotIpEntry.val();
        if (tmp == null || tmp === "") {
            tmp = Cookies.get(robotIpCookieName);
            if (tmp == null || tmp === "") {
                tmp = "raspberrypi";
            }
        }
        return tmp;
    }

    var storeRobotIp = function () {
        var tmp = robotIpEntry.val();
        Cookies.set(robotIpCookieName, tmp);
    }

    var getToggleStatus = function (toggle) {
        return toggle != null && toggle.prop("checked");
    }

    var getIsConnected = function () {
        return getToggleStatus(connectButton);
    }

    var getIsCameraActive = function () {
        return getToggleStatus(cameraButton);
    }

    var getIsControlsActive = function () {
        return getToggleStatus(controlsButton);
    }

    var disableControlsButton = function () {
        controlsButton.bootstrapToggle("off");
        controlsButton.bootstrapToggle("disable");
    }

    var enableControlsButton = function () {
        controlsButton.bootstrapToggle("enable");
        if (!getIsControlsActive()) {
            controlsButton.bootstrapToggle("on");
        }
    }

    var connect = function () {
        socket = io.connect("http://" + getRobotIp() + ":80/", { 'forceNew': true });
        socket.on("connected", function (msg) {
            //updateConnectionStatus(true, msg);
        });
        socket.on("disconnected", function (msg) {
            //updateConnectionStatus(false, msg);
        });
        socket.on("parking", function (msg) {
            parking.update(msg);
        });

        socket.emit("connect");

        baseServerUrl = "http://" + getRobotIp() + ":80/ropi/api/v1.0/";
    };

    var disconnect = function () {
        if (socket !== null) {
            socket.disconnect();
        }
    };

    var processToggleControls = function () {
        if (!getIsCameraActive()) return;
        if (getIsControlsActive()) {
            controls.showCameraControls();
        } else {
            controls.hideCameraControls();
        }
    };

    var processToggleCamera = function () {
        var camera = $("#camera");
        if (getIsCameraActive()) {
            camera.attr("src", "http://" + getRobotIp() + ":8080/stream/video.mjpeg");
            camera.show();
            enableControlsButton();
        } else {
            camera.attr("src", "");
            camera.hide();
            controls.hideCameraControls();
            disableControlsButton();
        }
    };

    var processRobotToggle = function () {
        if (getIsConnected()) {

            storeRobotIp();

            // ask IP , abandon on Cancel
            $('#exampleModal').modal({ backdrop: 'static', keyboard: false });
            $('#exampleModal').on('hidden.bs.modal', function(e) {
                connect();
                controls.showRobotControls();
                if (!getIsCameraActive()) {
                    cameraButton.bootstrapToggle("toggle");
                }
                enableControlsButton();
            });


        } else {
            controls.hideRobotControls();
            disconnect();
            if (!getIsCameraActive()) {
                disableControlsButton();
            }
        }
    };

    var run = function () {
        robotIpEntry = $("#robotIP");
        robotIpEntry.val(getRobotIp());

        cameraButton = $("#cameraButton");
        cameraButton.bootstrapToggle();
        cameraButton.change(function () {
            processToggleCamera();
        });

        connectButton = $("#connectButton");
        connectButton.bootstrapToggle();
        connectButton.change(function () {
            processRobotToggle();
        });

        controlsButton = $("#controlsButton");
        controlsButton.bootstrapToggle();
        controlsButton.change(function () {
            processToggleControls();
        });
        controlsButton.bootstrapToggle("disable");
    }

    // go!
    run();
})