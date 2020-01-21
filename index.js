function showMessage(message, warning) {
    const infoBox = 'alert-success';
    const infoIcon = 'glyphicon-info-sign';
    const warningBox = 'alert-warning';
    const warningIcon = 'glyphicon-warning-sign';

    let messageBox = $('#messageBox');
    if (warning) {
        messageBox.removeClass(infoBox).addClass(warningBox);
        messageBox.find('.message-icon').removeClass(infoIcon).addClass(warningIcon);
    }
    else {
        messageBox.removeClass(warningBox).addClass(infoBox);
        messageBox.find('.message-icon').removeClass(warningIcon).addClass(infoIcon);
    }
    messageBox.find('.message-text').html(message);
    messageBox.stop(null, true, true)
        .slideDown()
        .delay(6000)
        .slideUp('fast');
}

function openWindow(url, width, height, name) {
    if (!name) {
        name = '_self';
    }
    let widthFeature = '', heightFeature = '';
    if (width && !isNaN(width)) {
        widthFeature = 'width=' + parseInt(width);
    }
    if (height && !isNaN(height)) {
        heightFeature = 'height=' + parseInt(height);
    }
    window.open(url, name, widthFeature + heightFeature + 'menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,dependent=no');
}

function notChrome() {
    return navigator && navigator.userAgent && navigator.userAgent.indexOf('Chrome') < 0;
}

$(function () {
    if (notChrome()) {
        showMessage('注意：本应用程序仅支持 Chrome 浏览器或 OBS 浏览器组件使用。', true);
    }

    $('.url-text')
        .each(function () {
            $(this).val($(this).data('url'));
        })
        .blur(function () {
            $(this).val($(this).data('url'));
        })
        .on('copy', function (e) {
            showMessage(e.target.value + ' 已放入剪贴板！<br/>请将此地址填入 OBS 浏览器来源的 URL 中，并设置宽度 750 高度 630。');
            return true;
        })
        .on('paste cut', function () {
            return false;
        })
        .keydown(function (e) {
            if (e.ctrlKey || (e.ctrlKey && e.which == 67)) { // Ctrl+C
                return true;
            }
            return false;
        })
        .mouseenter(function () {
            $(this).focus();
            return false;
        })
        .mousedown(function () {
            $(this).focus();
            return false;
        })
        .focus(function () {
            $(this).select();
            return false;
        });

    $('#chromeButton').click(function () {
        openWindow($(this).data('url'));
        return false;
    });

    $('.btn-test').click(function () {
        let targetId = $(this).data('target');
        openWindow($(targetId).data('url'), 770, 650, targetId);
        return false;
    });

    // 剪贴板
    let clipboard = new ClipboardJS('.btn-copy');
    clipboard.on('error', function (e) {
        showMessage('复制失败！<br/>请检查浏览器授权，或直接使用 Ctrl+C 复制。', true);
    });
});