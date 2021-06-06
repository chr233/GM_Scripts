// ==UserScript==
// @name         SWH_Helper
// @name:zh-CN   Steam愿望单助手
// @namespace    https://blog.chrxw.com
// @version      1.42
// @description  从steamdb.keylol.com获取愿望单数据
// @author       Chr_
// @match        https://swh.chrxw.com/
// @match        http://localhost/
// @match        https://steamdb.keylol.com/*
// @connect      steamdb.keylol.com
// @connect      swh.chrxw.com
// @connect      swh.chrxw.cn
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    var serverdic = {
        'ali': ["阿里云1", "swh.chrxw.cn:20443"],
        'ali2': ["阿里云2", "swh2.chrxw.cn:20443"],
    }
    var review = ['评测不足', '差评如潮', '特别差评', '差评', '多半差评', '褒贬不一', '多半好评', '好评', '特别好评', '好评如潮', '好评如潮'];
    var infodict;
    var wishlist;
    var wishstr;
    var server;
    var tmp;

    if (window.location.host == 'steamdb.keylol.com') {
        wishstr = window.localStorage.getItem('wish');
        GM_setValue('wish', wishstr);
        var nav = document.getElementsByClassName('nav')[0];
        var button = document.createElement('li');
        button.setAttribute('class', 'nav-swh');
        button.setAttribute('class', 'nav-swh');
        var link = document.createElement('a');
        link.setAttribute('href', 'https://swh.chrxw.com')
        link.text = '愿望单助手';
        button.appendChild(link);
        nav.appendChild(button);
        var i = setInterval(() => {
            var tips = document.getElementById('own_after').children[0];
            if (tips.textContent.indexOf("成功读取") != -1) {
                clearInterval(i);
                wishstr = window.localStorage.getItem('wish');
                GM_setValue('wish', wishstr);
                link.text = '同步完毕,点此返回SWH';
            }
        }, 1000);
    } else {
        wishstr = GM_getValue('wish');
        if (!wishstr) {
            wishstr = '[]'
        }
        wishlist = JSON.parse(wishstr);
        infodict = GM_getValue('infodict');
        if (!infodict) {
            infodict = {};
        }
        document.getElementById('install').remove();
        document.getElementById('noserver').remove();
        var sbox = document.getElementById('server');
        var opt;
        for (var key in serverdic) {
            opt = document.createElement('option');
            opt.value = key;
            opt.text = serverdic[key][0];
            sbox.appendChild(opt);
        }
        var bts = document.getElementById('buttons');
        var btn;
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'layui-btn layui-btn-sm layui-btn-normal';
        btn.textContent = '查看帮助';
        btn.addEventListener('click', showHelp, false);
        bts.appendChild(btn);
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'layui-btn layui-btn-sm ';
        btn.textContent = '更新愿望单';
        btn.addEventListener('click', updateWishlist, false);
        bts.appendChild(btn);
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'layui-btn layui-btn-sm layui-btn-danger';
        btn.textContent = '生成表格';
        btn.addEventListener('click', flashLocalData, false);
        bts.appendChild(btn);
        if (infodict) {
            renderTable();
            var k, t = 0;
            for (k in infodict) { t++; }
            document.getElementById('status').textContent = '已显示' + t.toString() + '条缓存数据'
        } else if (wishlist) {
            document.getElementById('status').textContent = '检测到愿望单信息,请点【生成表格】开始获取数据'
        } else {
            document.getElementById('status').textContent = '未检测到愿望单数据,请点【更新愿望单】获取数据'
        }
    }

    function showHelp() {
        layui.use('layer', function () {
            var layer = layui.layer;
            layer.open({
                title: '帮助'
                , content: '使用方法：</br>1.先点【更新愿望单】获取愿望单数据</br>2.然后点【生成表格】,数据会保存在本地,刷新后不会丢失.'
            });
        });
    }

    function updateWishlist() {
        function goToKeylol() {
            window.location.href = 'https://steamdb.keylol.com/sync'
        }
        layui.use('layer', function () {
            layer.msg('即将前往Keylol,同步完成后刷新本页即可生效.');
        });
        setTimeout(goToKeylol, 2000);
    }

    function getSelectServer() {
        var choose = document.getElementById('server').value;
        for (var key in serverdic) {
            if (choose == key) {
                server = 'https://' + serverdic[key][1];
            }
        }
    }

    function flashLocalData() {
        getSelectServer();
        var process = document.getElementById('process');
        var status = document.getElementById('status');
        var count = 0;
        var total = wishlist.length;
        var tmp;

        tmp = setInterval(
            function () {
                getFromRemote(wishlist[count]);
            }
            , 500)

        while (count >= total) {
            clearInterval(tmp);
        }

        function getFromRemote(appid) {
            try {
                GM_xmlhttpRequest({
                    method: "GET",
                    headers: {
                        "User-Agent": "SWH_Helper 1.0",
                        "Accept": "application/json"
                    },
                    url: server + '/games/' + appid.toString(),
                    onload: function (response) {
                        count++;
                        status.textContent = '进度:' + count.toString() + '/' + total.toString() + '，刷新即可终止操作(已有数据会保留)';
                        process.style.width = getPercent(count, total)
                        if (response.status == 200) {
                            var t = JSON.parse(response.responseText);
                            t["lowest"] = t["pcurrent"] <= t["plowest"];
                            infodict[appid] = t;
                            GM_setValue('infodict', infodict);
                            renderTable();
                        } else {
                            console.log('未查到信息,appid:', appid);
                        }
                        if (count >= total) {
                            console.log('处理完毕');
                        }
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    function cardb2s(b) {
        return b["card"] ? "√" : ""
    }
    function limitb2s(b) {
        return b["limit"] ? "√" : ""
    }
    function adultb2s(b) {
        return b["adult"] ? "√" : ""
    }
    function freeb2s(b) {
        return b["free"] ? "√" : ""
    }
    function releaseb2s(b) {
        return b["release"] ? "√" : ""
    }
    function lowestb2s(b) {
        return b["lowest"] ? "√" : ""
    }
    function genLink(b) {
        var id = b["appid"].toString()
        return '<a style="color: #01AAED;" href=https://store.steampowered.com/app/' + id + '>' + id + '</a>'
    }
    function genPicLink(b) {
        var id = b["appid"].toString()
        return '<a style="color: #01AAED;" href=https://store.steampowered.com/app/' + id + '>' + '<img style="height:100%" src="https://steamcdn-a.akamaihd.net/steam/apps/' + id + '/capsule_sm_120.jpg"></a>'
    }
    function treleaset2s(b) {
        if (!b['trelease']) {
            return '-'
        }
        var date = new Date(b['trelease'] * 1000);
        return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString()
    }
    function tlowestt2s(b) {
        if (!b['tlowest']) {
            return '-'
        }
        var date = new Date(b['tlowest'] * 1000);
        return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString()
    }
    function tmodifyt2s(b) {
        if (!b['tmodify']) {
            return '-'
        }
        var date = new Date(b['tmodify'] * 1000);
        return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString()
    }
    function review2text(b) {
        return review[b["rscore"]];
    }
    function rpercent2p(b) {
        return b["rpercent"].toString() + '%';
    }
    function pcut2p(b) {
        return b["pcut"].toString() + '%';
    }
    function plowestcut2p(b) {
        return b["plowestcut"].toString() + '%';
    }

    function renderTable() {
        var data = [];
        for (var key in infodict) {
            data.push(infodict[key]);
        }
        layui.use('table', function () {
            var table = layui.table;
            table.render({
                elem: '#test'
                , cols: [[
                    { field: 'appid', title: 'APPID', width: 100, sort: true, fixed: 'left', align: "center", templet: genLink }
                    , { field: 'pic', title: '预览图', width: 110, align: "center", templet: genPicLink }
                    , { field: 'name_cn', title: '名称', width: 200, sort: true, align: "center" }
                    , { field: 'card', title: '卡牌', minWidth: 50, sort: true, align: "center", templet: cardb2s }
                    , { field: 'limit', title: '受限', minWidth: 50, sort: true, align: "center", templet: limitb2s }
                    , { field: 'adult', title: '软锁', width: 50, sort: true, align: "center", templet: adultb2s }
                    , { field: 'free', title: '免费', width: 50, sort: true, align: "center", templet: freeb2s }
                    , { field: 'release', title: '发售', width: 50, sort: true, align: "center", templet: releaseb2s }
                    , { field: 'lowest', title: '史低', width: 50, sort: true, align: "center", templet: lowestb2s }

                    , { field: 'rscore', title: '评测结果', width: 120, sort: true, align: "center", templet: review2text }
                    , { field: 'rtotal', title: '总评', width: 80, sort: true, align: "center" }
                    , { field: 'rpercent', title: '好评', width: 80, sort: true, align: "center", templet: rpercent2p }

                    , { field: 'pcurrent', title: '现价', width: 80, sort: true, align: "center" }
                    , { field: 'porigin', title: '原价', width: 80, sort: true, align: "center" }
                    , { field: 'plowest', title: '史低价', width: 100, sort: true, align: "center" }
                    , { field: 'pcut', title: '当前折扣', width: 100, sort: true, align: "center", templet: pcut2p }
                    , { field: 'plowestcut', title: '史低折扣', width: 100, sort: true, align: "center", templet: plowestcut2p }

                    , { field: 'tag', title: '标签', width: 150, align: "center" }
                    , { field: 'developer', title: '开发商', width: 150, align: "center" }
                    , { field: 'publisher', title: '发行商', width: 150, align: "center" }

                    , { field: 'tlowest', title: '史低时间', width: 105, sort: true, align: "center", templet: tlowestt2s }
                    , { field: 'trelease', title: '发售时间', width: 105, sort: true, align: "center", templet: treleaset2s }
                    , { field: 'tmodify', title: '更新时间', width: 105, sort: true, align: "center", templet: tmodifyt2s }

                    , { field: 'gtype', title: '类型', width: 50, sort: true, align: "center" }
                    , { field: 'source', title: '来源', width: 50, sort: true, align: "center" }
                ]]
                , data: data
                , skin: 'row' //表格风格
                , even: true
                , page: true //是否显示分页
                , limits: [30, 60, 100, 150, 300, 600, 1000, 1500, 2000]
                , limit: 100
                , cellMinWidth: 80
                , height: 'full-215'
            });
        });
    }
    function getPercent(num, total) {
        num = parseFloat(num);
        total = parseFloat(total);
        if (isNaN(num) || isNaN(total)) {
            return "0%";
        }
        return total <= 0 ? "0%" : (Math.round(num / total * 100)) + "%";
    }
})();