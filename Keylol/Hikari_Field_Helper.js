// ==UserScript==
// @name:zh-CN      Hikari_Field入库检测
// @name            Hikari_Field_Helper
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.1
// @description     Hikari_Field入库游戏检测
// @description:zh-CN  Hikari_Field入库游戏检测
// @author          Chr_
// @include         https://keylol.com/*
// @include         https://store.hikarifield.co.jp/libraries
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_xmlhttpRequest
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_registerMenuCommand
// ==/UserScript==


(() => {
    'use strict';

    const Data = { //商城关键词: 游戏名, AppID, 状态(1: 已发售, 0: 未发售, -1: 被ban)
        //已发售
        'parquet': ['PARQUET', 1662840, 1],
        'riddle_joker': ['Riddle Joker', 1277930, 1],
        'kinkoi': ['金辉恋曲四重奏', 1277940, 1],
        'aokana': ['苍之彼方的四重奏', 1044620, 1],
        'aokana_extra1': ['苍之彼方的四重奏 EXTRA1', 1340130, 1],
        'sakura_no_mori2': ['樱之杜†净梦者2', 983150, 1],
        'natsunoiro': ['追忆夏色年华', 1161190, 1],
        'alias_carnival': ['爱丽娅的明日盛典', 1094530, 1],
        'sakura_no_mori': ['樱之杜†净梦者', 749520, 1],
        'tsukikage': ['月影魅像-解放之羽-', 1069230, 1],
        'hello_lady_nd': ['淑女同萌！-New Division-', 1025070, 1],
        'relief': ['Re:LieF 〜献给亲爱的你〜', 1518770, 1],
        'monobeno_happy_end': ['茂伸奇谈-Happy End-', 831660, 1],
        'maitetsu_lastrun': ['爱上火车-Last Run!!-', 1434480, 1],
        'tryment_alpha': ['TrymenT -献给渴望改变的你- AlphA篇', 1183260, 1],
        'senren_banka': ['千恋＊万花', 1144400, 1],
        'maitetsu_pure_station': ['爱上火车-Pure Station-', 880950, 1],
        'hello_lady': ['淑女同萌！', 783120, 1],
        'monobeno': ['茂伸奇谈-Monobeno-', 758090, 1],
        'tayutama2': ['游魂2-you\'re the only one-', 552280, 1],
        //已下架
        'happiness2': ['Happiness！2 樱花盛典', 1253470, -1],
        'magical_charming': ['魔卡魅恋！Magical Charming!', 625760, -1],
        // 'magical_charming2': ['魔卡魅恋 零之编年史', 1216240, -1], //暂无HF商店链接
        'hello_lady_se': ['淑女同萌！-Superior Entelecheia-', 1286460, -1],
        'monobeno_asmr': ['妖异乡愁谭', 1264680, -1],
        'honoguraki': ['来自昏暗的时间尽头', 1603740, -1],
        //未发售
        'sekachu': ['在世界与世界的正中央', 1829650, 0],
    }

    const HFSHOP = 'https://store.hikarifield.co.jp/shop/';
    const HFLIBARY = 'https://store.hikarifield.co.jp/libraries';

    const host = window.location.host;
    setInterval
    if (host === 'store.hikarifield.co.jp') {//更新库存
        const myGames = document.querySelectorAll('.game-cover>a');

        const ownedGames = [625760]; //魔卡魅恋(免费)

        for (const ele of myGames) {
            const key = ele.href?.replace(HFSHOP, '');
            if (key !== undefined) {
                let [gameName, appID, _] = Data[key] ?? [null, null, null];
                if (appID !== null) {
                    ownedGames.push(appID);
                    console.log(`已拥有 ${gameName} ${appID}`);
                }
            } else {
                console.log(`${ele.href} 无效`);
            }
        }
        GM_setValue('ownedGames', ownedGames);
        swal({
            position: 'top-end',
            title: '导入游戏列表成功',
            button: false,
            timer: 1000
        });

    } else { //其乐
        const ownedGames = new Set(GM_getValue('ownedGames') ?? []);
        if (ownedGames.size === 0) {
            if (confirm('是否导入游戏列表?')) {
                window.open(HFLIBARY);
            } else {
                showError('【可以在油猴菜单中进行同步】');
                GM_setValue('ownedGames', [0]);
            }
        }

        const steamLinks = document.querySelectorAll('a[href^="http://store.steampowered.com/"],a[href^="https://store.steampowered.com/"],a[href^="https://steamdb.info/app/"]');
        const HFLinks = document.querySelectorAll('a[href^="https://store.hikarifield.co.jp/shop/"]');

        const grubAppid = RegExp(/app\/(\d+)\/?/);

        for (const ele of steamLinks) {
            const href = ele.href;
            if (href !== undefined) {
                const appID = parseInt(grubAppid.exec(href)?.[1] ?? 0);
                if (appID > 0) {
                    if (ownedGames.has(appID)) {
                        ele.classList.add('steam-info-link');
                        ele.classList.add('steam-info-own');
                    }
                }
            }
        }

        for (const ele of HFLinks) {
            const key = ele.href?.replace(HFSHOP, '');
            if (key !== undefined) {
                let [gameName, appID, _] = Data[key] ?? [null, null, null];
                if (appID !== null) {
                    if (ownedGames.has(appID)) {
                        ele.classList.add('steam-info-link');
                        ele.classList.add('steam-info-own');
                    }
                }
            } else {
                console.log(ele);
            }
        }
    }

    GM_registerMenuCommand('导入Hikari Field游戏', () => {
        window.open(HFLIBARY);
    })

})();