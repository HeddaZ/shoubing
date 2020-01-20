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

function switchClass(el, oldClass, newClass) {
    $(el).removeClass(oldClass);
    $(el).addClass(newClass);
}

// 配置参数
const defaultPlayerId = 1;
const defaultControllerId = 0;
var allowedPlayers = [1, 2, 3, 4];
var allowedControllers = {0: 'xbox white', 1: 'xbox', 5: 'ds4', 8: 'ds4 white'};
var controllerRebinds = '';
var controllerId = defaultControllerId;
var playerId = getParameter(0);
if (!playerId || $.inArray(playerId, allowedPlayers) !== -1) {
    playerId = defaultPlayerId;
}

// 使用模板初始化手柄显示
$("#gamepads .controller").append($("#gamepads .template").html());
if (allowedControllers[controllerId]) {
    switchClass('#gamepads .controller', allowedControllers[defaultControllerId], allowedControllers[controllerId]);
}
switchClass('#gamepad-' + (playerId - 1), 'inactive', 'active');



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