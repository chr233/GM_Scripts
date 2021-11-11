// ==UserScript==
// @name:zh-CN      GMG小绿人Steam快捷搜索
// @name            GMG_Steam_Search
// @namespace       https://blog.chrxw.com/
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @icon            https://blog.chrxw.com/favicon.ico
// @version         1.1
// @description     快捷搜索steam商店
// @description:zh-CN  快捷搜索steam商店
// @author          Chr_
// @license         AGPL-3.0
// @connect         steampowered.com
// @match           https://www.greenmangaming.com/*/games/*
// @require         https://greasyfork.org/scripts/431430-search-steam-store/code/Search_Steam_Store.js
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// ==/UserScript==

(() => {
    'use strict';
    let GdivResult = null; //控件数组

    const ele = document.querySelector('h1.notranslate');

    init(ele);

    //显示搜索按钮
    function init(ele) {
        const keyword = ele.textContent.replace(/[-+=:;：；'"‘’“”]/g, ' ');
        const btnSearch = document.createElement('button');
        btnSearch.className = 'btnSearch';
        btnSearch.textContent = '🔎';
        btnSearch.addEventListener('mouseover', () => { btnSearch.textContent = '🔎 搜索Steam'; });
        btnSearch.addEventListener('mouseout', () => { btnSearch.textContent = '🔎'; });
        btnSearch.addEventListener('click', () => { showResult(keyword); });

        ele.appendChild(btnSearch);
        const divResult = document.createElement('div');
        divResult.className = 'divResult';
        divResult.style.display = 'none';
        ele.appendChild(divResult);

        GdivResult = divResult;
    }

    //显示搜索结果
    function showResult(keyword) {
        searchStore(keyword, 'CN')
            .then((result) => {
                GdivResult.innerHTML = '';
                GdivResult.style.display = '';
                if (result.length === 0) {
                    const btnRst = document.createElement('button');
                    btnRst.textContent = '【快速搜索无结果,点击前往steam搜索页】';
                    btnRst.addEventListener('click', () => { window.open(`https://store.steampowered.com/search/?term=${keyword}`); });
                    GdivResult.appendChild(btnRst);
                    return;
                }
                result.forEach(({ appID, isBundle, appName, appPrice, appUrl, appImg }) => {
                    const btnRst = document.createElement('button');
                    btnRst.title = `${isBundle ? "bundle" : "app"}/${appID}`;
                    btnRst.addEventListener('click', () => { window.open(appUrl); });

                    const btnName = document.createElement('p');
                    btnName.textContent = `${appName}【${appPrice}】`
                    btnRst.appendChild(btnName);
                    btnRst.appendChild(document.createElement('br'));

                    const btnImg = new Image();
                    btnImg.src = appImg;

                    btnRst.appendChild(btnImg);
                    GdivResult.appendChild(btnRst);
                });
            })
            .catch((reason) => {
                alert(reason);
            });
    }
})();


//CSS表
GM_addStyle(`
.divResult {
    top: 0;
    position: relative;
    width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    white-space: nowrap;
  }
  .divResult > button {
    cursor: pointer;
    color: #000;
    font-size: 15px;
  }
  .divResult > button:not(:last-child) {
    margin-right: 5px;
  }
  .divResult > button > p {
    display: inline;
    margin-left: 6px;
  }
  .divResult > button > img {
    zoom: 1.5;
    margin-top: 2px;
  }
  .btnSearch {
    padding: 0 5px;
    margin-left: 5px;
    color: #000;
    font-size: 15px;
    padding: 2px;
  }  
`);