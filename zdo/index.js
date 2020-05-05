function getParameter(index) {
    if (isNaN(index)) {
        return '';
    }
    let parameters = location.search.split(/\?|&/g);
    if (!parameters[index + 1]) {
        return '';
    }
    return decodeURIComponent(parameters[index + 1]);
}

function switchClass(selector, oldClass, newClass) {
    $(selector).removeClass(oldClass);
    $(selector).addClass(newClass);
}

// 配置参数
const defaultPlayerId = 1;
const defaultControllerId = 0;
var allowedPlayers = [1, 2, 3, 4];
var allowedControllers = {0: 'xbox white', 1: 'xbox', 5: 'ds4', 8: 'ds4 white'};
var controllerRebinds = '';
var controllerId = defaultControllerId;
var playerId = getParameter(0);
if (!playerId || isNaN(playerId)) {
    playerId = defaultPlayerId;
} else {
    playerId = parseInt(playerId);
    if (!allowedPlayers.includes(playerId)) {
        playerId = defaultPlayerId;
    }
}

// 设置手柄类型
if (controllerId != defaultControllerId && allowedControllers[controllerId]) {
    switchClass('#gamepads .controller', allowedControllers[defaultControllerId], allowedControllers[controllerId]);
}
// 初始化手柄显示
var gamepadHTML = $("#gamepads .template").html();
$("#gamepads .controller").append(gamepadHTML);
// 激活指定手柄
switchClass('#gamepad-' + (playerId - 1), 'inactive', 'active');