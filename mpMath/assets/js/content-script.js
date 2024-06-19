function formulaClick(event) {
    $('#popup').css('display', 'block');
    $('#popup')[0].contentWindow.postMessage({ type: 'CHANGE_INPUT', text: '' }, '*');
    $('#popup')[0].focus();
    $('.tpl_dropdown_menu', '.formula').css('display', 'none');
    if (event) event.stopPropagation();
}

function fixClick(event) {
    revise();
    $('.tpl_dropdown_menu', '.formula').css('display', 'none');
    event.stopPropagation();
}

function convertClick(event) {
    processFormula();
    $('.tpl_dropdown_menu', '.formula').css('display', 'none');
    event.stopPropagation();
}

function guideClick(event) {
    alert('指南还在施工!');
    $('.tpl_dropdown_menu', '.formula').css('display', 'none');
    event.stopPropagation();
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
chrome.runtime.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === 'complete') {
            clearInterval(readyStateCheckInterval);

            if ($('#js_media_list')[0]) {
                // 公式编辑弹窗
                let iframe = document.createElement('iframe');
                iframe.src = chrome.runtime.getURL('./pages/popup.html');
                iframe.setAttribute('class', 'mpm-modal');
                iframe.frameBorder = 0;
                iframe.allowTransparency = true;
                iframe.id = 'popup';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                console.log(iframe)

                // 上方菜单栏公式按钮
                let formulaMenu = document.createElement('li');
                formulaMenu.setAttribute('class', 'tpl_item tpl_item_dropdown jsInsertIcon formula');
                formulaMenu.id = 'js_editor_insert_formula';
                $(formulaMenu).append('<span>公式</span>');

                // 分别为 下拉菜单栏、插入公式、修复SVG、指南
                let dropdownMenu = document.createElement('ul');
                dropdownMenu.setAttribute('class', 'tpl_dropdown_menu');
                dropdownMenu.style.display = 'none';

                let formulaInsertItem = document.createElement('li');
                formulaInsertItem.setAttribute('class', 'tpl_dropdown_menu_item');
                formulaInsertItem.innerText = '插入公式 ⌘/';
                formulaInsertItem.onclick = formulaClick;
                dropdownMenu.appendChild(formulaInsertItem);

                let formulaFixItem = document.createElement('li');
                formulaFixItem.setAttribute('class', 'tpl_dropdown_menu_item');
                formulaFixItem.innerText = '修复SVG';
                formulaFixItem.onclick = fixClick;
                dropdownMenu.appendChild(formulaFixItem);

                let convertFormulaItem = document.createElement('li');
                convertFormulaItem.setAttribute('class', 'tpl_dropdown_menu_item');
                convertFormulaItem.innerText = '转化公式';
                convertFormulaItem.onclick = convertClick;
                dropdownMenu.appendChild(convertFormulaItem);

                let formulaGuide = document.createElement('li');
                formulaGuide.setAttribute('class', 'tpl_dropdown_menu_item');
                formulaGuide.innerText = '指南';
                formulaGuide.onclick = guideClick;
                dropdownMenu.appendChild(formulaGuide);

                formulaMenu.appendChild(dropdownMenu);
                $(formulaMenu).click(function () {
                    $(dropdownMenu).css('display', 'none');
                });

                $(document).click(function(event) {
                    // 检查点击的元素是否是formulaMenu
                    if (!$(event.target).closest(formulaMenu).length) {
                        // 如果不是，下拉菜单消失
                        $(dropdownMenu).css('display', 'none');
                    }
                    else {
                        // 如果是，下拉菜单显示
                        $(dropdownMenu).css('display', 'block');
                    }
                });

                $('#js_media_list')[0].appendChild(formulaMenu);

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

/*
以下代码源于 https://github.com/kongxiangyan/bookmarklet
修复修正微信公众号图文编辑器粘贴 SVG 时部分转换为 Embed 导致不支持 Dark Mode 的问题
*/
function loadSVG(src) {
    return new Promise((resolve) => {
        let ajax = new XMLHttpRequest();
        ajax.open('GET', src, true);
        ajax.send();
        ajax.onload = function(e) {
            let div = document.createElement('div');
            div.innerHTML = ajax.responseText;
            let svg = div.childNodes[1];
            resolve(svg);
        }
    })
}

function revise() {
    console.log(`【MP_SVG_REVISE】 Start`);
    let ueditor = document.getElementById('ueditor_0');
    let view = ueditor.contentDocument.getElementsByClassName('view')[0];
    let embeds = view.querySelectorAll('embed');
    console.log(`【MP_SVG_REVISE】 检测到 ${embeds.length} 个目标……`);
    let promises = [];
    embeds.forEach((embed, index) => {
        console.log(`【MP_SVG_REVISE】 第 ${index} 个……`);
        let parent_node = embed.parentNode;
        promises.push(new Promise(resolve => {
            loadSVG(embed.src).then(svg => {
                parent_node.insertBefore(svg, embed);
                parent_node.removeChild(embed);
                resolve();
            })
        }))
    });
    Promise.all(promises).then(() => {
        console.log('Revise complete！');
        //alert('Revise complete！');
        alert(`修复了 ${embeds.length} 个目标!`);
    })
}


// 返回 container 第一个公式 range, inline .
// range 指定了公式范围, inline = true 则意味着公式是 inline 的
function findFormula(container) {
    var nodeIterator = document.createNodeIterator(container, NodeFilter.SHOW_TEXT);

    var currentNode;
    // 公式可能会跨越多个 node.
    var startNode = null;
    var startOffset = -1;
    var inline = false;
    while ((currentNode = nodeIterator.nextNode())) {
        var searchStart = 0;
        while (searchStart < currentNode.nodeValue.length) {
            if (startNode == null) {
                var dollarIndex = currentNode.nodeValue.indexOf('$', searchStart);
                if (dollarIndex == -1) {
                    searchStart = currentNode.nodeValue.length;
                    continue;
                }
                if (dollarIndex > 0 && currentNode.nodeValue.charAt(dollarIndex - 1) == '\\') {
                    // \$ 表示对 $ 的转义, 此时 $ 并不是表示公式的开始.
                    searchStart = dollarIndex + 1;
                    continue;
                }
                startNode = currentNode
                startOffset = dollarIndex;
                if (dollarIndex + 1 < currentNode.nodeValue.length && currentNode.nodeValue.charAt(dollarIndex + 1) == '$') {
                    // 行间公式
                    inline = false;
                    searchStart = dollarIndex + 2;
                } else {
                    inline = true;
                    searchStart = dollarIndex + 1;
                }
                continue;
            }
            var dollarIndex = currentNode.nodeValue.indexOf('$', searchStart);
            if (dollarIndex == -1) {
                searchStart = currentNode.nodeValue.length;
                continue;
            }
            if (dollarIndex > 0 && currentNode.nodeValue.charAt(dollarIndex - 1) == '\\') {
                // \$ 表示对 $ 的转义, 此时 $ 并不是表示公式的结束.
                searchStart = dollarIndex + 1;
                continue;
            }
            var endNode = currentNode
            var endOffset = dollarIndex;
            if (dollarIndex + 1 < currentNode.nodeValue.length && currentNode.nodeValue.charAt(dollarIndex + 1) == '$') {
                endOffset = dollarIndex + 1;
                searchStart = dollarIndex + 2;
            } else {
                searchStart = dollarIndex + 1;
            }
            var range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset + 1); // + 1 是开区间.
            return {
                range: range,
                inline: inline
            };
        }
    };
    return null;
}

function getFormulaTxt(formula) {
    var text = formula.range.toString();
    if (formula.inline) {
        return text.substring(1, text.length - 1);
    } else {
        return text.substring(2, text.length - 2);
    }
}

function mergeNode(firstP, secondP) {
    for (var node of secondP.childNodes) {
        firstP.appendChild(node);
    }
    secondP.remove();
}

// 定义一个递归函数来处理每个公式
function processFormula() {
    var body = $('#ueditor_0').contents().find('.view')[0];
    var formula = findFormula(body);
    if (!formula) {
        // 没有更多的公式需要处理
        return Promise.resolve(); // 返回一个解决的Promise
    }

    var latexText = getFormulaTxt(formula).trim();
    console.log("转化", latexText);

    // 发送消息到扩展，并等待响应
    return chrome.runtime.sendMessage({
        action: 'convert',
        input: latexText,
        display: !formula.inline
    }).then(response => {
        // 收到响应后，使用响应结果
        let parser = new DOMParser();
        let doc = parser.parseFromString(response.result, 'text/html');
        let outputNode = doc.body.firstChild;

        if (formula.inline && formula.range.startContainer != formula.range.endContainer) {
            // 我们在这里处理如下情况, 即 `$` 跨越了多个元素.
            // <p>明显 $</p>
            // <p>|I| = |I_1| + |I_2| + |I_3|</p>
            // <p>$. <svg></svg></p>
            // 如果不做任何处理, 则输出结果丑了一点.
            let startTextNode = formula.range.startContainer;  // 一定是 text.
            let endTextNode = formula.range.endContainer;  // 这也是个 text node.
            let startNode = startTextNode.parentNode;
            let endNode = endTextNode.parentNode;
            formula.range.deleteContents();
            startNode.appendChild(outputNode);
            mergeNode(startNode, endNode);
        } else {
            formula.range.deleteContents();
            formula.range.insertNode(outputNode);
        }

        // 递归处理下一个公式
        return processFormula();
    });
}
