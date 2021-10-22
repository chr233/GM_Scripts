// ==UserScript==
// @name            Hidden_DLC_Helper
// @name:zh-CN      隐藏DLC查询
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description     显示Steam商店中隐藏的DLC（补丁）。
// @description:zh-CN  显示Steam商店中隐藏的DLC（补丁）。
// @author          Chr_
// @include         /https://store\.steampowered\.com\/app\/\d+/
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_setClipboard
// @grant           GM_addStyle
// ==/UserScript==


(() => {
    'use strict';
    const appid = (window.location.pathname.match(/\/app\/(\d+)/) ?? [null, null])[1];
    if (appid === null) { return; }
    main();
    async function main() {
        let data = await getAppDetail(appid);
        let { dlc: dlc_list1 } = data;
        let dlc_list2 = getDLCsFromPage();
        if (dlc_list1 === null) {
            console.log('未找到DLC')
            return;
        }
        let hidden_dlcs = diffList(dlc_list1, dlc_list2)
        console.log(hidden_dlcs);

        if (hidden_dlcs.length > 0) {
            showBtns(hidden_dlcs);
        }
    }
    //复制
    const setClipboard = (data) => { GM_setClipboard(data, 'text'); };
    //显示按钮
    function showBtns(appList = []) {
        function genBtn(name, foo) {
            let s = document.createElement('span');
            let a = document.createElement('a');
            a.innerText = name;
            s.className = 'note hdh';
            s.appendChild(a);
            s.addEventListener('click', foo);
            return s;
        }
        const btnArea = document.querySelector('#gameAreaDLCSection>.gradientbg');
        let btnCopyCmd = genBtn('复制ASF指令', () => {
            let cmd = '!addlicense a/' + appList.join(',a/');
            setClipboard(cmd);
        });
        btnArea.appendChild(btnCopyCmd);
        for (let app of appList) {
            let btn = genBtn(`${app}`, () => { showGameDetail(app); });
            btnArea.appendChild(btn);
        }
    }
    //显示App详情
    async function showGameDetail(app) {
        let data = await getAppDetail(app);
        let { name, is_free } = data;
        if (is_free) {
            ShowConfirmDialog('', `游戏名：${name}`, '启动Steam安装', '复制ASF入库代码')
                .then(() => {
                    window.open(`steam://install/${app}`);
                })
                .fail((stats) => {
                    if (stats) {
                        setClipboard(`!addlicense a/${app}`);
                    }
                });
        } else {
            ShowAlertDialog('', `游戏名：${name}\n\n非免费DLC无法直接入库`, '确定');
        }
    }

    //从API读取游戏信息
    function getAppDetail(appid) {
        return new Promise((resolve, reject) => {
            fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=us`, { credentials: 'omit' })
                .then(async response => {
                    if (response.ok) {
                        let json = await response.json();
                        resolve(json[appid].data);
                    } else {
                        console.error(response.status);
                        reject(response.status);
                    }
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }
    //从页面读取所有DLC
    function getDLCsFromPage() {
        let DLCs = new Set();
        let dlc_list = document.querySelectorAll('.tableView>div>a');
        const regAppid = new RegExp(/dlc_row_(\d+)/);
        for (let dlc of dlc_list) {
            let match = dlc.id.match(regAppid);
            if (match) {
                let appid = parseInt(match[1]);
                DLCs.add(appid);
            }
        }
        return Array.from(DLCs);
    }
    //获取A与B补集的交集
    function diffList(listA, listB) {
        let listC = [];
        for (let item of listA) {
            if (listB.indexOf(item) === -1) {
                listC.push(item);
            }
        }
        return listC;
    }
})();
GM_addStyle(`
.hdh {
margin-right: 5px;
}
.hdh > a {
cursor: pointer;
}
`);
