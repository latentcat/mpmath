// 当前编辑对象和是否在编辑(插入)模式
let editing, editingMode;

// 等待文档加载完毕
var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === 'complete') {
        clearInterval(readyStateCheckInterval);

        // 处理来自iframe的消息
        window.addEventListener("message", function(event) {
            if (event.data.type) {
                // 处理关闭公式编辑框的消息
                if (event.data.type == 'CLOSE_FORMULA') {
                    document.getElementById('popup').style.display = 'none';
                    setTimeout(function() { $('#ueditor_0')[0].focus(); }, 10); // 重置焦点
                    editingMode = false; // 取消编辑
                }
                // 处理插入公式的消息
                else if (event.data.type == 'INSERT_FORMULA') {
                    // 如果在编辑模式就替换当前编辑元素, 否则插入新元素
                    if (editingMode == true) {
                        let beg = event.data.text.indexOf('>') + 1;
                        let end = event.data.text.lastIndexOf('<') - 1;
                        editing.innerHTML = event.data.text.substring(beg, end);
                        editingMode = false; // 还原为非编辑模式
                    } else {
                        window.UE.getEditor('js_editor').execCommand('insertHTML', '\xA0' + event.data.text + '\xA0');
                    }
                }
            }
        });

        // 编辑事件监听
        $('#ueditor_0').contents().find('.view').on('click', '[data-formula]', function(event) {
            $('#popup')[0].style.display = 'block';
            $('#popup')[0].contentWindow.postMessage({ type: 'CHANGE_INPUT', text: $(this).attr('data-formula'), isBlock: $(this).attr('display') }, '*');
            setTimeout(function() { $('#popup')[0].focus(); }, 10);
            editing = this.parentElement;
            editingMode = true;
        });
    }
});