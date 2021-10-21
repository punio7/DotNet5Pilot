// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.


function formatSeconds(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = (totalSeconds % 60)
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
}