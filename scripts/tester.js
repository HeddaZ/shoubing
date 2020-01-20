/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mwichary@google.com (Marcin Wichary)
 * Modified by Hedda Zhang @ 2020.01
 */

var tester = {
    // If the number exceeds this in any way, we treat the label as active
    // and highlight it.
    VISIBLE_THRESHOLD: 0.25,
    // How far can a stick move on screen.
    STICK_OFFSET: 22,

    // If stick curving should be enabled or not
    STICK_CURVING: 1,

    TRIGGER_DISPLAY_TYPE: 0,

    // How "deep" does an analogue button need to be depressed to consider a button down.

    // For controllers like the Dualshock 3, which have analogue buttons instead of digital ones
    ANALOGUE_BUTTON_THRESHOLD: .25,
    // Analogue stick threshold
    ANALOGUE_STICK_THRESHOLD: .25,
    // Threshold for digital versions of analog buttons
    DIGITAL_THRESHOLD: .10,

    // Whether or not to start
    EVENT_LISTEN: 0,
    // ID of gamepad being monitored for input
    MONITOR_ID: '',

    // Rotation limit
    ROTATE_BOUNDARY: 120,

    // Snapshot object to test against when making remappings
    SNAPSHOT: {},

    MONITOR_TYPE: "",

    // An object list of inputs that are disabled from monitoring at the request of the user. This helps when pesky axes/buttons are interfering with the proper capture of data by constantly changing values.
    DISABLED_INPUTS: {},

    absDiff: function (a, b) {
        var result = a - b;
        result = Math.abs(result);
        return result;
    },

    ifDisabledExists: function (type, id, number) {
        if (id in tester.DISABLED_INPUTS) {
            if (type in tester.DISABLED_INPUTS[id]) {
                if (number in tester.DISABLED_INPUTS[id][type]) {
                    return true;
                }
            }
        }
        return false;
    },

    DELAY_TIME_MS: 0,

    updateQueue: new Queue(),
    processQueueCall: 0,

    init: function () {
        tester.updateGamepads();
    },

    /**
     * Tell the user the browser doesnâ€™t support Gamepad API.
     */
    showNotSupported: function () {
        document.write('不支持的手柄类型！');
    },

    /**
     * Update the gamepads on the screen, creating new elements from the
     * template.
     */
    updateGamepads: function (gamepads) {
        var els = document.querySelectorAll('.controller:not(.template)');
        for (var i = 0, el; el = els[i]; i++) {
            el.classList.add('disconnected');
        }
        var els2 = document.querySelectorAll('#player-base [value]');
        for (var i = 0, el; el = els2[i]; i++) {
            el.disabled = true;
        }
        var els3 = document.querySelectorAll('.raw-outputs:not(.template)');
        for (var i = 0, el; el = els3[i]; i++) {
            el.remove();
        }

        var padsConnected = false;
        tester.DISABLED_INPUTS = {};

        if (gamepads) {
            for (var i in gamepads) {
                var gamepad = gamepads[i];
                if (gamepad) {
                    var el2 = document.getElementById('player-base');
                    el2.querySelector('option[value="' + i + '"]').disabled = false;
                    var newRawMap = document.createElement('div');
                    newRawMap.innerHTML = document.querySelector('.raw-outputs.template').innerHTML;
                    newRawMap.id = 'gamepad-map-' + i;
                    newRawMap.className = 'raw-outputs';
                    for (var b in gamepad.buttons) {
                        var bEl = document.createElement('li');
                        bEl.setAttribute('data-shortname', 'B' + b);
                        bEl.setAttribute('data-name', 'button-' + b);
                        bEl.setAttribute('data-info', JSON.stringify({id: i, type: "buttons", number: b}));
                        bEl.title = 'Button ' + b;
                        newRawMap.querySelector(".buttons").appendChild(bEl);
                    }
                    for (var a in gamepad.axes) {
                        var aEl = document.createElement('li');
                        aEl.setAttribute('data-shortname', 'Axis ' + a);
                        aEl.setAttribute('data-name', 'axis-' + a);
                        aEl.setAttribute('data-info', JSON.stringify({id: i, type: "axes", number: a}));
                        aEl.title = 'Axis ' + a;
                        newRawMap.querySelector(".axes").appendChild(aEl);
                    }
                    var nameEl = document.createElement('h2');
                    nameEl.innerHTML = gamepad.id;
                    newRawMap.insertBefore(nameEl, newRawMap.firstChild);
                    document.querySelector('#output-display').appendChild(newRawMap);

                    var el = document.getElementById('gamepad-' + i);
                    el.querySelector('.quadrant').classList.add('p' + i);
                    el.classList.remove('disconnected');

                    padsConnected = true;
                }
            }
        }
    },

    queueButton: function (value, gamepadId, id) {
        //copy value ... because reference
        var newVal = jQuery.extend({}, value);

        tester.updateQueue.enqueue([Date.now() + tester.DELAY_TIME_MS, tester.updateButton, [newVal, gamepadId, id]]);
        tester.processQueue();
    },

    queueStick: function (value, className, gamepadId, id) {
        //copy value needed? don't know
        var newVal = jQuery.extend({}, value);

        tester.updateQueue.enqueue([Date.now() + tester.DELAY_TIME_MS, tester.updateStick, [newVal, className, gamepadId, id]]);
        tester.processQueue();
    },

    queueTrigger: function (value, gamepadId, id) {
        //copy value needed? don't know
        var newVal = jQuery.extend({}, value);

        tester.updateQueue.enqueue([Date.now() + tester.DELAY_TIME_MS, tester.updateTrigger, [newVal, gamepadId, id]]);
        tester.processQueue();
    },

    queueTriggerDigital: function (value, gamepadId, id) {
        //copy value ... because reference
        var newVal = jQuery.extend({}, value);

        tester.updateQueue.enqueue([Date.now() + tester.DELAY_TIME_MS, tester.updateTriggerDigital, [newVal, gamepadId, id]]);
        tester.processQueue();
    },

    queueAxis: function (value, valueV, gamepadId, stickId) {
        //copy value not needed?
        tester.updateQueue.enqueue([Date.now() + tester.DELAY_TIME_MS, tester.updateAxis, [value, valueV, gamepadId, stickId]]);
        tester.processQueue();
    },

    /**
     * Update a given button on the screen.
     */
    updateButton: function (value, gamepadId, id) {
        var gamepadEl = document.querySelector('#gamepad-' + gamepadId);
        var newValue = value;
        if (typeof value == 'object') {
            var newValue = value.value;
        }

        // Update the button visually.
        var buttonEl = gamepadEl.querySelector('[data-name="' + id + '"]');
        if (buttonEl) { // Extraneous buttons have just a label.
            if (newValue > tester.ANALOGUE_BUTTON_THRESHOLD) {
                buttonEl.classList.add('pressed');
            } else {
                buttonEl.classList.remove('pressed');
            }
        }

    },

    /**
     * Update a the fight stick using the name provided
     */
    updateStick: function (value, className, gamepadId, id) {
        var gamepadEl = document.querySelector('#gamepad-' + gamepadId);
        var newValue = value;
        if (typeof value == 'object') {
            var newValue = value.value;
        }

        // Update the button visually.
        var buttonEl = gamepadEl.querySelector('[data-name="' + id + '"]');
        if (buttonEl) { // Extraneous buttons have just a label.
            if (newValue > tester.ANALOGUE_BUTTON_THRESHOLD) {
                buttonEl.classList.add(className);
            } else {
                buttonEl.classList.remove(className);
            }
        }

    },

    updateTrigger: function (value, gamepadId, id) {
        var gamepadEl = document.querySelector('#gamepad-' + gamepadId);
        var newValue = value;
        if (typeof value == 'object') {
            var newValue = value.value;
        }

        // Update the button visually.
        var triggerEl = gamepadEl.querySelector('[data-name="' + id + '"]');
        if (triggerEl) {
            if (tester.TRIGGER_DISPLAY_TYPE == 1) {
                triggerEl.style.opacity = 1;
                var insetValue = (((-1 + newValue) * -1) * 100) - 0.00001;
                //var insetValue = (((-1 + newValue) * -1) * 100);
                insetValue = insetValue.toString() + "%";
                triggerEl.style.webkitClipPath = "inset(" + insetValue + " 0px 0px 0pc)";
                triggerEl.style.mozClipPath = "inset(" + insetValue + " 0px 0px 0pc)";
                triggerEl.style.clipPath = "inset(" + insetValue + " 0px 0px 0pc)";
            } else {
                triggerEl.style.opacity = newValue;
            }
        }

    },

    /**
     * Update a trigger in a binary fashion on the screen.
     */
    updateTriggerDigital: function (value, gamepadId, id) {
        var gamepadEl = document.querySelector('#gamepad-' + gamepadId);
        var newValue = value;
        if (typeof value == 'object') {
            var newValue = value.value;
        }

        // Update the button visually.
        var buttonEl = gamepadEl.querySelector('[data-name="' + id + '"]');
        if (buttonEl) { // Extraneous buttons have just a label.
            if (newValue > tester.DIGITAL_THRESHOLD) {
                buttonEl.classList.add('pressed');
            } else {
                buttonEl.classList.remove('pressed');
            }
        }

    },

    /**
     * Update a given analogue stick on the screen.
     */
    updateAxis: function (value, valueV, gamepadId, stickId) {
        var gamepadEl = document.querySelector('#gamepad-' + gamepadId);

        function lineDistance(point1, point2) {
            var xs = point1 - 0;
            var ys = point2 - 0;

            xs = xs * xs;
            ys = ys * ys;

            return Math.sqrt(xs + ys);
        }

        // Update the stick visually.
        var stickEl = gamepadEl.querySelector('[data-name="' + stickId + '"]');
        if (stickEl) { // Extraneous sticks have just a label.
            if (lineDistance(value, valueV) >= tester.ANALOGUE_STICK_THRESHOLD) {
                var offsetValH = value * tester.STICK_OFFSET;
                var offsetValV = valueV * tester.STICK_OFFSET;
            } else {
                var offsetValH = 0;
                var offsetValV = 0;
            }
            stickEl.style.marginLeft = offsetValH + 'px';
            stickEl.style.marginTop = offsetValV + 'px';
            if (tester.STICK_CURVING) {
                stickEl.style.transform = 'rotateX(' + offsetValV * -1 + 'deg) rotateY(' + offsetValH + 'deg)';
            }
        }

        // Update stick lateral rotation
        var stickRotEL = gamepadEl.querySelector('[data-name="' + stickId + '-wheel"]');
        if (stickRotEL) {
            if (lineDistance(value, valueV) >= tester.ANALOGUE_STICK_THRESHOLD) {
                var rotValH = value;
            } else {
                var rotValH = 0;
            }
            stickRotEL.style.transform = 'rotate(' + rotValH * tester.ROTATE_BOUNDARY + 'deg)';
        }

    },

    /**
     * Update a given button on the screen.
     */
    updateRawButton: function (value, gamepadId, buttonId) {
        var gamepadEl = document.querySelector('#gamepad-map-' + gamepadId);
        var newValue = value;
        if (typeof value == 'object') {
            var newValue = value.value;
        }

        // Update the button visually.
        var buttonEl = gamepadEl.querySelector('[data-name="button-' + buttonId + '"]');
        var mapConfig = document.querySelectorAll("#mapping-config button");
        if (buttonEl) { // Extraneous buttons have just a label.
            buttonEl.innerHTML = newValue.toFixed(2);
            buttonEl.style.opacity = .6 + (newValue * .4);
            if (tester.EVENT_LISTEN) {
                if (tester.MONITOR_ID == gamepadId && !tester.ifDisabledExists("buttons", gamepadId, buttonId)) {
                    var gpEvent = new CustomEvent('GamepadPressed', {
                        detail: {
                            gamepad: gamepadId,
                            type: "buttons",
                            typeName: "Button",
                            fullname: "Button " + buttonId,
                            value: newValue,
                            config: {
                                choiceType: "buttons",
                                choice: buttonId
                            }
                        },
                        bubbles: true
                    });
                    if (tester.MONITOR_TYPE == "remapping" && tester.absDiff(tester.SNAPSHOT.buttons[buttonId].value, newValue) > tester.ANALOGUE_BUTTON_THRESHOLD || tester.MONITOR_TYPE == "value") {
                        for (var i = 0; i < mapConfig.length; i++) {
                            mapConfig[i].dispatchEvent(gpEvent);
                        }
                    }
                }
            }
        }

    },
    /**
     * Update a given axis value on the screen.
     */
    updateRawAxis: function (value, gamepadId, axisId) {
        var gamepadEl = document.querySelector('#gamepad-map-' + gamepadId);
        var newValue = value;
        if (typeof value == 'object') {
            var newValue = value.value;
        }

        // Update the button visually.
        var axisEl = gamepadEl.querySelector('[data-name="axis-' + axisId + '"]');
        var mapConfig = document.querySelectorAll("#mapping-config button");
        if (axisEl) { // Extraneous buttons have just a label.
            axisEl.innerHTML = newValue.toFixed(10);
            axisEl.style.opacity = .6 + (Math.abs(newValue) * .4);
            if (tester.EVENT_LISTEN) {
                if (tester.MONITOR_ID == gamepadId && !tester.ifDisabledExists("axes", gamepadId, axisId)) {
                    var axisOp = (newValue > 0) ? "+" : "-";
                    var gpEvent = new CustomEvent('GamepadPressed', {
                        detail: {
                            gamepad: +gamepadId,
                            type: "axes",
                            typeName: "Axis",
                            fullname: "Axis " + axisId + " " + axisOp,
                            value: newValue,
                            config: {
                                choiceOperand: axisOp,
                                choiceType: "axes",
                                choice: axisId
                            }
                        },
                        bubbles: true
                    });
                    if (tester.MONITOR_TYPE == "remapping" && tester.absDiff(tester.SNAPSHOT.axes[axisId], newValue) > tester.ANALOGUE_BUTTON_THRESHOLD || tester.MONITOR_TYPE == "value") {
                        for (var i = 0; i < mapConfig.length; i++) {
                            mapConfig[i].dispatchEvent(gpEvent);
                        }
                    }
                }
            }
        }
    },

    processQueue: function () {
        var myProcessQueueCall = tester.processQueueCall + 1;
        tester.processQueueCall = myProcessQueueCall;
        while (tester.updateQueue != undefined && tester.updateQueue.peek() != undefined && tester.updateQueue.peek()[0] <= Date.now()) {
            var elem = tester.updateQueue.dequeue();
            var vars = elem[2];
            if (elem[1] == tester.updateStick) {
                tester.updateStick(vars[0], vars[1], vars[2], vars[3])
            } else if (elem[1] == tester.updateAxis) {
                tester.updateAxis(vars[0], vars[1], vars[2], vars[3]);
            } else {
                elem[1](vars[0], vars[1], vars[2]);
            }
        }
    }
};
