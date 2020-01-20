function getParameter(index) {
    if (isNaN(index)) {
        return '';
    }
    let matches = [...location.search.matchAll(/[\?&]([^&#]*)/g)];
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

// 设置手柄类型
if (controllerId != defaultControllerId && allowedControllers[controllerId]) {
    switchClass('#gamepads .controller', allowedControllers[defaultControllerId], allowedControllers[controllerId]);
}
// 初始化手柄显示
var gamepadHTML = $("#gamepads .template").html();
$("#gamepads .controller").append(gamepadHTML);
// 激活指定手柄
switchClass('#gamepad-' + (playerId - 1), 'inactive', 'active');