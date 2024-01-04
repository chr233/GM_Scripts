// ==UserScript==
// @name         Omen小工具
// @namespace    http://tampermonkey.net/
// @version      0.9.13
// @description  try to take over the world!
// @author       jiye
// @match        https://keylol.com/*
// @match        https://www.lootboy.de/*?KLTOOL=1
// @match        https://login3.id.hp.com/*
// @noframes
// @grant        GM_log
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_info
// @grant        unsafeWindow
// @connect     oauth.hpbp.io
// @connect     api.lootboy.de
// @connect     task.jysafe.cn
// @connect     www.hpgamestream.com
// @connect     rpc-prod.versussystems.com
// @connect     api.hpbp.io
// @connect     api.igsp.io
// @connect     keylol.com
// @connect     na.alienwarearena.com
// @require      https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/jiyeme/OmenScript@2455ec2ff19eaf628b10d792bf2e95bbf28c8ff2/js/sha256.min.js
// @icon           https://www.google.com/s2/favicons?domain=keylol.com
// @updateURL   https://raw.githubusercontent.com/jiyeme/OmenScript/master/omen.user.js
// @downloadURL     https://raw.githubusercontent.com/jiyeme/OmenScript/master/omen.user.js
// @namespace  jiyecafe@gmail.com-omen
// ==/UserScript==
// TODO: 自动弹出地址？
// @require      http://127.0.0.1:5500/js/main.ed19e0b4.chunk.js

