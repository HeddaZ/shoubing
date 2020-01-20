var gamepadHTML = $("#gamepads .template").html();
$(".controller").append(gamepadHTML);

var mappingTemplate = $('#mapping-config .template .form-group');
var mappingID = $('#mapping-config');
function createMapEntry() {
    var newMap = mappingTemplate.clone();
    newMap.find("[type=radio]").attr('name', "targetType-" + Date.now());
    newMap.find("[type=radio][value=buttons]").prop("checked", true);
    newMap.find("button").data('previous-value', "Click to Set");
    return newMap;
}

function createUIFromMapping(mappingObj) {
    $.each(mappingObj.mapping, function (key, value) {
        function setButtonValues() {
            currentItem.find('[data-object]:not([data-object=""])').each(function () {
                var dataObject = $(this).data("object");
                var properNames = {
                    axes: "Axis",
                    buttons: "Button"
                };
                var displayName = (currentItem.find(".axes-config").prop("checked") || currentItem.find("input[type=radio][value=dpad]").prop("checked")) ? properNames[dataObject.choiceType] + " " + dataObject.choice : ((dataObject.choiceOperand) ? properNames[dataObject.choiceType] + " " + dataObject.choice + " " + dataObject.choiceOperand : properNames[dataObject.choiceType] + " " + dataObject.choice);
                $(this).html(displayName).data("previous-value", displayName);
            })
        }

        var currentItem = createMapEntry();
        if (value.disabled) {
            currentItem.find(".disable-item").prop("checked", true);
        }
        if (value.choiceType) {
            var dataObj = {};
            dataObj.choiceType = value.choiceType;
            dataObj.choice = value.choice;
            if (value.choiceOperand) {
                dataObj.choiceOperand = value.choiceOperand;
            }
            currentItem.find("[data-button=positive]").attr("data-object", JSON.stringify(dataObj));
        }
        if (value.targetType) {
            currentItem.find("select[name=" + value.targetType + "]").val(value.target);
        }
        if (value.axesConfig) {
            currentItem.find(".axes-config").prop("checked", true);
            currentItem.find("select[name=fix-type]").val(value.axesConfig.type);
            currentItem.find("[data-button=low-value]").attr("data-value", value.axesConfig.lowValue).html(value.axesConfig.lowValue).data("previous-value", value.axesConfig.lowValue);
            currentItem.find("[data-button=high-value]").attr("data-value", value.axesConfig.highValue).html(value.axesConfig.highValue).data("previous-value", value.axesConfig.highValue);
        }
        switch (value.targetType) {
            case "buttons":
                currentItem.find("input[value=buttons]").prop("checked", true);
                break;
            case "axes":
                currentItem.find("input[value=axes]").prop("checked", true);
                if (value.positive) {
                    currentItem.find("[data-button=positive]").attr("data-object", JSON.stringify(value.positive));
                }
                if (value.negative && value.negative.choiceType) {
                    currentItem.find("[data-button=negative]").attr("data-object", JSON.stringify(value.negative));
                }
                break;
            case "dpad":
                currentItem.find("input[value=dpad]").prop("checked", true);
                if (value.positions) {
                    $.each(value.positions, function (pos, val) {
                        currentItem.find("[data-button=" + pos + "]").html(val).data('previous-value', val).attr("data-value", val);
                    })
                }
                break;
            default:
                console.error('No proper target type set!');
                return true;
        }
        setButtonValues();
        currentItem.appendTo("#mappings");
    });
}

