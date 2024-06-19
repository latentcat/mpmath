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


function formula2Svg(latexText, display) {
    var outputNode = document.getElementById('output');
    outputNode.innerHTML = '';
    MathJax.texReset();
    let options = MathJax.getMetricsFor(outputNode);
    options.display = display;
    var latxnode = MathJax.tex2svg(latexText, options);
    MathJax.startup.document.clear();
    MathJax.startup.document.updateDocument();
    return latxnode;
}

// 将生成的mjx-container套在span中
function svg2outHTML(latexNode, latexText, display) {
    let sp = document.createElement('span');
    if (display) {
        latexNode.style = 'overflow-x:auto; outline:0; display:block; text-align: center; margin: 15px 0px;';
        latexNode.setAttribute('display', true);
        latexNode.childNodes[0].style = 'height:auto; max-width:300% !important;'
    }
    //latexNode.setAttribute('data-formula', input.value.trim().replace(/\\/g, '\\\\'));
    latexNode.setAttribute('data-formula', latexText);
    sp.setAttribute('style', 'cursor:pointer;');
    sp.appendChild(latexNode);
    sp.innerHTML = sp.innerHTML.replace(/<mjx-assistive-mml.+?<\/mjx-assistive-mml>/g, "");
    return sp.outerHTML;
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

    var outerHTML = svg2outHTML(output.childNodes[0], input.value.trim(), $(block).prop('checked'));

    parent.window.postMessage({ type: 'INSERT_FORMULA', text: outerHTML }, '*');
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


    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'convert') {
            console.log("receiver convert message", message);
            var result = formula2Svg(message.input, message.display);
            var outerHTML = svg2outHTML(result, message.input, message.display);
            sendResponse({result: outerHTML});
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