(function() {
    'use strict';

    // Your code here...
    const jq=$
    const ApplicationId = "6589915c-6aa7-4f1b-9ef5-32fa2220c844";
    const ClientId = "2f12256f-11dd-4091-8b74-bc2f8cfd0587";
    //130d43f1-bb22-4a9c-ba48-d5743e84d113旧
    //https://oauth.hpbp.io/oauth/v1/auth?response_type=code&client_id=2f12256f-11dd-4091-8b74-bc2f8cfd0587&redirect_uri=http://localhost:9080/login&scope=email+profile+offline_access+openid+user.profile.write+user.profile.username+user.profile.read&state=KZyVTzpfaDmYOyR4kr2992dWnANJ7dPLESEi_aeEgT4&max_age=28800&acr_values=urn:hpbp:hpid&prompt=consent
    const debug = true;

    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ?
                                  (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    const HTTP = (function(){

        // [修改自https://greasyfork.org/zh-CN/scripts/370650]
        const httpRequest = function (e) {
            const requestObj = {}
            requestObj.url = e.url
            requestObj.method = e.method.toUpperCase()
            requestObj.timeout = e.timeout || 30000
            if (e.dataType) requestObj.responseType = e.dataType
            if (e.headers) requestObj.headers = e.headers
            if (e.data) requestObj.data = e.data
            if (e.cookie) requestObj.cookie = e.cookie
            if (e.anonymous) requestObj.anonymous = e.anonymous
            if (e.onload) requestObj.onload = e.onload
            if (e.fetch) requestObj.fetch = e.fetch
            if (e.onreadystatechange) requestObj.onreadystatechange = e.onreadystatechange
            requestObj.ontimeout = e.ontimeout || function (data) {
                if (debug) console.log(data)
                if (e.status) e.status.error('Error:Timeout(0)')
                if (e.r) e.r({ result: 'error', statusText: 'Timeout', status: 0, option: e })
            }
            requestObj.onabort = e.onabort || function (data) {
                if (debug) console.log(data)
                if (e.status) e.status.error('Error:Aborted(0)')
                if (e.r) e.r({ result: 'error', statusText: 'Aborted', status: 0, option: e })
            }
            requestObj.onerror = e.onerror || function (data) {
                if (debug) console.log(data)
                if (e.status) e.status.error('Error:Error(0)')
                if (e.r) e.r({ result: 'error', statusText: 'Error', status: 0, option: e })
            }
            if (debug) console.log('发送请求:', requestObj)
            GM_xmlhttpRequest(requestObj);
        }
        function get(url, e = {}){
            UI.showLoading();
            return new Promise((resolve, reject)=>{
                e.url = url;
                e.method = "GET";
                e.onload = res=>{
                    UI.hideLoading()
                    resolve(res)
                };
                e.onerror = err=>{
                    UI.hideLoading()
                    reject(err)
                };
                httpRequest(e)
            })
        }
        function post(url, e = {}){
            UI.showLoading();
            return new Promise((resolve, reject)=>{
                e.url = url;
                e.method = "POST";
                e.onload = res=>{
                    UI.hideLoading();
                    let resp = res.response;
                    resolve(res);
                };
                e.onerror = err=>{
                    UI.hideLoading();
                    reject(err);
                };
                httpRequest(e);
            })
        }
        function put(url, e = {}){
            UI.showLoading();
            return new Promise((resolve, reject)=>{
                e.url = url;
                e.method = "PUT";
                e.onload = res=>{
                    UI.hideLoading();
                    resolve(res);
                };
                e.onerror = err=>{
                    UI.hideLoading();
                    reject(err);
                };
                httpRequest(e);
            })
        }
        return {
            GET: get,
            POST: post,
            PUT: put
        }
    })();

    const UI = (function(){
        let data = [];

        const init = ()=>{
            initToolBar();
            initIframe();
            OMEN_UI.init();
            LootBoy_UI.init();
            SS_UI.init();
            KL_UI.init();
            AW_UI.init();
        }
        function initToolBar(){
              jq("#nav-user-action-bar > .list-inline > *:nth-child(1)").before(`<li id="kl-tool-actions" class="btn btn-user-action" style="position: relative;z-index: 9;"><span>工具</span>
                   <ul class="kl-tool-action-list">
                   </ul>
                </li>
                <style>
                .kl-tool-action-list{
                    position: absolute;
                    background-color: white;
                    min-width: 46px;
                    left: 0px;
                    margin-top: 6px;
                    display: none;
                    color: black;
                    border: solid 1px #999;
                }
                 #kl-tool-actions:hover .kl-tool-action-list{
                         display: block!important;
                 }
                 .kl-tool-action-list > li{
                    padding: 6px 0px;
                 }
                 .kl-tool-action-list > li:hover{
                     background-color: #f0f3f4;
                 }
                </style>
                `);
        }
        const addAction = (action)=>{
            jq("#kl-tool-actions > ul").append(`<li id="${action.id}">${action.text}</li>`);
            jq("#more_options").append(`<li id="${action.id}" style="padding: 4px 15px 4px 5px;color: #4C4C4C;"><i class="icon iconfont icon-list"></i>${action.text}</li>`);
        }

        const showLoading = ()=>{
            jq(".kl-tool-content>.omen-header>.omen-loading>.icon").css("display", "initial");
            jq(".kl-tool-content>.omen-header>.omen-loading").css("visibility", "visible");
        }
        const hideLoading = ()=>{
            jq(".kl-tool-content>.omen-header>.omen-loading>.icon").css("display", "none");
            jq(".kl-tool-content>.omen-header>.omen-loading").css("visibility", "hidden");
        }
        // 添加提示
        const addNotice = (msg)=>{
            const noticeBlock = document.createElement("div");
            noticeBlock.id = "id-" + new Date().getTime() + "-" + parseInt(Math.random() * 10000);
            let left = document.createElement("div");
            left.innerText = `${msg}`
            let right = document.createElement("div");
            right.innerText = "X"
            right.style.marginLeft = "10px";
            right.style.cursor = "pointer";
            noticeBlock.append(left);
            noticeBlock.append(right);
            noticeBlock.className = "notice-content";
            jq("#kl-iframe-notice").append(noticeBlock)

            right.addEventListener('click', ()=>{
                jq("#" + noticeBlock.id).remove();
            })
            setTimeout(()=>{
                jq("#" + noticeBlock.id).remove();
            }, 5000);
        }

        // 初始化操作界面
        function initIframe(){
            console.log(GM_info.script.version)
            let html = `
            <div id="kl-tool-mask"></div>

<div id="kl-tool-iframe" style="display:none">
    <div class="kl-tool-content">
        <div class="omen-header">
            <div>ver.${GM_info.script.version}</div>
            <div class="omen-loading"><svg  t="1624533378166" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2471" ><path d="M510.976 62.464c-247.296 0-448 200.704-448 448s200.704 448 448 448 448-200.704 448-448-200.704-448-448-448z m0 175.104c32.768 0 59.904 26.624 59.904 59.904 0 32.768-26.624 59.904-59.904 59.904s-59.904-26.624-59.904-59.904 27.136-59.904 59.904-59.904z m0 700.416c-117.76 0-213.504-95.744-213.504-213.504 0-117.76 90.624-213.504 213.504-213.504 117.76 0 213.504-95.744 213.504-213.504 0-111.616-85.504-203.264-194.56-212.992l-0.512-0.512c227.328 9.728 409.088 197.12 409.088 427.008-0.512 236.032-191.488 427.008-427.52 427.008z" fill="#1296db" p-id="2472"></path><path d="M451.072 724.48c0 32.768 26.624 59.904 59.904 59.904 32.768 0 59.904-26.624 59.904-59.904 0-32.768-26.624-59.904-59.904-59.904-32.768 0-59.904 26.624-59.904 59.904z" fill="#1296db" p-id="2473"></path></svg>
            少女祈祷中~</div>
            <svg  id="kl-tool-iframe-close" onclick="document.getElementById('kl-tool-mask').style.display = document.getElementById('kl-tool-iframe').style.display = 'none'"
            t="1624536136145" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3441" width="20" height="20"><path d="M940.802 939.949c0 0.014 0 0.021-0.051 0.044-28.183 28.22-73.991 28.262-102.218 0.05L512.127 614.299 186.382 940.653c-0.051 0.021-0.051 0.05-0.051 0.05-28.227 28.235-74.035 28.256-102.262 0.052-28.328-28.248-28.372-74.05-0.146-102.32l325.746-326.37L83.313 186.312c-28.278-28.227-28.328-74.027-0.094-102.29 0-0.022 0-0.036 0.044-0.052 28.183-28.19 73.948-28.212 102.226-0.007l326.355 325.745L837.64 83.34l0.044-0.051c28.234-28.227 73.99-28.256 102.269-0.014 28.32 28.226 28.32 74.027 0.094 102.312L614.3 511.942l326.406 325.745c28.228 28.227 28.322 74.02 0.095 102.262z" p-id="3442" fill="#2c2c2c"></path></svg>
        </div>
        <div id="kl-tool-mainArea">
        </div>
    </div>
    <div id="kl-iframe-notice">
    </div>
</div>
<style>
    /*提示内容动画*/
    .notice-content{
        display: flex;
        position: absolute;
        top: 50%;
        right: -100px;
        animation: noticeAni 3s linear 1;
        background-color: #1fa01f;
        padding: 5px 11px 5px 16px;
        border-radius: 4px;
        box-shadow: 1px 1px 6px 0px #0da90d;
    }
    @keyframes noticeAni{
        0%{
                top: 50%;
                right: -100px;
              }
        15%{
                top: 50%;
                right: 10px;
            }
        45%{
                top: 35%;
                right: 10px;
            }
        75%{
                top: 20%;
                right: 10px;
            }
        100%{
                 top: 20%;
                 right: -100px;
                }
	}

    #kl-tool-mask{
        width: 100%;
        height: 100%;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 998;
        background: #000000d1!important;
        opacity: .85!important;
        display: none;
    }
    #kl-tool-iframe{
        position: fixed;
        top: 5rem;
        left: 5rem;
        right: 5rem;
        bottom: 5rem;
        /*height: 95vh;*/
        background-color: #66bbff;
        z-index: 999;
        overflow: hidden;
        border-radius: .5rem;
    }
    #kl-tool-iframe .kl-tool-content{
        margin:1rem;
        height: 90%;
        display: flex;
        flex-direction: column;
    }
    .kl-tool-content > .omen-header{
        height:20px;
        display:flex;
    }
    #kl-tool-mainArea {
        display: flex;
        flex-direction: column;
        height: 100%;

    }
    .kl-tool-content .omen-loading{
        width: 53%;
        text-align: right;
        visibility: hidden;
    }
    .kl-tool-content .omen-loading>.icon{
        height:20px;
        width:20px;
        display:none;
        transition: 0.5s;
        animation: rotate 1s linear infinite;  /*开始动画后无限循环，用来控制rotate*/
    }
    @keyframes rotate{
        0%{
                transform: rotate(0);
              }
        50%{
                transform:rotate(180deg);
            }
        100%{
                 transform: rotate(360deg);
                }
	}

    #kl-tool-iframe-close{
        position: absolute;
        right: 20px;
        cursor: pointer;
    }
</style>
            `;

            jq("body").append(html);
        }

        const initFrameContent = (html)=>{
            jq("#kl-tool-mainArea").empty();
            jq("#kl-tool-mainArea").append(html);

            // 显示Frame
            if(document.getElementById("kl-tool-iframe").style.display==="block")return ;
            document.getElementById("kl-tool-iframe").style.display = "block"
            document.getElementById("kl-tool-mask").style.display = "block"
        }

        return {
            init: init,
            initIframe: initIframe,
            showLoading: showLoading,
            hideLoading: hideLoading,
            addAction: addAction,
            initFrameContent: initFrameContent,
            addNotice: addNotice
        }
    })();

    // OMEN
    const OMEN_UI = (()=>{
        let omenInfo = null;
        let omenAccount = GM_getValue("omenAccount")||{};
        let credit = 0;

        const config = [
            {
                id: "avaliable",
                name: "可参与列表",
                action: loadChallengeList,
                default: `
                <button onclick="jQuery('#omen-avaliable-list button').click();">一键参与</button>
                <ul id="omen-avaliable-list">
                    <li><h2>可参与列表：</h2></li>
                </ul>`
            },
            {
                id: "current",
                name: "进行中",
                action: loadCurrentList,
                default:  `
                <button onclick="jQuery('#omen-current-list button').click();">一键加入自动列表</button>
                <ul id="omen-current-list">
                    <li><h2>进行中：</h2></li>
                </ul>`
            },
            {
                id: "prize",
                name: "奖品",
                action: loadPrizeList,
                default: `
                    <h2>赢得的奖励（鼠标放在奖品上会显示具体激活流程）：</h2>
                    <ul class="won"></ul>
                    <h2>等待开奖：</h2>
                    <ul class="pending"></ul>
                    <!--<h2>过期的：</h2>
                    <ul class="other"></ul>-->
`
            },
            {
                id: "log",
                name: "自动执行日志",
                action: loadLog,
                default: `
                <button onclick="sessionStorage.setItem('omenLog', '')">清空日志</button>
                <ul id="omen-log-list">
                    <li>日志列表：</li>
                    <li></li>
                </ul>`
            },
            {
                id: "help",
                name: "帮助",
                action: null,
                default: `
                <div id="omen-help-list"><h2>帮助信息</h2>
                    <h3>一、任务执行类型区别</h3>
                    <p>
                        1.设定时间进行任务:<br/>
&nbsp;&nbsp;确定后立即提交任务进度数据，失败就是没有变化，成功按钮数值会发生变化。
<br />
2.自动执行任务:<br />
&nbsp;&nbsp;添加任务后，每隔30秒会提交一次“30秒的游戏时间”；刷新页面后也会继续执行，除非session失效。<br />
3.目前记录只会体现在日志区域。
                    </p>
                    <h3>二、一次性执行相关</h3>
                    <p>
                    惠普策略：
                    <ol style="margin-left: 30px;">
                        <li>关键词“最后一次提交时间”</li>
                        <li>参加成功后，服务器会设定“最后一次提交时间”为参加时间</li>
                        <li>每次提交成功后，服务器会设定“最后一次提交时间”当次提交时间</li>
                        <li>提交的信息是游戏时间，当次提交的时间应小于“最后一次提交时间与当前时间之差”</li>
                    </ol>
                    </p>

                </div>`
            },
            {
                id: "changeArea",
                name: "换区",
                action: changeArea,
                default: `
                <div>
                支持区域："us(美国)", "cn(中国)", "in(印度)", "mx(墨西哥)", "gb(英国)"<br>
                经纬度（<a href="http://api.map.baidu.com/lbsapi/getpoint/" target="_blank">获取</a>）：<input  id="omen-change-area-data" type="text" placeholder="经纬度"> <button id="omen-change-area-btn">换区</button>
                <style type="text/css">
                    #omen-change-area-result{
                        border: 1px solid #8d8c8c;
                        padding: 5px;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                </style>
                <pre id="omen-change-area-result"></pre>

                </div>`
            }
        ];

        const ACCOUNT = (()=>{
            const set = (userInfo)=>{
                console.log(userInfo);
                //const uinfo = JSON.parse(window.atob(tokenInfo.access_token.split(".")[1]))
                omenAccount[userInfo.email] = userInfo;
                GM_setValue("omenAccount",omenAccount);
                omenInfo = userInfo;
            }
            const change = (email)=>{
                omenInfo = omenAccount[email];
            }
            const remove = (email)=>{
                delete omenAccount[email];
                GM_setValue("omenAccount", omenAccount);
            }
            const updateAuth = (auth)=>{
                let email = omenInfo.email;
                omenAccount[email].auth = auth;
                omenInfo = omenAccount[email];
                GM_setValue("omenAccount", omenAccount);
            }
            const updateSession = session=>{
                let email = omenInfo.email;
                omenAccount[email].sessionToken = session;
                omenInfo = omenAccount[email];
                GM_setValue("omenAccount", omenAccount);
            }
            return {
                set: set,
                remove: remove,
                change: change,
                updateAuth: updateAuth,
                updateSession: updateSession
            }
        })();

        const init = ()=>{
            HTTP.GET("https://keylol.com/home.php?mod=spacecp&ac=usergroup").then(res=>{
                // console.log(res)
                // console.log(JSON.stringify(res))
                const resp = res.response;
                // console.log(resp)
                const creditMatch = resp.match(/积分: (\d+)</);
                if(creditMatch !== null && creditMatch.length === 2){
                    console.log(creditMatch)
                    credit = parseInt(creditMatch[1]);
                    console.log("积分：" + credit);
                }
            })
            UI.addAction({
                id: "omen-module",
                text: "Omen"
            });
            // 打开界面
            document.getElementById("omen-module").addEventListener("click", ()=>{
                if(credit < 1000){
                    alert("权限不足！\n你拥有的积分：" + credit);
                    return ;
                }
                console.log(TASK.runInterval)
                if(TASK.runInterval[0] === null){
                    alert("已有页面运行！！\n为减少封禁概率，请在同一个页面进行操作。\n工具为红色字的是正在运行的页面！！");
                    return;
                }
                loadOmen();
                event();
                // if(omenInfo==null)return;
                // accessTokenUpdate();
                // loadChallengeList();
                // let a = GM_addStyle("#kl-tool-iframe{display:block!important;}")
                // GM_log(a)
            })
            event();
            initTask();
        }

        const event = ()=>{
            // 账户切换
            if(document.getElementById("omen-account-switch")!==null && document.getElementById("omen-account-switch").onchange===null){
                document.getElementById("omen-account-switch").onchange = (e)=>{
                    ACCOUNT.change(document.getElementById("omen-account-switch").value)
                    //sessionTokenUpdate();
                }
            }
            // 账户删除
            if(document.getElementById("omen-account-delete")!==null && document.getElementById("omen-account-delete").onclick===null){
                document.getElementById("omen-account-delete").onclick = (e)=>{
                    ACCOUNT.remove(document.getElementById("omen-account-switch").value);
                    updateAccountList();
                }
            }
            // localhost地址输入事件
            if(document.getElementById("omen-localhost-link")!==null && document.getElementById("omen-localhost-link").onchange===null){
                document.getElementById("omen-localhost-link").onchange = (e)=>{
                    console.log(e)
                    let value = e.target.value
                    let codeR = value.match(/code=(.*?)&/)
                    jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = jq("#kl-tool-iframe .omen-sessionresult")[0].innerText = "等待操作";
                    if(codeR==null || codeR.length<=1){
                        jq("#kl-tool-iframe .omen-code")[0].innerText = "解析失败";
                    }else{
                        // 解析成功，获取认证信息
                        let auth = null
                        const startTime = parseInt(new Date().getTime()/1000);

                        jq("#kl-tool-iframe .omen-code")[0].innerText = codeR[1]
                        OMEN.getToken(codeR[1]).then(res=>{
                            console.log(res)
                            auth = res.response
                            auth.startTime = startTime;
                            if(auth.status_code===undefined){
                                jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = "成功"
                                return OMEN.getUserinfo(auth.access_token)
                            }else{
                                jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = auth.error_description
                            }
                        }).then(res=>{
                            console.log(res)
                            const resp = res.response;
                            ACCOUNT.set({
                                auth: auth,
                                email: resp.email
                            });
                            updateAccountList();
                            document.getElementById("omen-account-switch").value = resp.email;
                            ACCOUNT.change(resp.email);
                        })
                    }
                }
            }

            if(document.getElementById("omen-refreshtoken")!==null && document.getElementById("omen-refreshtoken").onchange===null){
                document.getElementById("omen-refreshtoken").addEventListener("click", (e)=>{
                    accessTokenUpdate(true);
                })
            }

            if(document.getElementById("omen-getsession")!==null && document.getElementById("omen-getsession").onchange===null){
                document.getElementById("omen-getsession").addEventListener("click", (e)=>{
                    sessionTokenUpdate();
                })
            }
        }
        const updateAccountList = ()=>{
            jq("#omen-account-switch").empty();
            for(let _email in omenAccount){
                jq("#omen-account-switch").append(`<option>${_email}</option>`);
            }
            ACCOUNT.change(document.getElementById("omen-account-switch").value)
        }
        function loadOmen(){
            //              https://oauth.hpbp.io/oauth/v1/auth?response_type=code&client_id=2f12256f-11dd&redirect_uri=http://localhost:9080/login&scope=email+profile+offline_access+openid+user.profile.write+user.profile.username+user.profile.read&state=KZyVTzpfaDmYOyR4kr2992dWnANJ7dPLESEi_aeEgT4&max_age=28800&acr_values=urn:hpbp:hpid&prompt=consent
            let link = "https://oauth.hpbp.io/oauth/v1/auth?response_type=code&client_id=" + ClientId +"&redirect_uri=http://localhost:9080/login&scope=email+profile+offline_access+openid+user.profile.write+user.profile.username+user.profile.read&state=G5g495-R4cEE" + (Math.random()*100000) +"&max_age=28800&acr_values=urn:hpbp:hpid&prompt=consent"
            UI.initFrameContent(`
        <div id="omen-account">切换账户：
            <select id="omen-account-switch" title="Omen账户">
            </select>
            <button id="omen-account-delete">删除账号</button>
        </div>
        <div>
            <a href="${link}" target="_blank" style="font-size:1.5rem">登录</a><br>
            <label for="omen-localhost-link">
                localhost地址: <input id="omen-localhost-link" type="text" style="width: 90%;" placeholder="请粘贴登录后那个不能访问的地址，然后回车" />
            </label>
            <br>CODE:<span class="omen-code">等待...</span>
            <br>
            <button id="omen-refreshtoken">刷新AccessToken</button><span class="omen-tokenresult">等待...</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button id="omen-getsession">获取SESSION</button><span class="omen-sessionresult">等待...</span>
            <br>
            <br>
        </div>
        <div id="omen-data">
            <div  id="omen-action-button" class="omen-action-button">
            </div>
            <hr>
            <div id="omen-item-area">
            </div>
        </div>
    <style>
        input#omen-localhost-link:disabled {
            background-color: #dddddd;
        }
        #omen-data{
                        border: solid 1px #f00;
                        height: 100%;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        position: relative;
                        padding: .5rem;
        }
        #omen-item-area{
            overflow: scroll;
        }

            /*simple*/
            #omen-view-avaliable, #omen-view-current{
                position: relative;
            }
            .omen-item-simple img{
                position: absolute;
                display: none;
                margin-top: -100px;
            }
            .omen-item-simple:hover img{
                display:block;
            }
        /*beauty*/
        #omen-avaliable-list, #omen-current-list{
            display:flex;
            flex-wrap: wrap;
        }
        .omen-challenge-item{
            display: flex;
            flex-direction: column;
            width: 100px;
            margin: .5rem;
        }
        .omen-challenge-item img{
            height: 100px;
            width: 100px;
        }
        .omen-challenge-item:hover div{
            display:block;
        }
        .omen-challenge-item div{
            display:none;
            position: absolute;
            width: 100px;
            background-color: #000000b5;
            color: white;
            height: 100px;
        }
        .omen-challenge-item div>span{
            padding: 7px;
            display: block;
        }
                    /*滚动条样式*/
                    #kl-tool-iframe ::-webkit-scrollbar {/*滚动条整体样式*/
                        width:9px;/*高宽分别对应横竖滚动条的尺寸*/
                        height:4px;
                    }
                    #kl-tool-iframe ::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                        border-radius:5px;
                        -webkit-box-shadow:inset 0 0 5px rgba(0,0,0,0.2);
                        background:#e0e5eb;
                    }
                    #kl-tool-iframe ::-webkit-scrollbar-track {/*滚动条里面轨道*/
                        // -webkit-box-shadow:inset 0 0 5px rgba(0,0,0,0.2);
                        border-radius:0;
                        //background: rgba(0,0,0,0.1);
                    }
                </style>
`)
            // 初始化下半部分
            for(let ele of config){
                const view = document.createElement("div")
                view.style.display = "none";
                view.id = `omen-view-${ele.id}`;
                view.innerHTML = ele.default;
                jq("#omen-item-area").append(view);

                const btn = document.createElement("button")
                btn.id = `omen-${ele.id}-btn`;
                btn.innerText = ele.name;
                btn.onclick = (e)=>{
                    jq("#omen-action-button > button").attr("disabled", false);
                    e.target.disabled = true;

                    jq("#omen-item-area > *").css("display", "none");
                    view.style.display = "block";
                    if(ele.action) ele.action(view.id);
                };
                jq("#omen-action-button").append(btn);

            }
            //test
            //document.getElementById("kl-tool-iframe").style.display = "block"
            //document.getElementById("kl-tool-mask").style.display = "block"
            //addNotice("提示内容")
            // test
            updateAccountList();
        }
        const genItem = e=>{
            let id = `${e.challengeStructureId}|${e.prize.campaignId}`
            let html = "";
            if(e.progressPercentage === undefined){
                // 未参加，挑战列表
                const simple = `<li class="omen-item-simple">
                                                <img src="${e.prize.imageUrl}" style="height: 100px;width: 100px;" >
                                                ${e.prize.displayName} - ${e.displayName}    <button id="${id}">参加</button>
                                        </li>`
                const beauty = `
                <li>
                    <div class="omen-challenge-item">
                        <img src="${e.prize.imageUrl}"/>
                        <!--奖品-->
                        <span>${e.prize.displayName}</span>
                        <!--任务-->
                        <div>
                            <span>${e.displayName}</span>
                        </div>
                        <button id="${id}">参加</button>
                    </div>
                </li>
                `;
                return beauty;
            }else{
                const simple = `
                <li class="omen-item-simple">
                        <img src="${e.prize.imageUrl}" style="height: 100px;width: 100px;" >
                        ${e.prize.displayName} - ${e.displayName} - 开始于${e.createdAt}  （${e.progressPercentage}%)  <button id="${id}_auto"  data-eventname="${e.relevantEvents[0]}">自动做任务</button>
                </li>
                `;

                const beauty = `
                <li>
                    <div class="omen-challenge-item">
                        <img src="${e.prize.imageUrl}"/>
                        <!--奖品-->
                        <span>${e.prize.displayName}</span>
                        <!--任务-->
                        <div>
                            <span>${e.displayName}</span>
                        </div>
                        <button id="${id}_auto"  data-eventname="${e.relevantEvents[0]}"  ${(omenInfo.task && omenInfo.task.includes(e.relevantEvents[0]))?'disabled':''}>自动做任务(${e.progressPercentage}%)</button>
                    </div>
                </li>
                `;
                return beauty;
            }
        }
        function loadChallengeList(id){
            OMEN.getChallengeList(omenInfo.sessionToken).then(res=>{
                jq("#omen-avaliable-list").empty();
                //console.log(res);
                let resp = res.response;
                console.log(resp)
                let list = resp.result.collection;
                let alreadyShow = [];

                list.forEach(item=>{
                    if(alreadyShow.includes(item.prize.campaignId))return;

                    alreadyShow.push(item.prize.campaignId);
                    let id = `${item.challengeStructureId}|${item.prize.campaignId}`
                    // jq("#omen-avaliable-list").append(`<li >${item.prize.displayName} - ${item.displayName}    <button id="${id}">参加</button></li>` )
                    jq("#omen-avaliable-list").append(genItem(item))
                    // 监听事件
                    document.getElementById(id).addEventListener("click", (e)=>{
                        let id = e.target.id.split("|");
                        OMEN.join(omenInfo.sessionToken, id[0], id[1]).then(res=>{
                            console.log(res)
                            if(res.status===200){
                                UI.addNotice("参加成功");
                                document.getElementById(e.target.id).parentElement.remove();
                            }else{
                                UI.addNotice("失败，详细信息在控制台");
                            }
                        }).catch(err=>{
                            const ep = err.response;
                            if(ep.error.code===707){
                                // 已参加
                                document.getElementById(e.target.id).parentElement.remove();
                                UI.addNotice(ep.error.message);
                            }
                        })
                    })
                })

            }).catch(err=>{
                console.log(err);
                const errD = err.response.error;
                if(errD.code===603&&errD.message === "Session is not valid"){
                    sessionTokenUpdate();
                }
            });
        }
        function loadCurrentList(){
            jq("#omen-current-list").empty();
            OMEN.currentList(omenInfo.sessionToken).then(res=>{
                let resp = res.response;
                console.log(resp)
                let list = resp.result.collection;

                list.forEach(item=>{
                    let id = `${item.challengeStructureId}|${item.prize.campaignId}`
                    // jq("#omen-current-list").append(`<li >${item.prize.displayName} - ${item.displayName} - 开始于${item.createdAt}  （${item.progressPercentage}% <button id="${id}_auto" data-eventname="${item.relevantEvents[0]}">自动做任务</button>` )
                    jq("#omen-current-list").append(genItem(item));
                    // 点击“自动执行”事件
                    document.getElementById(id + "_auto").addEventListener("click", (e)=>{
                        // addTask(`${omenInfo.sessionToken}|${e.target.dataset.eventname}|${omenInfo.email}`);
                        addTask({
                            eventName: e.target.dataset.eventname,
                            email: omenInfo.email
                        });
                        document.getElementById(id + "_auto").disabled = true;
                        TASK.resetInterval();
                        UI.addNotice("添加完毕");
                    })
                })
            }).catch(err=>{
                console.log(err);
                const errD = err.response.error;
                if(errD.code===603&&errD.message === "Session is not valid"){
                    sessionTokenUpdate();
                }
            });
        }
        function loadPrizeList(viewId){
            jq("#" + viewId +">.pending").empty();
            jq("#" + viewId +">.won").empty();
            jq("#" + viewId +">.other").empty();

            const prizeTypeHandle = (prize)=>{
                switch(prize.category){
                    case "sweepstake":
                        if(prize.drawing.state==="pending"){
                            jq("#" + viewId +">.pending").append(`<li>${prize.drawing.state}: [${prize.drawing.winner?"赢得":"未赢得"}] ${prize.displayName} - 开奖时间：${new Date(prize.drawing.drawDate).format("yyyy-MM-dd hh:mm:ss.S")}</li>`);
                        }else if(prize.drawing.state==="drawn"&&prize.drawing.winner){
                            // jq("#" + viewId +">.won").append(`<li>${prize.drawing.state}: [${prize.drawing.winner?"赢得":"未赢得"}] ${prize.displayName} - 开奖时间：${prize.drawing.drawDate}</li>`)
                        }else{
                            jq("#" + viewId +">.other").append(`<li>${prize.drawing.state}: [${prize.drawing.winner?"赢得":"未赢得"}] ${prize.displayName} - 开奖时间：${new Date(prize.drawing.drawDate).format("yyyy-MM-dd hh:mm:ss.S")}</li>`);
                        }
                        break;
                    case "sweepstake_prize":
                        {
                            const wonTime = new Date(prize.wonAt);
                            const today = new Date();
                            const isTodayWon = wonTime.getFullYear() === today.getFullYear() && wonTime.getMonth() === today.getMonth() && wonTime.getDate() === today.getDate();
                            let html = `<li ${isTodayWon?'style="color:red;"':''} title="${prize.displayRedemptionProcedure}">赢得：${prize.displayName} - 密钥：${prize.formattedToken.code||prize.formattedToken.token} - 时间：${new Date(prize.wonAt).format("yyyy-MM-dd hh:mm:ss.S")}`;
                            if(prize.formattedToken.url){
                                html += ` - 可能的兑换链接：<a href="${prize.formattedToken.url}" target="_blank">直达</a>`;
                            }
                            html += "</li>";
                            jq("#" + viewId +">.won").append(html);
                        }
                        break;
                    case "general":
                        if(prize.formattedToken.format === "text"){
                            jq("#" + viewId +">.won").append(`<li>赢得：${prize.displayName} - 密钥：${prize.formattedToken.token} - 时间：${new Date(prize.wonAt).format("yyyy-MM-dd hh:mm:ss.S")} </li>`)
                        }else if(prize.formattedToken.format === "code_and_url"){
                            jq("#" + viewId +">.won").append(`<li>赢得：${prize.displayName} - 密钥：${prize.formattedToken.code} - 时间：${new Date(prize.wonAt).format("yyyy-MM-dd hh:mm:ss.S")} - 兑换链接：<a href="${prize.formattedToken.url}" target="_blank">直达</a></li>`)
                        }
                        break;
                    default:
                        console.log("未知类型", prize);
                        break;
                }
            }
            const getList = (session, page)=>{
                return OMEN.prizeList(session, page).then(res=>{
                    let resp = res.response;
                    let collection = resp.result.collection;
                    console.log(collection)
                    collection.forEach(prizeTypeHandle)
                    if(resp.result.currentPageNumber<resp.result.totalPageCount){
                        return getList(session, resp.result.currentPageNumber+1)
                    }else{
                        // 页数遍历完毕
                        console.log("遍历完毕 - 当前页数 - ", resp.result.currentPageNumber)

                    }
                }).catch(err=>{
                    console.log(err);
                    const errD = err.response.error;
                    if(errD.code===603&&errD.message === "Session is not valid"){
                        sessionTokenUpdate();
                    }
                });
            }
            getList(omenInfo.sessionToken, 1);
        }
        function loadLog(vId){
            let log = sessionStorage.getItem("omenLog");
            jq("#omen-log-list > li:nth-child(2)").html(log);
            let logInt = setInterval(()=>{
                if(jq("#" + vId).css("display")==="none"){
                    clearInterval(logInt);
                    return;
                }
                let log = sessionStorage.getItem("omenLog");
                jq("#omen-log-list > li:nth-child(2)").html(log);

            }, 1000);
        }
        function accessTokenUpdate(force = false){
            if(omenInfo.auth.startTime + omenInfo.auth.expires_in <= parseInt(new Date().getTime()/1000) || force){
                jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = "AccessToken刷新中..."
                OMEN.refreshToken(omenInfo.auth.refresh_token).then(res=>{
                    console.log(res)
                    res = res.response;
                    if(res.status_code===undefined){
                        ACCOUNT.set({
                            auth: res,
                            email: omenInfo.email
                        })
                        jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = "AccessToken刷新成功"
                    }else{
                        jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = res.error_description
                    }
                }).catch(err=>{
                    console.log("accessTokenUpdate err", err);
                    jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = "如果看不懂后面一串，就重新登录 - " + err.error_description
                })
            }else{
                jq("#kl-tool-iframe .omen-tokenresult")[0].innerText = "AccessToken似乎在有效期内";
            }
        }
        function sessionTokenUpdate(){
            jq("#kl-tool-iframe .omen-sessionresult")[0].innerText = "更新中~";
            return OMEN.getSession(omenInfo.auth.access_token).then(res=>{
                console.log(res)
                if(res.status===200){
                    jq("#kl-tool-iframe .omen-sessionresult")[0].innerText = omenInfo.sessionToken = res.response.result.sessionId;
                    ACCOUNT.updateSession(res.response.result.sessionId);
                }else{
                    return Promise.reject(res.response.error_description);
                }
            }).catch(err=>{
                console.log("err", err)
                if(err.response && err.response.error){
                    jq("#kl-tool-iframe .omen-sessionresult")[0].innerText = `AccessToken可能过期了！请点击“刷新AccessToken”(${err.response.error.message})`;
                }else{
                    jq("#kl-tool-iframe .omen-sessionresult")[0].innerText = `AccessToken可能过期了！请点击“刷新AccessToken”`;
                }
            })
        }
        function changeArea(){
            jq("#omen-change-area-btn").click(e=>{
                const location = jq("#omen-change-area-data")[0].value;
                console.log(location);
                const val = location.split(",");
                if(val.length !== 2 || isNaN(val[0] + "") || isNaN(val[1] + "")){
                    alert("格式有误");
                    return ;
                }
                jq("#omen-change-area-result").text("");
                // 经度  维度
                OMEN.updateSession(omenInfo.sessionToken, parseFloat(val[0]), parseFloat(val[1]) ).then(res=>{
                    console.log(res)
                    const result = res.response.result;
                    jq("#omen-change-area-result").text(JSON.stringify(res.response, null, 2));
                    ACCOUNT.updateSession(result.sessionId);
                }).catch(err=>{
                    console.log(err)
                    jq("#omen-change-area-result").text(JSON.stringify(err.response, null, 2));
                    if(err.response.error.code===603){
                         sessionTokenUpdate();
                    }
                })
            })
        }

        function addTask(item){
            const task = omenAccount[item.email].task || [];
            if(task.indexOf(item.eventName) !== -1)return;

            task.push(item.eventName);
            omenAccount[item.email].task = task;
            const onceTask = [
                "Launch OMEN Command Center",
                "Use OMEN Command Center",
                "Use Omen Reactor",
                "Use Omen Photon",
                "Launch Game From GameLauncher",
                "Image like From ImageGallery",
                "Set as background From ImageGallery",
                "Download image From ImageGallery",
                "PLAY:OASIS"
            ];
            task.sort((a, b)=>{
                if(onceTask.includes(a)){
                    return -1;
                }
                if(onceTask.includes(b)){
                    return 1;
                }
                return 0;
            })
            GM_setValue("omenAccount", omenAccount);
        }
        function rmTask(item){
            const task = omenAccount[item.email].task || [];
            omenAccount[item.email].task = task.filter(e=>e!==item.eventName);
            GM_setValue("omenAccount", omenAccount);
        }
        function initTask(){
            TASK.add("omen");
            let pause = [false];
            TASK.addFunc(["omen", item1=>{
                const logArr = ["<li><hr></li>"+ (sessionStorage.getItem("omenLog") || "")];

                for(let email in omenAccount){
                    const session = omenAccount[email].sessionToken;
                    const task = omenAccount[email].task;
                    if(task === undefined || task.length === 0)continue;

                    const eventName = task[0];

                    // 列表查询，不管是否暂停都执行
                    let count = 0;
                    const tempInterval = setInterval(session=>{
                        count++;
                        OMEN.currentList(session).then(res=>{
                            let resp = res.response;
                            console.log("list请求", resp)
                        })
                        if(count>5)clearInterval(tempInterval);
                    }, 5*1000, session);

                    // 暂停执行一轮
                    if(pause[0])continue;

                    console.log("try to run omen task", `${email} - task`);

                    // item - SESSION|EventName|email|type|param
                    OMEN.currentList(session).then(res=>{
                        return OMEN.doIt(session, eventName, 0.5);
                    }).then(res=>{
                        console.log(res);
                        const resp = res.response;
                        let result = resp.result;
                        if(result.length === 0){
                            rmTask({
                                email,
                                eventName
                            });
                            logArr[0] = `<li>${email} - 疑似触发风控(⊙ˍ⊙)${eventName}</li>` + logArr[0];
                        }else{
                            logArr[0] = `<li>${email} - 奖品：${result[0].prize.displayName} - 任务：${result[0].displayName} - 进度： ${result[0].progressPercentage}%</li>` + logArr[0];
                            if(result[0].progressPercentage===100){
                                // 暂停一轮
                                pause[0] = true;

                                // 完成任务
                                rmTask({
                                    email,
                                    eventName
                                });

                                GM_notification({
                                    text: `${email} - 奖品：${result[0].prize.displayName} - 任务：${result[0].displayName} - 进度： ${result[0].progressPercentage}%`,
                                    title: "Omen脚本通知",
                                    image: "",
                                    highlight: true,
                                    silent: false,
                                    timeout: 5,
                                    ondone: (e)=>{
                                        console.log("ondone", e)
                                    },
                                    onclick: (e)=>{
                                        console.log("onclick", e)
                                    }
                                })
                            }
                        }
                        sessionStorage.setItem("omenLog", logArr[0]);
                        OMEN.currentList(session).then(res=>{
                            let resp = res.response;
                            console.log(resp)
                        })

                    }).catch(err=>{
                        rmTask({
                            email,
                            eventName
                        });
                        console.log("err", err);
                        if(err.response && err.response.error && err.response.error.message === "Session is not valid"){
                            GM_notification({
                                text: "SESSION过期",
                                title: "Omen脚本通知",
                                highlight: true,
                                silent: false,
                                timeout: 3,
                            })
                            jq("#omen-log-list > li:nth-child(2)").before(`<li>${email} SESSION过期</li>`)
                        }else{
                            jq("#omen-log-list > li:nth-child(2)").before(`<li>${email} 未知错误${err}</li>`)
                        }
                    })
                }

                // 撤销暂停
                if(pause[0] === true){
                    pause[0] = false;
                    return;
                }
            }])
        }
        return {
            init: init
        }
    })();
    const OMEN = (()=>{
        const getToken = (code)=>{
            let url = "https://oauth.hpbp.io/oauth/v1/token";
            let json = OMEN_BODY.auth(code);
            let params = Object.keys(json).map(function (key) {
                // body...
                return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
            }).join("&");

            return HTTP.POST(url, {
                dataType: "json",
                data: params,
                headers: {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)",
                    "Accept": "application/json",
                    "Except": "100-continue"
                }
            })
        }
        const refreshToken = (refresh_token)=>{
            let url = "https://oauth.hpbp.io/oauth/v1/token";
            let json = OMEN_BODY.refreshToken(refresh_token);
            let params = Object.keys(json).map(function (key) {
                // body...
                return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
            }).join("&");

            return HTTP.POST(url, {
                dataType: "json",
                data: params,
                headers: {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)",
                    "Accept": "application/json",
                    "Except": "100-continue"
                }
            })
        }
        const getSession = (authorization)=>{
            let url = "https://www.hpgamestream.com/api/thirdParty/session/temporaryToken?applicationId=" + ApplicationId
            return HTTP.GET(url, {
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + authorization
                }
            }).then(res=>{
                console.log(res)
                if(res.status===200){

                    return RPCRequest(OMEN_BODY.handShake(res.response.token))
                }else{
                    return Promise.reject(res)
                }
            }).then(res=>{
                console.log(res)
                res = res.response;
                return RPCRequest(OMEN_BODY.start(res.result.token, res.result.players[0].externalPlayerId));
            })
        }
        const getUserinfo =(authorization)=>{
            // https://api.hpbp.io/user/v1/users/me
            let url = "https://api.hpbp.io/user/v1/users/me"
            return HTTP.GET(url, {
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + authorization,
                    "X-HPBP-Tenant-ID": "omencc-prod"
                }
            })
        }
        const getChallengeList = (session)=>{
            return RPCRequest(OMEN_BODY.challengeList(session))
        }
        const join = (session, challengeStructureId, campaignId)=>{
            return RPCRequest(OMEN_BODY.join(session, challengeStructureId, campaignId));
        }
        const currentList = (session)=>{
            return RPCRequest(OMEN_BODY.current(session));
        }
        const doIt = (session, eventName, time)=>{
            return RPCRequest(OMEN_BODY.doIt(session, eventName, time))
        }
        const prizeList = (session, page=1)=>{
            return RPCRequest(OMEN_BODY.prize(session, page));
        }
        const updateSession = (session, longitude, latitude) => {
            return RPCRequest(OMEN_BODY.updateSession(session, latitude, longitude))
        }
        const RPCRequest = (params) => {
            return HTTP.POST("https://rpc-prod.versussystems.com/rpc", {
                dataType: "json",
                data: JSON.stringify(params),
                headers: {
                    "content-type": "application/json; charset=UTF-8",
                    "User-Agent": ""
                }
            }).then(res=>{
                if(res.response.error)return Promise.reject(res);
                else return Promise.resolve(res);
            })
        }

        return {
            getToken:getToken,
            refreshToken: refreshToken,
            getSession: getSession,
            getUserinfo: getUserinfo,
            getChallengeList: getChallengeList,
            join: join,
            currentList: currentList,
            doIt: doIt,
            prizeList: prizeList,
            updateSession
        }
    })();
    const OMEN_BODY = (()=>{

        const basic = {
            "jsonrpc": "2.0",
            "method": null,
            "id": ApplicationId,
            "params": {
                "sessionToken": null,
                "applicationId": ApplicationId,
                "sdk": "custom01",
                "sdkVersion": "3.0.0",
                "appDefaultLanguage": "en",
                "userPreferredLanguage": "en"
            }
        }
        const auth = (code)=>{
            return {
                grant_type: "authorization_code",
                code: code,
                client_id: ClientId,
                redirect_uri: "http://localhost:9080/login"
            }
        }

        const refreshToken = (refresh_token)=>{
            return {
                grant_type: "refresh_token",
                refresh_token: refresh_token,
                client_id: ClientId,
            }
        }
        const handShake = (token)=>{
            let body = JSON.parse(JSON.stringify(basic));
            body.method = "mobile.accounts.v1.handshake";
            body.params.userToken = token;
            body.params.Birthdate = "2001-01-02";
            body.params.page = 1;
            body.params.pageSize = 10;
            return body;
        }
        const start = (token, externalPlayerId)=>{

            //let uinfo = JSON.parse(window.atob(omenAuth.access_token.split(".")[1]))
            //body.params.accountToken = token;
            //body.params.externalPlayerId = uinfo.hpid_user_id;
            return {
                "jsonrpc": "2.0",
                "id": ApplicationId,
                "method": "mobile.sessions.v2.start",
                "params": {
                    "accountToken": token,
                    "applicationId": ApplicationId,
                    "externalPlayerId": externalPlayerId,
                    "eventNames": [
                        "PLAY:OVERWATCH",
                        "PLAY:HEROES_OF_THE_STORM",
                        "PLAY:FORTNITE",
                        "PLAY:THE_DIVISION",
                        "PLAY:THE_DIVISION_2",
                        "PLAY:PUBG",
                        "PLAY:APEX_LEGENDS",
                        "PLAY:CS_GO",
                        "PLAY:LEAGUE_OF_LEGENDS",
                        "PLAY:DOTA_2",
                        "PLAY:SMITE",
                        "PLAY:AGE_OF_EMPIRES_2",
                        "PLAY:STARCRAFT_2",
                        "PLAY:COMPANY_OF_HEROES_2",
                        "PLAY:ASSASSINS_CREED_ODYSSEY",
                        "PLAY:WORLD_OF_WARCRAFT",
                        "PLAY:WORLD_OF_WARCRAFT_CLASSIC",
                        "PLAY:SPOTIFY",
                        "PLAY:RINGS_OF_ELYSIUM",
                        "PLAY:HEARTHSTONE",
                        "PLAY:GARRYS_MOD",
                        "PLAY:GOLF_IT",
                        "PLAY:DECEIT",
                        "PLAY:SEVEN_DAYS_TO_DIE",
                        "PLAY:DOOM_ETERNAL",
                        "PLAY:STARWARS_JEDI_FALLEN_ORDER",
                        "PLAY:MINECRAFT",
                        "PLAY:DEAD_BY_DAYLIGHT",
                        "PLAY:NETFLIX",
                        "PLAY:HULU",
                        "PLAY:PATH_OF_EXILE",
                        "PLAY:WARTHUNDER",
                        "PLAY:CALL_OF_DUTY_MODERN_WARFARE",
                        "PLAY:ROCKET_LEAGUE",
                        "PLAY:NBA_2K20",
                        "PLAY:STREET_FIGHTER_V",
                        "PLAY:DRAGON_BALL_FIGHTER_Z",
                        "PLAY:GEARS_OF_WAR_5",
                        "PLAY:FIFA_20",
                        "PLAY:MASTER_CHIEF_COLLECTION",
                        "PLAY:RAINBOW_SIX",
                        "PLAY:UPLAY",
                        "PLAY:ROBLOX",
                        "VERSUS_GAME_API:TEAMFIGHT_TACTICS:GOLD_LEFT",
                        "VERSUS_GAME_API:TEAMFIGHT_TACTICS:TIME_ELIMINATED",
                        "VERSUS_GAME_API:TEAMFIGHT_TACTICS:THIRD_PLACE_OR_HIGHER",
                        "VERSUS_GAME_API:TEAMFIGHT_TACTICS:SECOND_PLACE_OR_HIGHER",
                        "VERSUS_GAME_API:TEAMFIGHT_TACTICS:PLAYERS_ELIMINATED",
                        "VERSUS_GAME_API:TEAMFIGHT_TACTICS:TOTAL_DAMAGE_TO_PLAYERS",
                        "PLAY:MONSTER_HUNTER_WORLD",
                        "PLAY:WARFRAME",
                        "PLAY:LEGENDS_OF_RUNETERRA",
                        "PLAY:VALORANT",
                        "PLAY:CROSSFIRE",
                        "PLAY:PALADINS",
                        "PLAY:TROVE",
                        "PLAY:RIFT",
                        "PLAY:ARCHEAGE",
                        "PLAY:IRONSIGHT",
                        "GAMIGO_PLACEHOLDER",
                        "PLAY:TWINSAGA",
                        "PLAY:AURA_KINGDOM",
                        "PLAY:SHAIYA",
                        "PLAY:SOLITAIRE",
                        "PLAY:TONY_HAWK",
                        "PLAY:AVENGERS",
                        "PLAY:FALL_GUYS",
                        "PLAY:QQ_SPEED",
                        "PLAY:FIFA_ONLINE_3",
                        "PLAY:NBA2KOL2",
                        "PLAY:DESTINY2",
                        "PLAY:AMONG_US",
                        "PLAY:MAPLE_STORY",
                        "PLAY:ASSASSINS_CREED_VALHALLA",
                        "PLAY:FREESTYLE_STREET_BASKETBALL",
                        "PLAY:CRAZY_RACING_KART_RIDER",
                        "PLAY:COD_BLACK_OPS_COLD_WAR",
                        "PLAY:CYBERPUNK_2077",
                        "PLAY:HADES",
                        "PLAY:RUST",
                        "PLAY:GENSHIN_IMPACT",
                        "PLAY:ESCAPE_FROM_TARKOV",
                        "PLAY:RED_DEAD_REDEMPTION_2",
                        "PLAY:CIVILIZATION_VI",
                        "PLAY:VALHEIM",
                        "PLAY:FINAL_FANTASY_XIV",
                        "PLAY:OASIS",
                        "PLAY:CASTLE_CRASHERS",
                        "PLAY:GANG_BEASTS",
                        "PLAY:SPEEDRUNNERS",
                        "PLAY:OVERCOOKED_2",
                        "PLAY:OVERCOOKED_ALL_YOU_CAN_EAT",
                        "PLAY:BRAWLHALLA",
                        "PLAY:STELLARIS",
                        "PLAY:MOUNT_AND_BLADE",
                        "PLAY:EUROPA_UNIVERSALIS",
                        "PLAY:ELDER_SCROLLS_ONLINE",
                        "Launch OMEN Command Center",
                        "Use OMEN Command Center",
                        "OMEN Command Center Macro Created",
                        "OMEN Command Center Macro Assigned",
                        "Mindframe Adjust Cooling Option",
                        "Connect 2 different OMEN accessories to your PC at the same time",
                        "Use Omen Reactor",
                        "Use Omen Photon",
                        "Launch Game From GameLauncher",
                        "Image like From ImageGallery",
                        "Set as background From ImageGallery",
                        "Download image From ImageGallery",
                        "CLAIM:PRIZE",
                        "overwatch",
                        "heroesofthestorm",
                        "heroesofthestorm_x64",
                        "FortniteClient-Win64-Shipping",
                        "FortniteClient-Win64-Shipping_BE",
                        "thedivision",
                        "thedivision2",
                        "TslGame",
                        "r5apex",
                        "csgo",
                        "League of Legends",
                        "dota2",
                        "smite",
                        "AoE2DE_s",
                        "AoK HD",
                        "AoE2DE",
                        "sc2",
                        "s2_x64",
                        "RelicCoH2",
                        "acodyssey",
                        "wow",
                        "wow64",
                        "wow_classic",
                        "wowclassic",
                        "Spotify",
                        "Europa_client",
                        "hearthstone",
                        "hl2",
                        "GolfIt-Win64-Shipping",
                        "GolfIt",
                        "Deceit",
                        "7DaysToDie",
                        "DoomEternal_temp",
                        "starwarsjedifallenorder",
                        "Minecraft.Windows",
                        "net.minecraft.client.main.Main",
                        "DeadByDaylight-Win64-Shipping",
                        "4DF9E0F8.Netflix",
                        "HuluLLC.HuluPlus",
                        "PathOfExileSteam",
                        "PathOfExile_x64Steam",
                        "aces",
                        "modernwarfare",
                        "RocketLeague",
                        "NBA2K20",
                        "StreetFighterV",
                        "RED-Win64-Shipping",
                        "Gears5",
                        "fifa20",
                        "MCC-Win64-Shipping",
                        "MCC-Win64-Shipping-WinStore",
                        "RainbowSix",
                        "RainbowSix_BE",
                        "RainbowSix_Vulkan",
                        "upc",
                        "ROBLOXCORPORATION.ROBLOX",
                        "RobloxPlayerBeta",
                        "VERSUS_GAME_API_TEAMFIGHT_TACTICS_GOLD_LEFT",
                        "VERSUS_GAME_API_TEAMFIGHT_TACTICS_TIME_ELIMINATED",
                        "VERSUS_GAME_API_TEAMFIGHT_TACTICS_THIRD_PLACE_OR_HIGHER",
                        "VERSUS_GAME_API_TEAMFIGHT_TACTICS_SECOND_PLACE_OR_HIGHER",
                        "VERSUS_GAME_API_TEAMFIGHT_TACTICS_PLAYERS_ELIMINATED",
                        "VERSUS_GAME_API_TEAMFIGHT_TACTICS_TOTAL_DAMAGE_TO_PLAYERS",
                        "MonsterHunterWorld",
                        "Warframe.x64",
                        "lor",
                        "valorant-Win64-shipping",
                        "valorant",
                        "crossfire",
                        "Paladins",
                        "trove",
                        "rift_64",
                        "rift_x64",
                        "archeage",
                        "ironsight",
                        "Game",
                        "Game.bin",
                        "glyph_twinsaga",
                        "glyph_aurakingdom",
                        "glyph_shaiya",
                        "Solitaire",
                        "THPS12",
                        "avengers",
                        "Fallguys_client_game",
                        "GameApp",
                        "fifazf",
                        "NBA2KOL2",
                        "destiny2",
                        "Among Us",
                        "MapleStory",
                        "ACValhalla",
                        "FreeStyle",
                        "KartRider",
                        "BlackOpsColdWar",
                        "Cyberpunk2077",
                        "Hades",
                        "RustClient",
                        "GenshinImpact",
                        "EscapeFromTarkov",
                        "EscapeFromTarkov_BE",
                        "RDR2",
                        "CivilizationVI",
                        "valheim",
                        "ffxiv_dx11",
                        "AD2F1837.OMENSpectate",
                        "castle",
                        "Gang Beasts",
                        "SpeedRunners",
                        "Overcooked2",
                        "Overcooked All You Can Eat",
                        "Brawlhalla",
                        "stellaris",
                        "TaleWorlds.MountAndBlade.Launcher",
                        "eu4",
                        "eso64"
                    ],
                    "location": {
                        "latitude": 39.914714,
                        "longitude": 116.402544
                    },
                    "sdk": "custom01",
                    "sdkVersion": "3.0.0",
                    "appDefaultLanguage": "en",
                    "userPreferredLanguage": "en"
                }
            };
        }

        const challengeList = (session)=>{
            let body = JSON.parse(JSON.stringify(basic));
            body.method = "mobile.challenges.v4.list";
            body.params.sessionToken = session;
            body.params.onlyShowEligibleChallenges = true;
            body.params.page = 1;
            body.params.pageSize = 10;
            return body;
        }
        const join = (session, challengeStructureId, campaignId)=>{
            let body = JSON.parse(JSON.stringify(basic));
            body.method = "mobile.challenges.v2.join";
            body.params.sessionToken = session;
            body.params.challengeStructureId = challengeStructureId;
            body.params.campaignId = campaignId;
            body.params.timezone = "China Standard Time"
            return body;
        }
        const current = (session)=>{
            let body = JSON.parse(JSON.stringify(basic));
            body.method = "mobile.challenges.v2.current";
            body.params.sessionToken = session;
            body.params.page = 1;
            body.params.pageSize = 10;
            return body;
        }
        const doIt = (session, eventName, time)=>{
            let body = JSON.parse(JSON.stringify(basic));
            body.method = "mobile.challenges.v2.progressEvent";

            body.params.sessionToken = session;
            const timeObj = doIt_getTime(time)
            body.params.startedAt = timeObj.startedAt;
            body.params.endedAt = timeObj.endedAt;
            body.params.eventName = eventName;
            body.params.value = 1
            body.params.signature = new Signature(body).getSignature()
            return body;
        }
        const doIt_getTime = (time)=>{
            const endTime = new Date();
            const endMils = endTime.getTime();
            const startMils = endMils - 1000 * 60 * time;
            const startTime = new Date(startMils);
            return {
                startedAt: startTime.toISOString(),
                endedAt: endTime.toISOString(),
            };
        }

        const prize = (session, page=1)=>{
            let body = JSON.parse(JSON.stringify(basic));
            body.method = "mobile.prizes.v2.list";
            body.params.sessionToken = session;
            body.params.page = page;
            body.params.pageSize = 10;
            return body;
        }
        const updateSession = (session, latitude, longitude)=>{
            let body = JSON.parse(JSON.stringify(basic));
            body.method = "mobile.sessions.v1.update";
            body.params.token = session;
            body.params.location = {
                latitude,
                longitude
            };
            return body;
        }

        class Signature {
            constructor(b) {
                this.body = b;
            }
            UUIDtoByteArray(uuid) {
                const text = uuid.replace(/-/g, "");
                const num = text.length / 2;
                const array = new Uint8Array(num);
                for (let i = 0; i < num; i += 1) {
                    const substring = text.substring(i * 2, i * 2 + 2);
                    if (substring.length === 0) {
                        array[i] = 0;
                    } else {
                        array[i] = parseInt(substring, 16);
                    }
                }
                return array;
            }
            getSignature() {
                const array = this.UUIDtoByteArray(this.body.params.applicationId);
                const array2 = this.UUIDtoByteArray(this.body.params.sessionToken);
                const array3 = new Uint8Array(16);
                for (let i = 0; i < 16; i += 1) {
                    if (i < 8) {
                        array3[i] = array[i * 2 + 1];
                    } else {
                        array3[i] = array2[(i - 8) * 2];
                    }
                }
                const text = this.getSignableText();
                const sign = sha256.hmac(array3, text);
                return this.arrayBufferToBase64(sign);
            }
            getSignableText() {
                const text = this.body.params.eventName + this.body.params.startedAt
                    + this.body.params.endedAt + this.body.params.value;
                // const buf = Buffer.from(text, "utf8");
                // const array = new Uint8Array(buf.length);
                // for (let index = 0; index < buf.length; index += 1) {
                //     array[index] = buf[index];
                // }
                return this.stringToByte(text);
            }
            arrayBufferToBase64(array) {
                array = new Uint8Array(array);
                var length = array.byteLength;
                var table = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
                    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
                    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
                    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
                    'w', 'x', 'y', 'z', '0', '1', '2', '3',
                    '4', '5', '6', '7', '8', '9', '+', '/'];
                var base64Str = '';
                for (var i = 0; length - i >= 3; i += 3) {
                    var num1 = array[i];
                    var num2 = array[i + 1];
                    var num3 = array[i + 2];
                    base64Str += table[num1 >>> 2]
                        + table[((num1 & 0b11) << 4) | (num2 >>> 4)]
                        + table[((num2 & 0b1111) << 2) | (num3 >>> 6)]
                        + table[num3 & 0b111111];
                }
                var lastByte = length - i;
                let lastNum1;
                if (lastByte === 1) {
                    lastNum1 = array[i];
                    base64Str += table[lastNum1 >>> 2] + table[((lastNum1 & 0b11) << 4)] + '==';
                } else if (lastByte === 2) {
                    lastNum1 = array[i];
                    var lastNum2 = array[i + 1];
                    base64Str += table[lastNum1 >>> 2]
                        + table[((lastNum1 & 0b11) << 4) | (lastNum2 >>> 4)]
                        + table[(lastNum2 & 0b1111) << 2]
                        + '=';
                }
                return base64Str;
            }
            stringToByte(str) {
                var len, c;
                len = str.length;
                var bytes = [];
                for (var i = 0; i < len; i++) {
                    c = str.charCodeAt(i);
                    if (c >= 0x010000 && c <= 0x10FFFF) {
                        bytes.push(((c >> 18) & 0x07) | 0xF0);
                        bytes.push(((c >> 12) & 0x3F) | 0x80);
                        bytes.push(((c >> 6) & 0x3F) | 0x80);
                        bytes.push((c & 0x3F) | 0x80);
                    } else if (c >= 0x000800 && c <= 0x00FFFF) {
                        bytes.push(((c >> 12) & 0x0F) | 0xE0);
                        bytes.push(((c >> 6) & 0x3F) | 0x80);
                        bytes.push((c & 0x3F) | 0x80);
                    } else if (c >= 0x000080 && c <= 0x0007FF) {
                        bytes.push(((c >> 6) & 0x1F) | 0xC0);
                        bytes.push((c & 0x3F) | 0x80);
                    } else {
                        bytes.push(c & 0xFF);
                    }
                }
                return new Uint8Array(bytes);
            }
        }

        return {
            auth: auth,
            refreshToken: refreshToken,
            challengeList: challengeList,
            handShake: handShake,
            start: start,
            join: join,
            current: current,
            doIt: doIt,
            prize: prize,
            updateSession
        }
    })();

    // LOOTBOY
    const LootBoy_UI = (()=>{

        const init = ()=>{
            UI.addAction({
                id: "lootboy-module",
                text: "LootBoy"
            });
            document.getElementById("lootboy-module").addEventListener("click", ()=>{
                console.log("点击LOOTBOY");
                initUI();
                event();
            });
            event();
            initTask();
        }
        function initUI(){
            UI.initFrameContent(`
            <h2>LOOTBOY（测试阶段）</h2>
                <a id="lootBoy-getToken" href="https://www.lootboy.de/daily?KLTOOL=1" target="_blank">获取TOKEN</a><span id="lootBoy-getToken-Text" style="margin-left:1rem;color:red;"></span>
                <br />
                <ul>
                    <li>领硬币：<span id="lootboy-coin">等待中...</span></li>
                    <li>领钻石：<span id="lootboy-dia">等待中...</span></li>
                </ul>
                <br />
                <button id="lootboy-auto-btn">${TASK.exist("lootboy")?"关闭":"开启"}自动获取</button>
            `)
            jq("#lootBoy-getToken-Text").text("检查TOKEN...");
            LootBoy.checkToken().then(res=>{
                console.log(res)
                if(res.status === 200){
                    jq("#lootBoy-getToken-Text").text(`正常 - ${res.response.displayName}`);
                    doTask();
                    console.log("OK")
                }else{
                    jq("#lootBoy-getToken-Text").text("错误，请尝试重新获取");
                    console.log("ERROR")
                }
            })
        }
        function event(){
            jq("#lootBoy-getToken").click(e=>{
                jq("#lootBoy-getToken-Text").text("重新获取TOKEN...");
                const startTime = parseInt(new Date().getTime()/1000);
                let getToken= setInterval(()=>{

                    let lb = GM_getValue("LootBoy") || {};

                    if(lb.updateTime > startTime){
                        LootBoy.refreshData(lb);
                        initUI();
                        clearInterval(getToken);
                    }
                }, 1000);
            });

             jq("#lootboy-auto-btn").click(e=>{
                 if(TASK.exist("lootboy")){
                     TASK.rm("lootboy");
                     jq("#lootboy-auto-btn").text("开启自动获取");
                 }else{
                     TASK.add("lootboy");
                     jq("#lootboy-auto-btn").text("关闭自动获取");
                 }
             });
        }
        function doTask(){
            jq("#lootboy-coin").text("获取硬币...")
            LootBoy.getCoin().then(res=>{
                let resp = res.response;
                console.log("getCoin", resp);
                if(resp.gotBonus === true){
                    jq("#lootboy-coin").text("得到硬币 - " + resp.lootcoinBonus);
                }else{
                    jq("#lootboy-coin").text(`已经在${resp.lastAppStartBonus}领过硬币，下一次领取时间： - ${resp.tryAgainAt}`);
                }
            })

            jq("#lootboy-dia").text("获取钻石...")
            LootBoy.getDia().then(res=>{
                let resp = res.response;
                console.log("getDia", resp);
                if(resp.alreadyTaken){
                    jq("#lootboy-dia").text(`已经领过钻石`);
                }else{
                    jq("#lootboy-dia").text(`领到钻石 - ${resp.offer.diamondBonus}个`);
                }
            })
        }

        function initTask(){
            TASK.addFunc(["lootboy", doTask]);
        }
        return {
            init: init
        }
    })();
    const LootBoy = (()=>{
        let data = GM_getValue("LootBoy") || {};

        const checkToken = (token = data.token)=>{
            return HTTP.GET(`https://api.lootboy.de/v2/users/${data.id}`, {
                headers: {
                    authorization: "Bearer " + token,
                    referer: "https://www.lootboy.de/",
                    "content-type": "application/json"
                },
                dataType: "json"
            })
        }
        const getCoin = ()=>{
            return HTTP.PUT("https://api.lootboy.de/v2/users/self/appStart", {
                headers: {
                    authorization: "Bearer " + data.token,
                    referer: "https://www.lootboy.de/",
                    "content-type": "application/json"
                },
                dataType: "json"
            })
        }
        const getDia = ()=>{
            return HTTP.PUT(`https://api.lootboy.de/v1/offers/5bb1e263dc11a3001b4e7b14?lang=en`, {
                headers: {
                    authorization: "Bearer " + data.token,
                    referer: "https://www.lootboy.de/",
                    "content-type": "application/json"
                },
                dataType: "json"
            })
        }
        const updateInfo = (info)=>{
            data.token = info.token;
            data.id = info.id;
            data.updateTime = parseInt(new Date().getTime()/1000);
            GM_setValue("LootBoy", data);
        }
        const refreshData = (lb = GM_getValue("LootBoy"))=>{
            data = lb || {};
        }
        return {
            checkToken: checkToken,
            updateInfo: updateInfo,
            refreshData: refreshData,
            getCoin: getCoin,
            getDia: getDia
        }
    })();

    // SteelSeries
    const SS_UI = (()=>{
        const init = ()=>{
            UI.addAction({
                id: "SteelSeries-module",
                text: "SteelSeries"
            });
            document.getElementById("SteelSeries-module").addEventListener("click", ()=>{
                console.log("点击SteelSeries");
                initUI();
                event();
            });
            initTask();
        }
        const initUI = ()=>{
            UI.initFrameContent(`
                <h2>SteelSeries游戏列表（测试阶段）：</h2>
                <h3 style="color:#d80b0b;">请确认该链接能够正常访问：<a href="https://api.igsp.io/promotions" target="_blank">https://api.igsp.io/promotions</a></h3>
                <ul id="ss_game_list">
                </ul>
                <style>
                #ss_game_list{
                    overflow-y: scroll;
                    height: 50vh;
                    margin: 11px;
                    border: 1px solid red;
                    padding: 10px;
                }
                </style>
            `);
            SteelSeries.getList().then(res=>{
                const resp = res.response;
                // console.log(resp);
                let list = jq("#ss_game_list");
                for(let item of resp){
                    console.log(item);
                    if(!item.published){
                        list.append(`<li>${item.id} - ${item.title} - 剩余：${item.percentRemaining}% - <a href="https://games.steelseries.com/giveaway/${item.id}/details" target="_blank" >查看页面</a>&nbsp;&nbsp;<button id="ss_${item.id}" data-id="${item.id}">${TASK.exist(`SteelSeries|${item.id}`)?"删除":"添加"}提醒</button></li>`);
                        jq("#ss_" + item.id).click(e=>{
                            console.log(e);
                            let target = e.target;
                            const id = target.dataset.id;
                            let name = `SteelSeries|${id}`;
                            if(!TASK.exist(name)){
                                TASK.add(`SteelSeries|${id}`);
                                target.innerText = "删除提醒";
                            }else{
                                TASK.rm(`SteelSeries|${id}`);
                                target.innerText = "添加提醒";
                            }
                        })
                    }
                }
            })
        }
        function event(){

        }
        function initTask(){
            const data = [0, []];
            const check = (list, e)=>{
                let info = e.split("|");
                for(let item of list){
                    if(item.id === parseInt(info[1]) && item.percentRemaining>0){
                        TASK.rm(e);
                        console.log("start");

                        // GM_openInTab("https://games.steelseries.com/giveaway/"+info[1]+"/details");
                        GM_notification({
                            text: "发key",
                            title: "发key",
                            highlight: true,
                            silent: false,
                            timeout: 3,
                            onclick: ()=>{
                                GM_openInTab("https://games.steelseries.com/giveaway/"+info[1]+"/details");
                            }
                        })
                        return;
                    }
                }
            }
            TASK.addFunc(["SteelSeries", e=>{
                /*
                    使用上一次数据来进行判断
                */
                console.log(e);
                const nowTime = parseInt(new Date().getTime()/1000);
                console.log("now", nowTime);
                console.log("data0", data[0]);
                check(data[1], e);
                if(data[0] + 20 < nowTime){
                    data[0] = nowTime;
                    SteelSeries.getList().then(res=>{
                        const resp = res.response;
                        data[1] = resp;
                        check(resp, e);
                    });
                }
            }])

        }
        return {
            init: init
        }
    })();
    const SteelSeries = (()=>{

        const getList = ()=>{
            return HTTP.GET("https://api.igsp.io/promotions", {
                dataType: "json"
            })
        }
        return {
            getList: getList
        }
    })();

    // KeyLol
    const KL_UI = (()=>{
        // const keylolPureKeyWord = JSON.parse(localStorage.getItem("keylolPureKeyWord") || JSON.stringify(["孝子"]));
        const init = ()=>{
            // if(TASK.exist("keylolpure"))pureAction();
            UI.addAction({
                id: "keylol-module",
                text: "KeyLol"
            });
            document.getElementById("keylol-module").addEventListener("click", ()=>{
                console.log("点击KeyLol");
                initUI();
                // event();
            });
            initTask();
        }
        function initUI(){
            UI.initFrameContent(`
            <div>
            抽奖提醒，分享互赠&nbsp;<button id="keylol-loot-notice-btn">${TASK.exist("keylol")?"关闭提醒":"开启提醒"}</button><br />
            <hr />
            <!--青少年模式&nbsp;<button id="keylol-loot-pure-btn">${TASK.exist("keylolpure")?"关闭":"开启"}</button><br />-->
            </div>
            `);
            jq("#keylol-loot-notice-btn").click(e=>{
                console.log(e);
                if(TASK.exist("keylol")){
                    TASK.rm("keylol");
                    e.target.innerText = "开启提醒";
                }else{
                    TASK.add("keylol");
                    e.target.innerText = "关闭提醒";
                }
            })
            jq("#keylol-loot-pure-btn").click(e=>{
                console.log(e);
                if(TASK.exist("keylolpure")){
                    TASK.rm("keylolpure");
                    e.target.innerText = "开启";
                }else{
                    TASK.add("keylolpure");
                    e.target.innerText = "关闭";
                    //pureAction();
                }
            })
        }
        /*
        function pureAction(){
            const api = "https://github.com";
            const wp = jq("#wp");
            let html = wp.html();
            for(let key of keylolPureKeyWord){
                html = html.replaceAll(key, "***");
            }
            wp.html(html);
            return;
            HTTP.GET(api).then(res=>{
                const resp = res.response;
                keylolPureKeyWord.push(resp);
            })
        }*/
        function initTask(){
            TASK.addFunc(["keylol", ()=>{
                // 官方抽奖活动
                HTTP.GET("https://keylol.com/forum.php?mod=forumdisplay&fid=161&orderby=dateline&filter=dateline&dateline=86400&orderby=dateline&typeid=458")
                .then(notice)
                // 分享互赠
                HTTP.GET("https://keylol.com/forum.php?mod=forumdisplay&fid=254&orderby=lastpost&filter=dateline&dateline=86400")
                .then(notice)
            }]);
            // TASK.addFunc(["keylol", pureAction]);
        }
        function notice(res){
            let history = JSON.parse(localStorage.getItem("klNoticeHistory") || "{}");
            const html = res.responseText;
            const result = html.replaceAll("\n", "").match(/id="normalthread(.*?)<\/tbody>/g);
            const today = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`;
            if((history[today] === undefined || history[today].length === 0)){
                history = {};
                history[today] = [];
            }
            for(let item of result){
                const date = item.match(/\d+-\d+-\d+/)[0];
                const tid = item.match(/tid=(\d+)&/)[1];
                const title = item.match(/class="s xst">(.*?)</)[1];
                const url = "https://keylol.com/t" + tid + "-1-1";
                // const time = item.match(/-\d+">(.*?)<\/span> 发表/)[1].replace("&nbsp;", "");
                if(date === today && history[today].indexOf(title) === -1){
                    // 当天   未提醒
                    history[today] = history[today] || [];
                    history[today].push(title);
                    GM_notification({
                        text: "点击进入",
                        title: title,
                        highlight: false,
                        silent: false,
                        timeout: 3,
                        onclick: ()=>{
                            GM_openInTab(url);
                        }
                    })
                }
            }
            localStorage.setItem("klNoticeHistory", JSON.stringify(history));
        }
        return {
            init
        }
    })();

    // Alien
    const AW_UI = (()=>{
        const init = ()=>{
            UI.addAction({
                id: "Alienware-module",
                text: "Alienware"
            });
            document.getElementById("Alienware-module").addEventListener("click", ()=>{
                console.log("点击Alienware");
                initUI();
                event();
            });
            initTask();
        }
        const initUI = ()=>{
            UI.initFrameContent(`
                <h2>Alienware游戏列表（测试阶段）：</h2>
                <h3 style="color:#d80b0b;">请确认该链接能够正常访问：<a href="https://na.alienwarearena.com/esi/featured-tile-data/Giveaway" target="_blank">https://na.alienwarearena.com/esi/featured-tile-data/Giveaway</a></h3>
                <br>
                新增提醒：<button id="aw_sub_btn">${TASK.exist("Alienware")?"关闭":"开启"}</button>
                <table>
                    <thead>
                        <tr><td>ID</td><td>名称</td><td>开始时间</td><td>直达链接</td></tr>
                    </thead>
                    <tbody id="aw_game_list"></tbody>
                </table>
                <style>
                #aw_game_list{
                    overflow-y: scroll;
                    height: 50vh;
                    margin: 11px;
                    border: 1px solid red;
                    padding: 10px;
                }
                </style>
            `);
            jq("#aw_sub_btn").click(e=>{
                console.log("外星人订阅按钮", e);
                if(TASK.exist("Alienware")){
                    TASK.rm("Alienware");
                }else{
                    TASK.add("Alienware");
                }
                e.target.innerText = TASK.exist("Alienware")?"关闭":"开启";
            })
            Alienware.getList().then(res=>{
                const resp = res.response.data;
                // console.log(resp);
                let list = jq("#aw_game_list");
                for(let item of resp){
                    console.log(item);
                    if(!item.published){
                        list.append(`<tr><td>${item.id}</td><td>${item.title}</td><td>${item.publishedAt}</td><td><a href="https://na.alienwarearena.com${item.url}" target="_blank" >查看页面</a></td></tr>`);
                        /*jq("#aw_" + item.id).click(e=>{
                            console.log(e);
                            let target = e.target;
                            const id = target.dataset.id;
                            let name = `Alienware|${id}`;
                            if(!TASK.exist(name)){
                                TASK.add(`Alienware|${id}`);
                                target.innerText = "删除提醒";
                            }else{
                                TASK.rm(`Alienware|${id}`);
                                target.innerText = "添加提醒";
                            }
                        })*/
                    }
                }
            })
        }
        function event(){

        }
        function initTask(){
            const data = [0, []];
            const check = (list)=>{
                console.log(list)
                let history = JSON.parse(localStorage.getItem("awNoticeHistory") || "{}");
                const today = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`;
                if((history[today] === undefined || history[today].length === 0)){
                    history = {};
                    history[today] = [];
                }

                for(let item of list){
                    const publishedDate = new Date(item.publishedAt);
                    const today = new Date();
                    if( today.getYear() === publishedDate.getYear()
                        && today.getMonth() === publishedDate.getMonth()
                        && today.getDate() === publishedDate.getDate()
                      ){
                        if(history[today].indexOf(item.title)!==-1)return;
                        history[today].push(item.title)

                        GM_notification({
                            text: "发key",
                            title: "发key",
                            highlight: true,
                            silent: false,
                            timeout: 3,
                            onclick: ()=>{
                                GM_openInTab("https://na.alienwarearena.com"+item.url);
                            }
                        })
                        return;
                    }
                }
            }
            TASK.addFunc(["Alienware", e=>{
                /*
                    使用上一次数据来进行判断
                */
                const nowTime = parseInt(new Date().getTime()/1000);
                check(data[1]);
                if(data[0] + 20 < nowTime){
                    data[0] = nowTime;
                    Alienware.getList().then(res=>{
                        const resp = res.response;
                        data[1] = resp.data;
                        check(data[1]);
                    });
                }
            }])

        }
        return {
            init: init
        }
    })();
    const Alienware = (()=>{

        const getList = ()=>{
            return HTTP.GET("https://na.alienwarearena.com/esi/featured-tile-data/Giveaway", {
                dataType: "json"
            })
        }
        return {
            getList: getList
        }
    })();

    const TASK = (()=>{
        let taskData = new Set(JSON.parse(localStorage.getItem("omenTask") || "[]"));
        let runInterval = [null]; // 任务运行定时器
        const funcData = {};

        // 获取监听类型
        let hidden, state, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
            state = "visibilityState";
        } else if (typeof document.mozHidden !== "undefined") {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
            state = "mozVisibilityState";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
            state = "msVisibilityState";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
            state = "webkitVisibilityState";
        }
        // 添加监听器,监听当前是否活动页面
        let checkActive;
        const n = Math.random();

        const addFunc = (func)=>{
            funcData[func[0]] = func[1];
        }

        // 添加任务
        const add = (item)=>{
            taskData.add(item);
            store();
        }
        // 移除任务
        const removeTask = (item)=>{
            taskData.delete(item)
            store();
        }
        // 是否存在
        const isExist = (item)=>{
            return taskData.has(item);
        }
        // 存储任务数据
        const store = ()=>{
            let it = taskData.keys();
            const temp = [];
            let t;
            while( !(t = it.next()).done){
                temp.push(t.value)
            }
            localStorage.setItem("omenTask", JSON.stringify(temp));
        }

        const canIRun = function() {
            if( document[state] === "visible"){
                console.log("visible");
                // 当前页面可视化，检查其它标签是否有运行
                checkRunning();
            }else if( document[state] === "hidden"){
                clearInterval(checkActive);
            }
        }

        function checkRunning(){
            checkActive = setInterval(()=>{
                console.log("checkRunning");
                hasTabRuning(n).then((res)=>{
                    if(!res){
                        // 没有运行中的标签
                        console.log("没有运行中的标签")
                        document.removeEventListener(visibilityChange, canIRun);
                        clearInterval(checkActive);
                        setRuning();
                        // taskRun();
                        runInterval[0] = setInterval(taskRun, 31*1000);
                    }
                });
            }, 2000)
        }
        // 执行任务
        const taskRun = ()=>{
            console.log("自动做任务")
            for(let task of taskData){
                console.log("任务：", task)
                const d = task.split("|");
                if(!funcData[d[0]]){
                    console.log(`没有找到${d[0]}的执行方法！移除该任务`);
                    removeTask(task);
                    continue;
                }
                funcData[d[0]](task);

            }
        }
        // item - SESSION|EventName|email|type|param

        // 设置当前标签为运行状态
        const setRuning = ()=>{
            jq("#kl-tool-actions>span").css("color", "red");
            taskData = new Set(JSON.parse(localStorage.getItem("omenTask") || "[]"));
            GM_getTab(function (o) {
                o.omenRun = true;
                GM_saveTab(o);
            });
        }

        // 设置当前标签为停止运行状态
        const setStop = ()=>{
            GM_getTab(function (o) {
                o.omenRun = false;
                GM_saveTab(o);
            });
        }

        // Promise 有无正在运行的标签
        const hasTabRuning = (n)=>{
            return new Promise((resolve, reject)=>{
                GM_getTabs(tabs => {
                    for (let i in tabs) {
                        if(tabs[i].rand===n)continue;

                        if(tabs[i].omenRun){
                            resolve(true);
                            return;
                        }
                    }
                    resolve(false);
                });
            })
        }
        const resetInterval = ()=>{
            if(runInterval[0] === null)return;
            clearInterval(runInterval[0]);
            runInterval[0] = setInterval(taskRun, 31*1000);
        }
        const init = ()=>{
            GM_getTab(function (o) {
                o.rand = n;
                GM_saveTab(o);

                hasTabRuning(n).then(res=>{
                    if(res){
                        // 有标签运行，添加监听
                        checkRunning();
                        document.addEventListener(visibilityChange, canIRun, false);
                    }else{
                        // 没有标签运行
                        setRuning();
                        // taskRun();
                        // 每31秒执行一次
                        runInterval[0] = setInterval(taskRun, 31*1000);
                    }
                })
            });
        }
        return {
            init,
            addFunc,
            add,
            rm: removeTask,
            exist: isExist,
            resetInterval,
            runInterval
        }
    })();

    jq(document).ready(()=>{

        if(window.location.href.includes("keylol")){
            TASK.init();
            UI.init();
        }else if(window.location.href.includes("hp.com")){
            //jq("script[src='https://static.id.hp.com/login3/static/js/main.ed19e0b4.chunk.js']")[0].remove()

           /* globalThis["RedirectToKeyLol"] = (url)=>{
                GM_log(url)
                HTTP.GET("https://task.jysafe.cn/test/r.php?url=" + encodeURIComponent(url)).then(res=>{
                    console.log(res)
                })
            }*/
        }else if(location.host === "www.lootboy.de"){
            let request = indexedDB.open("localforage");
            let db = null;
            request.onsuccess = (res)=>{
                db = res.target.result;
                let transaction = db.transaction(['keyvaluepairs']);
                let objectStore = transaction.objectStore('keyvaluepairs');
                let request = objectStore.get("persist:lootboy");
                request.onerror = function(event) {
                    console.log('事务失败');
                    GM_setValue("LootBoy", null);
                    unsafeWindow.close();
                };

                request.onsuccess = function( event) {
                    let result = JSON.parse(event.target.result)
                    let auth = JSON.parse(result.auth);
                    console.log(auth)
                    let token = auth.token;
                    let id = auth.user.data._id;
                    LootBoy.updateInfo({id, token});
                    unsafeWindow.close();
                };
            }
        }
    })
})();