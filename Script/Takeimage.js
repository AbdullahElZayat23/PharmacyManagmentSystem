var video = document.querySelector("#videoElement");
var canvas = document.querySelector("#showscreenshot");

var img = document.querySelector("#showscreenshotimg");


async function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }, )
        video.srcObject = stream;
    }
}


function stopcamera(e) {

    var stream = video.srcObject;
    var tracks = stream.getTracks();
    //var len = tracks.length; for test
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }

    video.srcObject = null;
}



function takescreenshot() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    let imgAsStr = canvas.toDataURL("image/webp");
    console.log(imgAsStr);
    img.src = canvas.toDataURL("image/webp");
};