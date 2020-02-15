// 修改MathJax全局配置，使微信编辑器能保存下来
MathJax = {
    svg: { fontCache: 'none' },
    tex: { tags: 'ams' }
};

let input = document.getElementById('input');
let insert = document.getElementById('insert');

// Tex代码转SVG图像
function convert() {
    let input = document.getElementById("input").value.trim();

    output = document.getElementById('output');
    output.innerHTML = '';

    MathJax.texReset();
    let options = MathJax.getMetricsFor(output);
    options.display = true;
    MathJax.tex2svgPromise(input, options).then(function(node) {
        output.appendChild(node);
        MathJax.startup.document.clear();
        MathJax.startup.document.updateDocument();
    }).catch(function(err) {
        output.appendChild(document.createElement('pre')).appendChild(document.createTextNode(err.message));
    }).then(function() {
        input.disabled = false;
    });
}

// 请求关闭公式编辑页面
function closeFrame() {
    parent.window.postMessage({ type: 'CLOSE_FORMULA' }, '*');
}

function insertFormula() {
    // 将生成的mjx-container套在span中
    let output = document.getElementById('output');
    let block = document.getElementById('block');
    let sp = document.createElement('span');
    if (block.checked) {
        output.childNodes[0].style = 'overflow-x:auto; outline:0; display:block; text-align: center;'
        output.childNodes[0].childNodes[0].style = 'height:auto; max-width:300% !important;'
    }

    sp.setAttribute('style', 'cursor:pointer;');
    sp.setAttribute('data-formula', input.value.trim().replace(/\\/g, '\\\\'));
    sp.appendChild(output.childNodes[0]);

    parent.window.postMessage({ type: 'INSERT_FORMULA', text: sp.outerHTML }, '*');
    input.value = '';
    closeFrame();
}

$(function() {
    input.oninput = convert;
    insert.onclick = insertFormula;
    document.getElementById('close').onclick = closeFrame;
    document.getElementById('cancel').onclick = closeFrame;

    window.addEventListener('message', function(event) {
        // 接收来自主页面的消息，改变输入框内容
        if (event.data.type) {
            if (event.data.type == 'CHANGE_INPUT') {
                input.value = event.data.text.replace(/\\\\/g, '\\');
                input.focus();
                convert();
            }
        }
    });

    $('#input').keydown(function(event) {
        // 处理shift+enter
        if (event.keyCode == 13 && event.shiftKey) {
            insertFormula();
        }
        // 处理esc
        else if (event.keyCode == 27) {
            closeFrame();
        }
    });
});