/*jshint multistr: true */
// https://developers.google.com/youtube/js_api_reference

(function () {
function set_start() {
    var pos = window.RepeatYouTubeVideos.video.getCurrentTime();
    jQuery( '#start_input' ).val(ms_format(pos));
    window.RepeatYouTubeVideos.start = pos;
    
    // move end to new start if necessary
    if (pos > window.RepeatYouTubeVideos.end) {
        jQuery( '#end_input' ).val(ms_format(pos));
        window.RepeatYouTubeVideos.end = pos;
    }
}

function set_end() {
    var pos = window.RepeatYouTubeVideos.video.getCurrentTime();
    jQuery( '#end_input' ).val(ms_format(pos));
    window.RepeatYouTubeVideos.end = pos;

    // move start to new end if necessary
    if (pos < window.RepeatYouTubeVideos.start) {
        jQuery( '#start_input' ).val(ms_format(pos));
        window.RepeatYouTubeVideos.start = pos;
    }
}

function update_repeat_status() {
    if (jQuery( '#repeat_box' ).prop('checked') ) {
        window.RepeatYouTubeVideos.interval = setInterval(
            function(){check_reset();}, 500
        );
    } else {
        clearInterval(window.RepeatYouTubeVideos.interval);
    }
}

function check_reset() {
    var player = window.RepeatYouTubeVideos.video;
    // If the video has reached or gone past the end of the repeat interval,
    // go to the beginning of the repeat interval
    if( player.getCurrentTime() >= window.RepeatYouTubeVideos.end &&
       player.getPlayerState() != 2) {
        player.seekTo(window.RepeatYouTubeVideos.start, true);
        player.playVideo();
    }
    // If the video is at a point before the start of the repeat interval,
    // skip to the start of the repeat interval
    if( player.getCurrentTime() < window.RepeatYouTubeVideos.start &&
       player.getPlayerState() != 2) {
        player.seekTo(window.RepeatYouTubeVideos.start, true);
        player.playVideo();
    }
}

function loadjsfile(src, callback) {
    var script = document.createElement('script'),
        loaded;
    script.setAttribute('src', src);
    if (callback) {
        script.onreadystatechange = script.onload = function() {
            if (!loaded) {
                callback();
            }
            loaded = true;
        };
    }
    document.getElementsByTagName('head')[0].appendChild(script);
}

function loadcssfile(filename){
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

function ms_format(x){
    var m = Math.floor(x/60.0);
    var s = x - 60*m;

    var ret = '';
    ret += m.toString() + ':';
    if (s < 10)
        ret += '0';
    ret += s.toString();
    return ret;
}

function load_ui() {
    jQuery.noConflict();
    loadjsfile("https://code.jquery.com/ui/1.11.1/jquery-ui.js", load_content);
}

function load_content() {
    jQuery(document.body).append(
        '<div id="dialog" title="Bookmarklet">\
        <form>\
        <p>\
        <input type="checkbox" id="repeat_box" checked="true" />\
        Repeat\
        </p>\
        <p>\
        <table style="width:300px">\
            <tr>\
                <td>Start position:</td>\
                <td><input type="text" id="start_input" size="6" readonly></td>\
                <td><button type="button" id="start_butt" \
                    style="cursor: pointer !important; color: blue !important">\
                    Use current position</button></td>\
            </tr>\
            <tr>\
                <td>End position:</td>\
                <td><input type="text" id="end_input" size="6" readonly></td>\
                <td><button type="button" id="end_butt" \
                    style="cursor: pointer !important; color: blue !important">\
                    Use current position</button></td>\
            </tr>\
        </table> \
        </p>\
        </form>\
        </div>'
    );

    // Init state of repetition 
    initInterval();
    jQuery( '#repeat_box' ).prop('checked', true);
    update_repeat_status();
    
    // Handle UI events
    jQuery( '#repeat_box' ).change(update_repeat_status);
    jQuery( '#start_butt' ).click( set_start );
    jQuery( '#end_butt' ).click( set_end );

    // Show the dialog box
    jQuery( '#dialog' ).dialog({ 
        autoOpen: true, 
        width: 350,
        position: { my: "left top", at: "left top" },
        open: function(event, ui) {
           //http://jwcooney.com/2013/03/21/setting-the-z-index-and-page-position-of-a-jquery-modal-dialog/
           jQuery('.ui-dialog').css('z-index',2099999999);
           jQuery('.ui-widget-overlay').css('z-index',2099999999);
        }
    });

    window.RepeatYouTubeVideos.video.addEventListener('onStateChange',
      onytplayerStateChange);
}

function onytplayerStateChange (newState) {
  if (newState === -1) {
    jQuery( '#dialog' ).dialog('close');
    jQuery( '#repeat_box' ).prop('checked', false);
    update_repeat_status();
    initInterval();
  }
}

//Set interval values and UI elements
function initInterval () {
    var player = window.RepeatYouTubeVideos.video;
    window.RepeatYouTubeVideos.start = 0;
    window.RepeatYouTubeVideos.end = player.getDuration();

    jQuery( '#start_input' ).val(ms_format(window.RepeatYouTubeVideos.start));
    jQuery( '#end_input' ).val(ms_format(window.RepeatYouTubeVideos.end));
}

// If the bookmarklet has not been loaded yet
if (!window.RepeatYouTubeVideos) {
    window.RepeatYouTubeVideos = {};
    window.RepeatYouTubeVideos.video = document.getElementById('movie_player');
    if (!window.RepeatYouTubeVideos.video) {
      return;
    }

    loadcssfile("https://code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css");

    // Dumb: promises would be better
    loadjsfile("https://code.jquery.com/jquery-2.1.1.min.js", load_ui);
} else {
    // open the window again if it was closed
    if ( !jQuery( '#dialog' ).dialog('isOpen') ) {
        jQuery( '#dialog' ).dialog( 'open' );
    }
}
})();

