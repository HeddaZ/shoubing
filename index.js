function showMessage(message) {
    let messageBox = $('#messageBox');
    messageBox.text(message);
    messageBox.parent().stop(null, true, true)
        .slideDown()
        .delay(5000)
        .slideUp();
}

$(function () {
    let urlText = $('.url-text');
    urlText.css('cursor', 'pointer')
        .val(urlText.data('url'))
        .on('paste', function () {
            return false;
        })
        .keydown(function () {
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
        })
        .blur(function () {
            $(this).val($(this).data('url'));
        });

    // 剪贴板
    let clipboard = new ClipboardJS('.url-text', {
        text: function (trigger) {
            return trigger.getAttribute('data-url');
        }
    });
    clipboard.on('success', function (e) {
        showMessage('已复制 ' + e.text + ' 到剪贴板！请将此地址放入 OBS 浏览器来源 URL 中，或用 Chrome 打开进行手柄调试。')
        e.clearSelection();
    });
    clipboard.on('error', function (e) {
        showMessage('复制失败！请检查浏览器授权，或直接使用 Ctrl+C 复制。')
    });

    $('#chromeButton').click(function () {
        window.open($(this).data('url'));
        return false;
    });
});