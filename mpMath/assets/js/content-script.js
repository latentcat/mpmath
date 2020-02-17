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

                let formulaGuide = document.createElement('li');
                formulaGuide.setAttribute('class', 'tpl_dropdown_menu_item');
                formulaGuide.innerText = '指南';
                formulaGuide.onclick = guideClick;
                dropdownMenu.appendChild(formulaGuide);

                formulaMenu.appendChild(dropdownMenu);
                $(formulaMenu).click(function () {
                    $(dropdownMenu).css('display', '');
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