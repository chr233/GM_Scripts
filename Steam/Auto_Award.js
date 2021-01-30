// ==UserScript==
// @name         Auto_Award
// @namespace    https://blog.chrxw.com
// @version      2.2
// @description  Steam自动打赏
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/recommended/\d+/?$/
// @connect      steamcommunity.com
// @connect      steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// 脚本版本
let Version = '2.2';
// 自动模式开关
let Vmode = false;
// 设置的目标
let Vgoal = 0;
// 还需打赏的点数
let Vleft = 0;
// 被打赏人名称
let Vname = '';
// 点数余额
let Vpoint = 0;
// 新的点数余额(如果减小了说明打赏成功)
let Vpoint_now = -1;
// 计时器
let Vtimer = -1;
// 初始化
(function () {
    'use strict';
    addPanel();
    loadConf();
    if (checkSelf()) {
        document.getElementById('p_dashang').style.display = 'None';
    } else {
        if (Vmode && checkTarget()) {
            getMyPoint();
            window.onload = autoAward;
        } else {
            getMyPoint();
        }
    }
})();
// 添加控制面板
function addPanel() {
    function genButton(text, foo) {
        let a = document.createElement('a');
        let s = genSpan(text);
        a.className = 'pagebtn';
        a.addEventListener('click', foo)
        a.appendChild(s);
        return a;
    }
    function genDiv(cls) {
        let d = document.createElement('div');
        if (cls) { d.className = cls };
        return d;
    }
    function genDivBox(title) {
        let d = genDiv('showcase_content_bg');
        if (title) {
            d.appendChild(genLabel(title));
            d.appendChild(genBr());
        }
        return d;
    }
    function genSpan(text) {
        let s = document.createElement('span');
        s.className = 'commentthread_header_label';
        s.textContent = text;
        return s;
    }
    function genLabel(text, bind) {
        let s = document.createElement('label');
        s.className = 'commentthread_header_label';
        s.textContent = text;
        if (bind) { s.setAttribute('for', bind); }
        return s;
    }
    function genInput(name, title, value, tips, enable) {
        let d = genDiv();
        if (title) { d.appendChild(genLabel(title + '  ', name)); }
        let i = document.createElement('input');
        i.name = name;
        i.id = name;
        i.style.textAlign = 'right';
        i.style.border = 'none';
        if (value) { i.value = value; }
        if (tips) { i.placeholder = tips; }
        if (enable != null) {
            i.disabled = !enable;
            if (enable == false) {
                i.style.background = '#3b3b3b';
                i.style.color = '#fff';
            } else {
                i.style.background = '#fff';
                i.style.color = '#3b3b3b';
            }
        }
        d.appendChild(i);
        return d;
    }
    function genTextArea(name, value, tips) {
        let d = genDiv();
        let i = document.createElement('textarea');
        i.name = name;
        i.id = name;
        i.style.width = '100%';
        i.style.height = '200px';
        i.style.resize = 'vertical';
        i.style.fontSize = '12px';
        if (value) { i.value = value; }
        if (tips) { i.placeholder = tips; }
        d.appendChild(i);
        return d;
    }
    function genLink(text, href, tips) {
        let a = document.createElement('a');
        a.href = href;
        a.text = text;
        if (tips) { a.setAttribute('data-tooltip-html', tips); }
        a.style.textDecoration = 'underline';
        a.className = 'whiteLink';
        return a;
    }
    function genSpace() {
        return genSpan('    ');
    }
    function genBr() {
        return document.createElement('br');
    }
    let panelArea = document.getElementById('rightContents');
    let panel = genDiv('review_box');
    panel.id = 'autoaward';
    let pTitle = genDiv('profile_customization_header ellipsis');
    pTitle.style.textAlign = 'center';

    let pTips1 = genLabel('自动打赏脚本 - V' + Version + ' - By Chr_');

    let pLink1 = genLink('打赏作者（点数）', 'https://steamcommunity.com/id/Chr_/recommended/1375870/', '感谢支持');
    let pLink2 = genLink('反馈', 'https://keylol.com/t671171-1-1', '留言即可');
    let pSpare = genLabel(' | ');

    pTitle.appendChild(pTips1);
    pTitle.appendChild(genBr());
    pTitle.appendChild(pLink1);
    pTitle.appendChild(pSpare);
    pTitle.appendChild(pLink2);

    let pContent = document.createElement('div');
    pContent.className = 'profile_customization_block';
    pContent.style.paddingTop = '0';
    panelArea.insertBefore(panel, panelArea.children[0]);
    panel.appendChild(pTitle);
    panel.appendChild(pContent);

    let dAwardOption = genDivBox('【控制面板】');
    dAwardOption.id = 'p_dashang';

    let iRecvAmount = genInput('recv_amount', '收到点数：', '', '被打赏人收到的点数', true);
    let iSendAmount = genInput('send_amount', '送出点数：', '', '打赏人消耗的点数', false);
    let myPoint = genInput('my_point', '我的点数：', '', '账号剩余点数', false);
    let process = genInput('process', '当前进度：', '', '未设定', false);

    iRecvAmount.children[1].textAlign = 'center';
    iRecvAmount.children[1].type = 'number';
    iRecvAmount.children[1].setAttribute('step', '100');
    iRecvAmount.children[1].setAttribute('min', '0');
    iRecvAmount.children[1].addEventListener('input', calcPoint);
    myPoint.setAttribute('data-tooltip-html', '点击刷新');
    myPoint.addEventListener('click', getMyPoint);

    let btnSetGoal = genButton('设置', setGoal);
    let btnClearGoal = genButton('重置', resetGoal);
    let btnStart = genButton('开始打赏', startAward);

    dAwardOption.appendChild(iRecvAmount);
    dAwardOption.appendChild(iSendAmount);
    dAwardOption.appendChild(myPoint);
    dAwardOption.appendChild(process);
    dAwardOption.appendChild(genBr());
    dAwardOption.appendChild(btnSetGoal);
    dAwardOption.appendChild(genSpace());
    dAwardOption.appendChild(btnClearGoal);
    dAwardOption.appendChild(genSpace());
    dAwardOption.appendChild(btnStart);
    pContent.appendChild(dAwardOption);

    let dHistory = genDivBox('【历史记录】(打赏人消耗的点数)');
    let txtHistory = genTextArea('op_history', '', '操作历史显示在这里');
    let btnTotal = genButton('点数统计', historyReport);
    let btnClear = genButton('清除记录', clearHistory);
    let txtTips2 = genLabel('历史记录过多可能会有问题,请注意清理', '');
    dHistory.appendChild(txtHistory);
    dHistory.appendChild(btnTotal);
    dHistory.appendChild(genSpace());
    dHistory.appendChild(btnClear);
    dHistory.appendChild(genBr());
    dHistory.appendChild(txtTips2)
    pContent.appendChild(dHistory);
}
// 自动打赏
function autoAward() {
    const max = 50; // 最大尝试次数
    let tries = 0; // 当前次数

    retry(reviewAward, 50);

    // 处理评测上的奖励按钮
    function reviewAward() {
        let reward = document.querySelector('.review_rate_bar>span:nth-child(4)'); 
        if (reward) {
            reward.click();
            tries = 0;
            retry(waitLoad, 600);
        } else {
            retry(reviewAward, 100);
        }
    }
    // 等待加载完全
    function waitLoad() {
        let doms = document.querySelectorAll('button[class^=awardmodal_Button_] span[class^=awardmodal_Points_]');
        let tips = document.querySelector('div[class^=awardmodal_Description_]')
        if (doms && tips) {
            tips.textContent = '关闭提示框即可中断操作,Bug反馈【chr@chrxw.com】';
            tries = 0;
            checkPoint();
        } else {
            retry(waitLoad, 600);
        }
    }
    // 检查点数,判断操作是否成功
    function checkPoint() {
        if (Vpoint_now >= 0) {
            document.getElementById('my_point').value = numAddDot(Vpoint_now);
            if (Vpoint > Vpoint_now) { // 点数有改变,打赏成功
                log('向 ' + Vname + ' 打赏 ' + (Vpoint - Vpoint_now).toString() + ' 点');
                Vleft -= (Vpoint - Vpoint_now);
                Vpoint = Vpoint_now;
                saveConf();
                updateProcess();
            }
            if (Vpoint < 300) { // 点数不足,终止操作
                throw '点数不足,操作结束';
            }
            if (Vleft <= 0) { // 打赏完成,终止操作
                throw '打赏完毕,操作完成';
            }
            tries = 0;
            selectReward();
        } else {
            retry(checkPoint, 300);
        }
    }
    // 选择打赏
    function selectReward() {
        let btns = document.querySelectorAll('button[class^=awardmodal_Button_]');
        let max = 0;
        for (btn of btns) { // 找到最大的打赏项目
            if (btn.classNames().toString().search('Disabled') != -1) {
                continue; // 跳过已经打赏过的选项
            }
            let point = btn.querySelector('span[class^=awardmodal_Points_]');
            let tmp = Number(point.textContent.replace(/,/g, ''));
            if (tmp <= Vleft && tmp <= Vpoint_now) {
                if (tmp > max) {
                    max = tmp;
                }
            }
        }
        if (max == 0) { // 没有合适的打赏项目,终止操作
            throw '没有合适的打赏项目,请更换评测'
        }
        for (btn of btns) { // 找到最大的打赏项目
            if (btn.classNames().toString().search('Disabled') != -1) {
                // 跳过已经打赏过的选项
                continue;
            }
            let point = btn.querySelector('span[class^=awardmodal_Points_]');
            let tmp = Number(point.textContent.replace(/,/g, ''));
            if (tmp == max) {
                btn.click();
                break;
            }
        }
        tries = 0;
        retry(sendReward, 100);
    }
    // 继续
    function sendReward() {
        let btns = document.querySelector('div[class^=awardmodal_Actions_]');
        if (btns) {
            if (btns.childElementCount == 1) {
                btns.querySelector('button.Primary').click();
                tries = 0;
                retry(sendReward2, 100);
            } else { // 有多个元素,代表点数不足;
                throw '点数不足,操作结束';
            }
        } else {
            retry(sendReward, 100);
        }
    }
    // 送出奖励
    function sendReward2() {
        let btn = document.querySelector('div[class^=awardmodal_Actions_] button.Primary');
        if (btn) { // 打赏后会刷新
            btn.click();
            // 禁止刷新
            noReload(true);
            closePanel();
            closePanel();
            retry(waitAnimation, 1000);
        } else { // 有多个元素,代表点数不足;
            throw '点数不足,操作结束';
        }
    }
    // 等待动画结束
    function waitAnimation() {
        // 刷新余额
        noReload(false);
        Vpoint_now = -1;
        getMyPoint();
        // 下一轮打赏
        retry(reviewAward, 50);
    }
    // 关闭面板
    function closePanel() {
        let close = document.querySelector('.closeButton');
        if (close) {
            close.click();
        }
    }
    // 自动重试
    function retry(foo, t) {
        console.log(foo.name);
        if (tries++ <= max) {
            setTimeout(() => {
                try {
                    foo();
                } catch (e) {
                    log(e);
                    if (e.toString().search('操作结束') != -1) {
                        Vmode = false;
                        saveConf();
                    } else if (e.toString().search('操作完成') != -1) {
                        Vmode = false;
                        saveConf();
                        closePanel();
                    } else {
                        closePanel();
                    }
                }
            }, t);
        } else {

            log('操作超时,自动刷新');
            window.location.reload();
        }
    }
}
// 设定目标
function setGoal() {
    let goal = Number(numRemoveDot(document.getElementById('send_amount').value));
    if (Vpoint_now < 0) {
        ShowAlertDialog('提示', '暂未获取到当前点数,请稍后！');
        return;
    }
    if (goal != goal || goal <= 0) {
        ShowAlertDialog('错误', '打赏点数必须大于0！');
        return;
    }
    Vmode = true;
    Vgoal = goal;
    Vleft = goal;
    Vname = document.querySelector('.profile_small_header_name>.persona_name_text_content').text.strip();
    Vpoint = Vpoint_now;
    saveConf();
    updateProcess();
    ShowAlertDialog('提示', '目标已设置，等待开始运行。<br><br>点击【开始打赏】开始运行！<br><br>点击【重置】中断运行（手动刷新页面不会中断脚本运行）！<br><br>一篇评测打赏完以后，手动换一篇评测就可以继续运行。');
}
// 清除目标
function resetGoal() {
    Vmode = false;
    Vgoal = 0;
    Vleft = 0;
    Vname = '';
    Vpoint = Vpoint_now;
    saveConf();
    document.getElementById('send_amount').value = '';
    document.getElementById('recv_amount').value = '';
    updateProcess('');
    calcPoint();
    window.location.reload();
}
// 自动打赏
function startAward() {
    if (Vmode) {
        if (!checkTarget()) {
            if (confirm('目标用户不一致！建议重新设定\n\n按【确认】终止操作，按【取消】忽略错误并继续')) {
                return;
            }
        }
        autoAward();
    } else {
        ShowAlertDialog('错误', '尚未设置目标！');
    }
}
// 打印日志
function log(message) {
    console.log(message)
    let iHistory = document.getElementById('op_history');
    iHistory.value += message + '\n';
    iHistory.scrollTop = iHistory.scrollHeight;
    GM_setValue('history', iHistory.value.strip());
}
// 计算点数需求
function calcPoint() {
    let send = document.getElementById('send_amount');
    let recv = document.getElementById('recv_amount');
    let mine = document.getElementById('my_point');
    let rtmp = Number(recv.value);
    let mtmp = Number(numRemoveDot(mine.value));
    if (rtmp != rtmp || recv.value == '') {
        send.value = '';
        mine.style.color = '#fff';
    } else {
        rtmp = Math.ceil(rtmp / 100) * 300;
        send.value = numAddDot(rtmp);
        mine.style.color = (rtmp > mtmp) ? '#f00' : '#fff';
    }
}
// 获取我的点数
function getMyPoint() {
    GM_xmlhttpRequest({
        method: "GET",
        url: 'https://store.steampowered.com/points/shop/',
        onload: function (response) {
            if (response.status == 200) {
                let t = response.responseText.match(/\{\&quot\;points\&quot\;\:\&quot\;(\d+)\&quot\;/);
                t = t ? t[1] : 0;
                Vpoint_now = Number(t);
                document.getElementById('my_point').value = numAddDot(t);
                calcPoint();
            }
        }
    });
}
// 清除历史记录
function clearHistory() {
    GM_setValue('history', '');
    document.getElementById('op_history').value = '';
}
// 统计打赏记录
function historyReport() {
    let list = document.getElementById('op_history').value.split('\n');
    let dic = {};
    for (txt of list) {
        let match = txt.match(/向 (.*) 打赏 (\d+) 点/);
        if (match) {
            console.log(match)
            let name = match[1].replace(/\s/g, '');
            let value = Number(match[2]);
            if (dic[name] == undefined) {
                dic[name] = value;
            } else {
                dic[name] += value;
            }
        }
    }
    console.log(JSON.stringify(dic))
    log('====点数统计====')
    for (n in dic) {
        log(n + ' 共计 ' + dic[n] + ' 点');
    }
    log('====点数统计====')
}
// 判断是不是自己
function checkSelf() {
    return document.querySelector("#account_pulldown").textContent.strip() ==
        document.querySelector('.profile_small_header_name>.persona_name_text_content').textContent.strip();
}
// 判断是不是目标用户
function checkTarget() {
    return document.querySelector('.profile_small_header_name>.persona_name_text_content').textContent.strip() == Vname;
}
// 添加千分位
function numAddDot(num) {
    return (num + '').replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,');
}
// 去掉千分位
function numRemoveDot(num) {
    return num.replace(/,/g, '')
}
// 更新进度显示
function updateProcess(msg) {
    if (msg != null) {
        document.getElementById('process').value = msg;
    } else {
        document.getElementById('process').value = ((Vgoal - Vleft) / Vgoal * 100).toFixed(1) + '% ' + numAddDot(Vgoal - Vleft);
    }
}
// 读取设置
function loadConf() {
    let mode = GM_getValue('mode');
    Vmode = mode ? true : false;
    if (Vmode) {
        let goal = GM_getValue('goal');
        Vgoal = goal ? goal : 0;
        document.getElementById('send_amount').value = numAddDot(Vgoal);
        document.getElementById('recv_amount').value = Vgoal / 3;
        let left = GM_getValue('left');
        Vleft = left ? left : 0;
        let point = GM_getValue('point');
        Vpoint = point ? point : 0;
        let name = GM_getValue('name');
        Vname = name ? name : '';
        updateProcess();
    }
    let history = GM_getValue('history');
    if (history) {
        let iHistory = document.getElementById('op_history')
        iHistory.value = history + '\n';
        iHistory.scrollTop = iHistory.scrollHeight;
    }
}
// 保存设置
function saveConf() {
    GM_setValue('mode', Vmode);
    GM_setValue('goal', Vgoal);
    GM_setValue('left', Vleft);
    GM_setValue('name', Vname);
    GM_setValue('point', Vpoint);
}
// 禁止刷新
function noReload(enable = false) {
    if (enable && Vtimer == -1) {
        Vtimer = setInterval(() => {
            window.stop();
        }, 100);
    } else if (!enable) {
        clearInterval(Vtimer);
        Vtimer = -1;
    }
}