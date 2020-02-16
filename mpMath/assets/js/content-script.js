function formulaClick() {
    $('#popup')[0].style.display = 'block';
    $('#popup')[0].focus();
    $('#popup')[0].contentWindow.postMessage({ type: 'CHANGE_INPUT', text: '' }, '*');
}

setTimeout(function () {
    // 注入脚本
    let script_inject = document.createElement('script');
    script_inject.src = chrome.runtime.getURL('assets/js/mpm-inject.js');
    script_inject.onload = function () {
        this.remove;
    };
    (document.head || document.documentElement).appendChild(script_inject);
}, 1000);

// 等待文档加载完毕
chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === 'complete') {
            clearInterval(readyStateCheckInterval);

            if ($('#js_media_list')[0]) {
                // 公式编辑弹窗
                let iframe = document.createElement('iframe');
                iframe.src = chrome.extension.getURL('./pages/popup.html');
                iframe.setAttribute('class', 'mpm-modal');
                iframe.frameBorder = 0;
                iframe.allowTransparency = true;
                iframe.id = 'popup';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // 上方菜单栏公式按钮
                let formulaItem = document.createElement('li');
                formulaItem.setAttribute('class', 'tpl_item jsInsertIcon formula');
                formulaItem.id = 'js_editor_insert_formula';
                formulaItem.innerText = '公式';
                formulaItem.onclick = formulaClick;
                $('#js_media_list')[0].appendChild(formulaItem);

                // 热键绑定 Ctrl/⌘ + /
                $('#ueditor_0').contents().find('.view').keydown(function (event) {
                    let keyCode = event.keyCode || event.which || event.charCode;
                    let ctrlKey = event.ctrlKey || event.metaKey;
                    if (ctrlKey && keyCode == 191) {
                        formulaClick();
                    }
                });
            }
        }
    }, 10);
});