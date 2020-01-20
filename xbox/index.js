var gamepadHTML = $("#gamepads .template").html();
$(".controller").append(gamepadHTML);

var mappingTemplate = $('#mapping-config .template .form-group');

function createMapEntry() {
    var newMap = mappingTemplate.clone();
    newMap.find("[type=radio]").attr('name', "targetType-" + Date.now());
    newMap.find("[type=radio][value=buttons]").prop("checked", true);
    newMap.find("button").data('previous-value', "Click to Set");
    return newMap;
}

function getParameter(index) {
    if (isNaN(index)) {
        return '';
    }
    var matches = [...location.search.matchAll(/[\?&]([^&#]*)/g)];
    if (!matches[index]) {
        return '';
    }
    return decodeURIComponent(matches[index][1]);
}

function switchClass(elem, switchWhat, switchTo) {
    $(elem).toggleClass(switchWhat);
    $(elem).toggleClass(switchTo);
}

function changeCssURL(cssURL) {
    cssURL = decodeURIComponent(cssURL);
    var re1 = '.*?';    // Non-greedy match on filler
    var re2 = '(gist\\.github\\.com|gist\\.githubusercontent\\.com|raw\\.githubusercontent\\.com)';    // Fully Qualified Domain Name 1
    var p = new RegExp(re1 + re2);

    if (p.test(cssURL)) {
        cssURL = cssURL.replace(p, "https://rawgit.com");
//            console.log(cssURL);
        return cssURL;
    } else {
        return cssURL;
    }
}


var pnumber = getParameter('p');
if (!pnumber) {
    pnumber = 1;
}
var controlType = getParameter('s');
var scaleSize = getParameter('sc');

var controllerRebinds = '';


var noSurvey = 1;
var allowedControllers = {
    0: 'xbox white',
    1: 'xbox',
    2: 'ps',
    3: 'nes',
    4: 'xbox-old',
    5: 'ds4',
    6: 'fpp',
    7: 'fight-stick',
    8: 'ds4 white',
    9: 'gc',
    10: 'ps white'
};
var allowedPlayers = [1, 2, 3, 4];
var skinSwitch = (controlType !== '') ? allowedControllers[controlType] : 'xbox';
var gpController = $('#gamepads .controller');

if (pnumber !== '' && $.inArray(pnumber, allowedPlayers !== -1)) {
    playernum = pnumber - 1;
    $('#gamepad-' + playernum).toggleClass('active');
    if (controlType !== '' && typeof allowedControllers[controlType] !== 'undefined') {
        switchClass('#gamepads .controller', 'xbox', allowedControllers[controlType]);
    }
    $('.hide-me').remove();
    $('html, body').css({"cssText": "background: transparent !important; overflow: hidden;"});
    gpController.addClass('half');
    gpController.css({transform: 'scale(' + scaleSize + ') translate(-50%,-50%)', "transform-origin": '0 0'});
} else {

}

$('.pselect .player').on('change', function () {
    var value = $('select').val();
    var player = $(".player option:selected").text();
    var title = "Gamepad Viewer";

    $('.controller').removeClass('active');
    $('#' + value).addClass('active');
    if (!player) {
        $(document).attr('title', title);
    } else {
        $(document).attr('title', title + ' - ' + player);
    }
});
var consoleSelect = $('.console');
consoleSelect.data("previous-value", $('#cselect').val());
consoleSelect.toggleClass($('#cselect').val());

// on change
consoleSelect.change(function () {
    var style = $(this).val();
    var previousValue = $(this).data("previous-value");
    // do things with the previous value
    switchClass('#gamepads .controller', previousValue, style);
    switchClass(this, previousValue, style);
    // update previous value
    $(this).data("previous-value", $(this).val());
});
var bindBase = $('#player-base');
bindBase.data("previous-value", bindBase.val());

// on change
bindBase.change(function () {
    var id = $(this).val();
    var previousValue = $(this).data("previous-value");
    // do things with the previous value
    switchClass('#gamepad-map-' + id, "active", "");
    switchClass('#gamepad-map-' + previousValue, "active", "");
    // update previous value
    $(this).data("previous-value", $(this).val());
});