function createMapping() {
    var mapGroup = $("#mappings .form-group");
    mapGroup.find('.map-message').empty().before("<div class='map-message'></div>").remove();
    function mapMsg(message, jqThis, type) {
        jqThis.find(".map-message").addClass(type).html("<span>" + message + "</span>");
    }

    mapGroup.has('.disable-item:not(:checked) + [data-object=""]').each(function () {
        mapMsg("Please select a button/axis to map", $(this), "error");
    });
    if (mapGroup.has('[data-object]:not([data-object=""]), .disable-item:checked').length == 0) return {};
    var localMapping = {};
    localMapping.mapping = [];
    mapGroup.has('[data-object]:not([data-object=""]), .disable-item:checked').each(function () {
        var btnDisabled = $(this).find('.disable-item').prop("checked");
        var fixAxes = $(this).find('.axes-config').prop("checked");
        var obtType = $(this).find('[type=radio]:checked').val();
        var obTarget = $(this).find('select[name=' + obtType + ']').val();
        var cInfo = $(this).find('button[data-button=positive]').attr('data-object');
        var sendObj = {
            "targetType": obtType,
            "target": obTarget,
            "disabled": btnDisabled
        };
        if (btnDisabled) {
            mapMsg("Mapping successfully applied!", $(this), "success");
            localMapping.mapping.push(sendObj);
            return true;
        }

        if (fixAxes && $(this).find('.fix-axes [data-value]:not([data-value=""])').length == 2) {
            sendObj.axesConfig = {
                type: $(this).find('.fix-axes select').val(),
                lowValue: $(this).find('.fix-axes [data-button=low-value]').attr('data-value'),
                highValue: $(this).find('.fix-axes [data-button=high-value]').attr('data-value')
            }
        } else if (fixAxes) {
            mapMsg("Please set both values", $(this), "error");
            return true;
        }
        if ((typeof cInfo == "undefined" || cInfo == "")) {
            mapMsg("Please select a button/axis to map", $(this), "error");
            return true;
        }
        cInfo = JSON.parse(cInfo);
        if (obtType == "buttons") {
            $.extend(sendObj, cInfo);
        } else if (obtType == "dpad") {
            if ($(this).find('.fix-dpad [data-value]').length < 8) {
                mapMsg("Please fill in all values", $(this), "error");
                return true;
            }
            $.extend(sendObj, cInfo);
            var positions = {};
            $(this).find('.fix-dpad [data-value]').each(function () {
                var posName = $(this).attr("data-button");
                var posVal = $(this).attr("data-value");
                positions[posName] = posVal;
            });
            sendObj.positions = {};
            $.extend(sendObj.positions, positions);
        } else {
            var cInfo2 = $(this).find('button[data-button=negative]').attr('data-object');
            if ((typeof cInfo2 == "undefined" || cInfo2 == "") && !fixAxes) {
                mapMsg("Please select a second button/axis to map", $(this), "error");
                return true;
            }
            cInfo2 = cInfo2 || "{}";
            cInfo2 = JSON.parse(cInfo2);
            sendObj.choiceType = "";
            sendObj.positive = {};
            sendObj.negative = {};
            $.extend(sendObj.positive, cInfo);
            $.extend(sendObj.negative, cInfo2);
        }
        mapMsg("Mapping successfully applied!", $(this), "success");
        localMapping.mapping.push(sendObj);
    });
    return localMapping;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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


var pnumber = getParameterByName('p');
if (!pnumber)
{
    pnumber=1;
}
var controlType = getParameterByName('s');
var scaleSize = getParameterByName('sc');
var skinStyle = getParameterByName('css');
var skinEdit = getParameterByName('editcss');
var skinOpacity = getParameterByName('op');
var delayTime = getParameterByName('delay');
var deadZone = getParameterByName('dz');
var rotationStop = getParameterByName('rot');
var triggerStrength = getParameterByName('smeter');
var disableCurving = getParameterByName('nocurve');
var setOffset = getParameterByName('soffset');
function bindingSettings(paramData) {
    if (!paramData) return "";
    try {
        var rebindParse = JSON.parse(paramData);
        return rebindParse;
    } catch (e) {
        console.error("Unable to parse mapping object.");
        console.log(e);
        return "";
    }
}
var controllerRebinds = bindingSettings(getParameterByName('map'));


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
    if (controllerRebinds) {
        createUIFromMapping(controllerRebinds);
    }
}

if (delayTime !== '') {
    delayTime = parseInt(delayTime);
    tester.DELAY_TIME_MS = delayTime;
}
if (deadZone !== '') {
    deadZone = parseFloat(deadZone);
    tester.ANALOGUE_STICK_THRESHOLD = deadZone;
}
if (rotationStop !== '') {
    rotationStop = parseFloat(rotationStop);
    tester.ROTATE_BOUNDARY = rotationStop;
}

if (skinStyle !== '') {
//        console.log(skinStyle);
    switchClass('#gamepads .controller', skinSwitch, 'custom');
    $('#custom-css').append('@import url("' + changeCssURL(skinStyle) + '");');
}

if (skinEdit !== '') {
//        console.log(skinEdit);
    gpController.addClass("edit");
    $('#custom-css').append('@import url("' + changeCssURL(skinEdit) + '");');
}

if (skinOpacity !== '') {
    gpController.css("opacity", skinOpacity);
}

if (disableCurving == 1) {
    tester.STICK_CURVING = 0;
}

if (setOffset != '') {
    tester.STICK_OFFSET = parseInt(setOffset);
}

if (noSurvey == 1) {
    $('.plshalpme').remove();
}
if (triggerStrength == 1) {
    tester.TRIGGER_DISPLAY_TYPE = triggerStrength;
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