// 修改MathJax全局配置，使微信编辑器能保存下来
MathJax = {
    svg: { fontCache: 'none' },
    tex: { tags: 'ams' }
};

let input = document.getElementById('input');
let block = document.getElementById('block');
let insert = document.getElementById('insert');

// 判断输入是否为空
function checkNull(str) {
    if (str.length == 0) {
        insert.disabled = true;
        $(insert).addClass('weui-desktop-btn_disabled');
    } else {
        insert.disabled = false;
        $(insert).removeClass('weui-desktop-btn_disabled');
    }
}

// Tex代码转SVG图像
function convert() {
    let inputTex = document.getElementById("input").value.trim();
    checkNull(inputTex);

    output = document.getElementById('output');
    output.innerHTML = '';

    MathJax.texReset();
    let options = MathJax.getMetricsFor(output);
    options.display = block.checked;
    MathJax.tex2svgPromise(inputTex, options).then(function(node) {
        output.appendChild(node);
        MathJax.startup.document.clear();
        MathJax.startup.document.updateDocument();
    }).catch(function(err) {
        output.appendChild(document.createElement('pre')).appendChild(document.createTextNode(err.message));
    }).then(function() {
        inputTex.disabled = false;
    });
}

// 请求关闭公式编辑页面
function closeFrame() {
    parent.window.postMessage({ type: 'CLOSE_FORMULA' }, '*');
}

function insertFormula() {
    if (insert.disabled == true) return;

    // 将生成的mjx-container套在span中
    let output = document.getElementById('output');
    let sp = document.createElement('span');
    if ($(block).prop('checked')) {
        output.childNodes[0].style = 'overflow-x:auto; outline:0; display:block; text-align: center; margin: 15px 0px;'
        output.childNodes[0].setAttribute('display', true);
        output.childNodes[0].childNodes[0].style = 'height:auto; max-width:300% !important;'
    }

    //output.childNodes[0].setAttribute('data-formula', input.value.trim().replace(/\\/g, '\\\\'));
    output.childNodes[0].setAttribute('data-formula', input.value.trim());
    sp.setAttribute('style', 'cursor:pointer;');
    sp.appendChild(output.childNodes[0]);
    sp.innerHTML = sp.innerHTML.replace(/<mjx-assistive-mml.+?<\/mjx-assistive-mml>/g, "");

    parent.window.postMessage({ type: 'INSERT_FORMULA', text: sp.outerHTML }, '*');
    input.value = '';
    closeFrame();
}

$(function() {
    input.oninput = convert;
    block.onchange = convert;
    insert.onclick = insertFormula;
    document.getElementById('close').onclick = closeFrame;
    document.getElementById('cancel').onclick = closeFrame;

    window.addEventListener('message', function(event) {
        // 接收来自主页面的消息，改变输入框内容
        if (event.data.type) {
            if (event.data.type == 'CHANGE_INPUT') {
                //input.value = event.data.text.replace(/\\\\/g, '\\');
                input.value = event.data.text;
                input.focus();

                // 行间公式自动勾选
                if (event.data.isBlock == "true") $(block).prop('checked', true);
                else $(block).prop('checked', false);
                convert();
            }
        }
    });

    // 防止窗口失去焦点
    $(window).focusout(function() {
        setTimeout(function() {
            $('#input').focus();
        }, 10);
    });

    $('#input').keydown(function(event) {
        // 处理shift+enter
        if (event.keyCode == 13 && event.shiftKey) {
            insertFormula();
        }
    });

    $(document).keydown(function(event) {
        // 处理esc
        if (event.keyCode == 27) {
            closeFrame();
        }
    });
});