// ==UserScript==
// @name         Auto_Award_Muli
// @name:zh-CN   Steam自动打赏【极速多账户版】
// @namespace    https://blog.chrxw.com
// @version      2.2
// @description  Steam自动打赏 — 极速多账户版
// @description:zh-CN  Steam自动打赏 — 极速多账户版
// @author       Chr_
// @include      /^https:\/\/steamcommunity\.com\/id\/[^/]+/?$/
// @include      /^https:\/\/steamcommunity\.com\/profiles\/\d+/?$/
// @connect      steamcommunity.com
// @connect      steampowered.com
// @connect      api.steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
    'use strict';

    // 多语言
    const LANG = {
        'ZH': {
            'done': '完成',
            'changeLang': '修改语言',
            'langName': '中文',
            'operating': '操作进行中……',
            'runningLog': '运行日志',
            'close': '关闭',
            'logWaring': '【日志不会保存, 打赏记录可以在【打赏历史】中查看】',
            'botListTitle': '【机器人账户管理】【ID | 账户名 | SteamID | 点数余额】',
            'addCurrentAccount': '添加当前账号',
            'delSelectAccount': '删除选中账号',
            'reloadAccountPoints': '刷新所有账号点数',
            'historyTitle': '【点数打赏历史记录】【ID | 昵称 | SteamID | 收到点数】',
            'profile': '个人资料',
            'deleteSelectedHistory': '删除选中',
            'clearHistory': '清空历史',
            'reloadHistory': '刷新历史',
            'feedBack': '作者',
            'feedBackTitle': '觉得好用也欢迎给我打赏',
            'notSelected': '---自动使用当前登录账号---',
            'steamID64': 'Steam 64位 ID',
            'awardPoints': '打赏点数(收到)',
            'recommands': '评测',
            'screenshots': '截图',
            'artworks': '艺术作品',
            'setToCurrentUser': '设置为当前用户',
            'calculator': '打赏计算器',
            'save': '保存',
            'reset': '重置',
            'awardHistory': '打赏历史',
            'startAward': '开始打赏',
            'stopAward': '停止打赏',
            'stop': '停止',
            'senderBotAccount': '打赏机器人账户: ',
            'receverAccount': '被打赏人SteamID: ',
            'sendPoints': '打赏点数(收到): ',
            'awardPrefer': '打赏类型(优先级从上到下从左到右): ',
            'botList': '机器人列表',
            'fetchLoginAccount': '获取登陆账户……',
            'fetchToken': '获取Token……',
            'fetchPoints': '获取点数信息……',
            'success': '成功',
            'failure': '失败',
            'error': '错误',
            'confirm': '确认',
            'tips': '提示',
            'addAccountSuccessTips1': '添加账户成功',
            'addAccountSuccessTips2': '当前账户可用点数',
            'deleteAccountConfirmTips': '确定要删除选定的账号吗?',
            'deleteAccountDoneTips1': '删除了',
            'deleteAccountDoneTips2': '个机器人',
            'notSelectedAnyBotsTips': '尚未选中任何机器人!',
            'currentProcess': '当前进度',
            'updateFailed': '更新出错',
            'fetchingAccountPoints': '读取账户点数中……',
            'allDataLoaded': '所有数据刷新完毕',
            'someDataLoadFailed': '部分数据刷新失败, 如果点数显示为【-1】,代表数据刷新失败',
            'botListEmpty': '机器人列表为空',
            'noBotAccountTips': '-- 无机器人账号, 请使用【➕添加当前账号】自动添加 --',
            'awardTaskWasResetTips': '机器人账号已修改, 打赏设置已重置!',
            'noHistoryTips': '-- 无历史记录, 执行打赏任务后会自动记录 --',
            'steamIDisEmpty': '未填入SteamID!',
            'fetchingProfile': '获取个人资料中……',
            'fetchingAwardableItems': '获取可打赏项目……',
            'fetchError': '读取出错',
            'awardableAmount': '可打赏约',
            'nickName': '用户名',
            'totalPoints': '总计点数',
            'calcTips': '根据项目数量计算所得, 不准确',
            'profileNotExistsTips': '个人资料不存在, 请检查SteamID是否正确, 或者使用【🤵设置为当前用户】自动获取。',
            'profileLoadFailedTips': '网络错误, 读取个人资料失败',
            'notSelectedAnyHistoryTips': '未选中历史记录!',
            'clearHistoryConfirmTips': '确定要清除打赏历史记录吗?',
            'clearHistorySuccess': '清除成功',
            'historyListEmpty': '历史记录是空的!',
            'deleteHistoryConfirmTips': '确定要删除选定的打赏历史记录吗?',
            'deleteResultTips1': '删除了',
            'deleteResultTips2': '条打赏历史记录',
            'notSelectedAwardBotsTips': '尚未选择打赏机器人!',
            'steamIDEmptyWithTips': '未填写【被打赏人SteamID】, 建议使用【🤵设置为当前用户】功能!',
            'steamIDErrorWithTips': '【被打赏人SteamID】格式有误, 建议使用【🤵设置为当前用户】功能!',
            'pointsErrorWithTips': '【打赏点数】格式有误, 只能为整数！',
            'awardTypeEmptyTips': '请选择【打赏类型】!',
            'awardReadyToStartTips': '设置保存成功, 可以【✅开始打赏】了',
            'resetConfigConfirmTips': '确定要重置设定吗?',
            'configResetSuccessTips': '设置已清除',
            'awardTaskDataInvalid': '任务数据非法',
            'fetchingTargetProfile': '读取被打赏人个人资料……',
            'awardConfig': '打赏设置',
            'targetNickName': '被打赏人昵称',
            'targetReceivePoints': '预计收到点数',
            'targetBot': '打赏机器人',
            'taskReadyToStartTips': '打赏任务【2秒】后开始, 点击【⛔停止打赏】可以提前终止操作!',
            'taskFailedProfileNotFound': '未找到个人资料, 打赏进程停止!',
            'taskAlreadyStartTips': '打赏任务已经开始了!',
            'taskEndManually': '打赏任务手动终止, 点击【❌关闭】可以关闭面板.',
            'taskNotStart': '打赏任务未开始!',
            'running': '运行',
            'taskStartPointsSummary': '开始打赏, 剩余打赏 / 预计打赏',
            'fetchAwardItemFailedRetry': '获取打赏项目失败, 重试……',
            'fetchNoAwardItemSkip': '没有合适的打赏, 跳过……',
            'beforeSendAward': '将要打赏',
            'itemAndTotal': '项, 总计',
            'points': '点',
            'sendingAwards': '发送打赏中……',
            'fetchSuccessAndFailed': '请求成功 / 请求失败',
            'fetchAwardItemFailedRetryIn2Min': '获取打赏项目失败, 【2秒】后重试……',
            'awardSuccess': '成功打赏',
            'taskFinishedPointsSummary': '打赏完成, 剩余打赏 / 预计打赏',
            'updateBotPointsBalance': '更新机器人点数余额……',
            'bot': '机器人',
            'pointsBalanceUpdateSuccess': '点数余额更新成功, 可用点数',
            'lackOfPointsTaskEnd': '点数余额不足, 终止操作',
            'pointBalanceUpdateFailed': '点数余额更新失败',
            'fetchAwardItemFailedSkip': '获取打赏项目失败, 跳过……',
            'taskEndListEmpty': '列表为空, 结束',
            'fetchCompletedTotal': '获取成功, 共',
            'entries': '个',
            'objectID': '项目ID',
            'noAwardableObjectSkip': '没有合适的打赏, 跳过',
            'willAward': '将要打赏',
            'requestsSummary': '请求成功 / 请求失败',
            'wait2Seconds': '*等待2秒,防止打赏过多*',
            'botDataError': '机器人数据错误, 无法开始打赏!',
            'awardTaskFinish': '✅打赏任务完成, 点击【❌关闭】可以关闭面板。',
            'awardTaskNotFinish': '⛔打赏任务未完成, 点击【❌关闭】可以关闭面板。',
            'cancel': '取消',
            'steamStoreNotLogin': '【STEAM商店】未登录,请重新登录',
            'parseDataFailedMaybeNetworkError': '解析数据失败, 可能是Token失效或者网络错误',
            'typeError': 'type错误',
            'networkError': '网络错误',
            'parseError': '解析出错',
            'importAccount': '手动导入账号',
            'importAccountSteamId64': '请输入Steam64位ID',
            'importAccountInvalidSteamId64': '请输入正确的SteamID',
            'importAccountGetToken': '请访问【 https://store.steampowered.com/pointssummary/ajaxgetasyncconfig 】,并把所有内容粘贴到下面',
            'importAccountNickName': '请输入机器人显示昵称',
            'importAccountNickNameTips': '手动添加',
            'importAccountSuccess': '添加账号成功, 请手动刷新点数',
        },
        'EN': {
            'done': 'Done',
            'changeLang': 'Change Language',
            'langName': 'English',
            'operating': 'Operating……',
            'runningLog': 'Log',
            'close': 'Close',
            'logWaring': '【Log will not save, award history will list in【History】】',
            'botListTitle': '【Bot Accounts】【ID | NickName | SteamID | Points Balance】',
            'addCurrentAccount': 'Add Account',
            'delSelectAccount': 'Del Selected',
            'reloadAccountPoints': 'Refresh Points',
            'historyTitle': '【History】【ID | NickName | SteamID | Received Points】',
            'profile': 'Profile',
            'deleteSelectedHistory': 'Del Selected',
            'clearHistory': 'Clear',
            'reloadHistory': 'Reload',
            'feedBack': 'Author',
            'feedBackTitle': '觉得好用也欢迎给我打赏',
            'notSelected': '---Use Current Account---',
            'steamID64': 'Steam 64 ID',
            'awardPoints': 'Points (Receive)',
            'recommands': 'Recommands',
            'screenshots': 'Screenshots',
            'artworks': 'Artworks',
            'setToCurrentUser': 'Set to page\'s user',
            'calculator': 'Calculator',
            'save': 'Save',
            'reset': 'Reset',
            'awardHistory': 'History',
            'startAward': 'Start Award',
            'stopAward': 'Stop',
            'stop': 'Stopped',
            'senderBotAccount': 'Award Bot: ',
            'receverAccount': 'Target SteamID: ',
            'sendPoints': 'Points (Receive): ',
            'awardPrefer': 'Award Type (Up to down left to right): ',
            'botList': 'Bots List',
            'fetchLoginAccount': 'Fetching current logined account……',
            'fetchToken': 'Fetching token……',
            'fetchPoints': 'Fetching points balance……',
            'success': 'Success',
            'failure': 'Failure',
            'error': 'Error',
            'confirm': 'Confirm',
            'tips': 'Tips',
            'addAccountSuccessTips1': 'Add account successful',
            'addAccountSuccessTips2': 'Current account\'s points balance',
            'deleteAccountConfirmTips': 'Are sure to delete selected bots?',
            'deleteAccountDoneTips1': 'Deleted',
            'deleteAccountDoneTips2': 'bots',
            'notSelectedAnyBotsTips': 'You have not selected any bot!',
            'currentProcess': 'Current process',
            'updateFailed': 'Update Failed',
            'fetchingAccountPoints': 'Fetching points balance……',
            'allDataLoaded': 'All data loaded',
            'someDataLoadFailed': 'Some data loaded failed, if some bot\'s balance is 【-1】, it means fetch error',
            'botListEmpty': 'Bot list is empty',
            'noBotAccountTips': '-- No Bot Account, you can add via【➕Add ACcount】(Loginin required) --',
            'awardTaskWasResetTips': 'Bot account had been modified, Award config reseted!',
            'noHistoryTips': '-- No History Records, It Will Record When Awarding --',
            'steamIDisEmpty': 'You must specify SteamID!',
            'fetchingProfile': 'Fetching profile……',
            'fetchingAwardableItems': 'Fetching awardable items……',
            'fetchError': 'Fetch error',
            'awardableAmount': '可打赏约',
            'nickName': 'Nickname',
            'totalPoints': 'Total points',
            'calcTips': 'According to the total number of the items, inaccurate',
            'profileNotExistsTips': 'Profile not found, please check if the steamID is correct, or use 【🤵Set to page\'s user】 instead',
            'profileLoadFailedTips': 'Network error, fetch profile failed',
            'notSelectedAnyHistoryTips': 'No records selected!',
            'clearHistoryConfirmTips': 'Are you sure to clear all award records?',
            'clearHistorySuccess': 'History cleared',
            'historyListEmpty': 'History is empty!',
            'deleteHistoryConfirmTips': 'Are you sure to delete seleted award records?',
            'deleteResultTips1': 'Deleted',
            'deleteResultTips2': 'history records',
            'notSelectedAwardBotsTips': 'No bots selected!',
            'steamIDEmptyWithTips': '【Target SteamID】is empty, It is recommended to use【🤵Set to page\'s user】!',
            'steamIDErrorWithTips': '【Target SteamID】is invalid, It is recommended to use【🤵Set to page\'s user】!',
            'pointsErrorWithTips': '【Points】is invalid, only integers are accepted!',
            'awardTypeEmptyTips': 'Please select【Award Type】!',
            'awardReadyToStartTips': 'Config saved, it is ready to【✅Start Award】',
            'resetConfigConfirmTips': 'Are you sure to reset the config?',
            'configResetSuccessTips': 'Config reseted!',
            'awardTaskDataInvalid': 'Task data invalid',
            'fetchingTargetProfile': 'Fetching target user\'s profile……',
            'awardConfig': 'Award config',
            'targetNickName': 'Target user\'s nickname',
            'targetReceivePoints': 'Expected points received',
            'targetBot': 'Selected bot',
            'taskReadyToStartTips': 'Award task will start in 【2 seconds】, click【⛔Stop】to interrupt award task!',
            'taskFailedProfileNotFound': 'Profile not found, award task end!',
            'taskAlreadyStartTips': 'Award task is already running!',
            'taskEndManually': 'Award task interrupted manually, click【❌Close】to hide the log panel.',
            'taskNotStart': 'Award task not running!',
            'running': 'Running',
            'taskStartPointsSummary': 'Start sending award, points left / points expected',
            'fetchAwardItemFailedRetry': 'Fetch awardable items failed, retry……',
            'fetchNoAwardItemSkip': 'No suitable award items, skip……',
            'beforeSendAward': 'Will send award',
            'itemAndTotal': 'items, total',
            'points': 'points',
            'sendingAwards': 'Sending awards……',
            'fetchSuccessAndFailed': 'Success / Failure',
            'fetchAwardItemFailedRetryIn2Min': 'Fetch awardable items failed, will retry in【2 seconds】……',
            'awardSuccess': 'Successful send award',
            'taskFinishedPointsSummary': 'Award task complete, points left / points expected',
            'updateBotPointsBalance': 'Update bot\'s points balance……',
            'bot': 'bots',
            'pointsBalanceUpdateSuccess': 'points balance, avilable points',
            'lackOfPointsTaskEnd': 'Lack of points balance, stop operation',
            'pointBalanceUpdateFailed': 'Update points balance failed',
            'fetchAwardItemFailedSkip': 'Fetch awardable items failed, skip……',
            'taskEndListEmpty': 'Award items list is empty, end',
            'fetchCompletedTotal': 'Fetch success, total',
            'entries': 'entries',
            'objectID': 'Target ID',
            'noAwardableObjectSkip': 'No suitable award items, skip...',
            'willAward': 'Will send award',
            'requestsSummary': 'Success / Failure',
            'wait2Seconds': '*Delay 2 seconds, to avoid exceed award*',
            'botDataError': 'Bot data error, can\'t start award task!',
            'awardTaskFinish': '✅Award task completed, click【❌Close】to hide the log panel',
            'awardTaskNotFinish': '⛔Award task not completed, click【❌close】to hide the log panel',
            'cancel': 'Cancel',
            'steamStoreNotLogin': '【STEAM Store】not logined, please sign in first',
            'parseDataFailedMaybeNetworkError': 'Parse data failed, maybe token expired or network error',
            'typeError': 'Type Error',
            'networkError': 'Network Error',
            'parseError': 'Parse Error',
            'importAccount': '手动导入账号',
            'importAccountSteamId64': '请输入Steam64位ID',
            'importAccountInvalidSteamId64': '请输入正确的SteamID',
            'importAccountGetToken': '请访问【 https://store.steampowered.com/pointssummary/ajaxgetasyncconfig 】,并把所有内容粘贴到下面',
            'importAccountNickName': '请输入机器人显示昵称',
            'importAccountNickNameTips': '手动添加',
            'importAccountSuccess': '添加账号成功, 请手动刷新点数',
        }
    };

    // 判断语言
    let language = GM_getValue("lang", null);
    if (!(language in LANG)) {
        showAlert('申明', `<p>本脚本现已免费提供</p><p>如果你在<a href="https://afdian.net/a/chr233">爱发电</a>以外的地方购买了本脚本, 请申请退款</p><p>觉得好用也欢迎给 <a href="https://steamcommunity.com/id/Chr_">作者</a> 打赏</p>`, true);
        language = "ZH";
        GM_setValue("lang", language);
    }
    // 获取翻译文本
    function t(key) {
        return LANG[language][key] || key;
    }
    {// 自动弹出提示
        const languageTips = GM_getValue("languageTips", true);
        if (languageTips && language === "ZH") {
            if (!document.querySelector("html").lang.startsWith("zh")) {
                ShowConfirmDialog("tips", "Auto Award now support English, switch?", "Using English", "Don't show again")
                    .done(() => {
                        GM_setValue("lang", "EN");
                        GM_setValue("languageTips", false);
                        window.location.reload();
                    })
                    .fail((bool) => {
                        if (bool) {
                            showAlert("", "You can switch the plugin's language using TamperMonkey's menu.");
                            GM_setValue("languageTips", false);
                        }
                    });
            }
        }
    }
    GM_registerMenuCommand(`${t("changeLang")} (${t("langName")})`, () => {
        switch (language) {
            case "EN":
                language = "ZH";
                break;
            case "ZH":
                language = "EN";
                break;
        }
        GM_setValue("lang", language);
        window.location.reload();
    });

    GM_registerMenuCommand(t("importAccount"), () => {
        const steamID = prompt(t("importAccountSteamId64"));
        const v_steamID = parseInt(steamID);
        if (v_steamID !== v_steamID) {
            alert(t("importAccountInvalidSteamId64"));
            return;
        }
        const ajaxJson = prompt(t("importAccountGetToken"));
        const json = JSON.parse(ajaxJson);
        const token = json?.data?.webapi_token;
        if (!token) {
            alert(t("parseError"));
            return;
        }

        let botCount = 0;
        for (let _ in GBots) {
            botCount++;
        }
        const nick = prompt(t("importAccountNickName"), `${t("importAccountNickNameTips")} ${botCount}`);

        alert(t("importAccountSuccess"));
        GBots[steamID] = { nick, token, points: -1 };
        GM_setValue('bots', GBots);
        flashBotList();
    });

    //机器人账号
    let GBots = {};
    //打赏历史记录
    let GHistory = {};
    //打赏任务
    let GTask = {};
    //面板状态
    let GPanel = {};
    //控件字典
    let GObjs = {};

    //初始化
    (() => {
        loadConf();

        graphGUI();
        flashBotList();
        flashHistoryList();

        const { panelMain, panelLeft } = GPanel;
        if (panelMain) {
            GPanel.panelMain = false;
            panelSwitch();
        }
        if (panelLeft) {
            GPanel.panelLeft = false;
            leftPanelSwitch();
        }
        if (!isEmptyObject(GTask)) {
            GTask.work = false;
        }
        appllyTask();
    })();

    //====================================================================================
    //添加控制面板
    function graphGUI() {
        function genButton(text, foo, enable = true) {
            const b = document.createElement('button');
            b.textContent = text;
            b.className = 'aam_button';
            b.disabled = !enable;
            b.addEventListener('click', foo);
            return b;
        }
        function genDiv(cls = 'aam_div') {
            const d = document.createElement('div');
            d.className = cls;
            return d;
        }
        function genA(text, url) {
            const a = document.createElement('a');
            a.textContent = text;
            a.className = 'aam_a';
            a.target = '_blank';
            a.href = url;
            return a;
        }
        function genInput(value, tips, number = false) {
            const i = document.createElement('input');
            i.className = 'aam_input';
            if (value) { i.value = value; }
            if (tips) { i.placeholder = tips; }
            if (number) {
                i.type = 'number';
                i.step = 100;
                i.min = 0;
            }
            return i;
        }
        function genTextArea(value, tips) {
            const i = document.createElement('textarea');
            i.className = 'aam_textarea';
            if (value) { i.value = value; }
            if (tips) { i.placeholder = tips; }
            return i;
        }
        function genCheckbox(name, checked = false) {
            const l = document.createElement('label');
            const i = document.createElement('input');
            const s = genSpace(name);
            i.textContent = name;
            i.title = name;
            i.type = 'checkbox';
            i.className = 'aam_checkbox';
            i.checked = checked;
            l.appendChild(i);
            l.appendChild(s);
            return [l, i];
        }
        function genSelect(choose = [], choice = null) {
            const s = document.createElement('select');
            s.className = 'aam_select';
            choose.forEach(([text, value]) => {
                s.options.add(new Option(text, value));
            });
            if (choice) { s.value = choice; }
            return s;
        }
        function genList(choose = [], choice = null) {
            const s = genSelect(choose, choice);
            s.className = 'aam_list';
            s.setAttribute('multiple', 'multiple');
            return s;
        }
        function genP(text) {
            const p = document.createElement('p');
            p.textContent = text;
            return p;
        }
        function genSpan(text = '    ') {
            const s = document.createElement('span');
            s.textContent = text;
            return s;
        }
        const genSpace = genSpan;
        function genBr() {
            return document.createElement('br');
        }
        function genHr() {
            return document.createElement('hr');
        }
        function genMidBtn(text, foo) {
            const a = document.createElement('a');
            const s = genSpan(text);
            a.className = 'btn_profile_action btn_medium';
            a.addEventListener('click', foo);
            a.appendChild(s);
            return [a, s];
        }

        const btnArea = document.querySelector('.profile_header_actions');
        const [btnSwitch, bSwitch] = genMidBtn('⭕', panelSwitch);
        btnArea.appendChild(genSpace());
        btnArea.appendChild(btnSwitch);
        btnArea.appendChild(genSpace());

        const panelArea = document.querySelector('.profile_leftcol');
        const panelMain = genDiv('aam_panel profile_customization');
        panelMain.style.display = 'none';
        panelArea.insertBefore(panelMain, panelArea.firstChild);

        const busyPanel = genDiv('aam_busy');
        const busyPanelContent = genDiv('aam_busy_content');
        const busyMessage = genP(t('operating'));
        const busyImg = new Image();
        busyImg.src = 'https://steamcommunity-a.akamaihd.net/public/images/login/throbber.gif';

        busyPanelContent.appendChild(busyMessage);
        busyPanelContent.appendChild(busyImg);

        busyPanel.appendChild(busyPanelContent);

        panelMain.appendChild(busyPanel);

        const workPanel = genDiv('aam_busy aam_work');
        const workLog = genTextArea('', t('runningLog'),);
        const workHide = genButton(`❌${t('close')}`, () => { workScreen(false, null); }, true);

        workPanel.appendChild(workLog);
        workPanel.appendChild(genSpan(t('logWaring')));
        workPanel.appendChild(workHide);

        panelMain.appendChild(workPanel);

        const leftPanel = genDiv('aam_left');
        const accountPanel = genDiv('aam_account');
        const accountTitle = genSpan(t('botListTitle'));
        const accountList = genList([], null);
        const accountBtns = genDiv('aam_btns');
        const acAdd = genButton(`➕${t('addCurrentAccount')}`, accountAdd);
        const acDel = genButton(`➖${t('delSelectAccount')}`, accountDel);
        const acUpdate = genButton(`🔄${t('reloadAccountPoints')}`, flashAllAccounts);

        accountBtns.appendChild(acAdd);
        accountBtns.appendChild(acDel);
        accountBtns.appendChild(acUpdate);

        accountPanel.appendChild(accountTitle);
        accountPanel.appendChild(genBr());
        accountPanel.appendChild(accountList);
        accountPanel.appendChild(accountBtns);

        leftPanel.appendChild(accountPanel);

        const historyPanel = genDiv('aam_history');
        historyPanel.style.display = 'none';

        const historyTitle = genSpan(t('historyTitle'));
        const historyList = genList([], null);
        const historyBtns = genDiv('aam_btns');
        const hsProfile = genButton(`🌏${t('profile')}`, showProfile);
        const hsDelete = genButton(`➖${t('deleteSelectedHistory')}`, deleteHistory);
        const hsClear = genButton(`🗑️${t('clearHistory')}`, clearHistory);
        const hsReload = genButton(`🔄${t('reloadHistory')}`, flashHistoryList);

        historyBtns.appendChild(hsProfile);
        historyBtns.appendChild(hsDelete);
        historyBtns.appendChild(hsClear);
        historyBtns.appendChild(hsReload);

        historyPanel.appendChild(historyTitle);
        historyPanel.appendChild(genBr());
        historyPanel.appendChild(historyList);
        historyPanel.appendChild(historyBtns);

        leftPanel.appendChild(historyPanel);
        panelMain.appendChild(leftPanel);

        const awardPanel = genDiv('aam_award');
        const feedbackLink = genA(t('feedBack'), 'https://steamcommunity.com/id/Chr_/');
        feedbackLink.title = t('feedBackTitle');
        const awardBot = genSelect([[t('notSelected'), '']], null);
        const awardSteamID = genInput('', t('steamID64'), false);
        const awardPoints = genInput('', t('awardPoints'), true);
        const [awardCProfile, awardProfile] = genCheckbox(t('profile'), true);
        const [awardCRecommand, awardRecommand] = genCheckbox(t('recommands'), true);
        const [awardCScreenshot, awardScreenshot] = genCheckbox(t('screenshots'), true);
        const [awardCImage, awardImage] = genCheckbox(t('artworks'), true);
        const awardBtns1 = genDiv('aam_btns');
        const awardBtnCurrent = genButton(`🤵${t('setToCurrentUser')}`, getCurrentProfile);
        const awardBtnCalc = genButton(`📊${t('calculator')}`, calcAwardItems);
        const awardBtns2 = genDiv('aam_btns');
        const awardBtnSet = genButton(`💾${t('save')}`, applyAwardConfig);
        const awardBtnReset = genButton(`🔨${t('reset')}`, restoreAwardConfig);
        const hSwitch = genButton(`🕒${t('awardHistory')}`, leftPanelSwitch);
        const awardBtns3 = genDiv('aam_btns aam_award_btns');
        const awardBtnStart = genButton(`✅${t('startAward')}`, startAward, false);
        const awardBtnStop = genButton(`⛔${t('stopAward')}`, stopAward, false);
        const awardStatus = genSpan(`🟥 ${t('stop')}`);

        awardBtns1.appendChild(awardBtnCurrent);
        awardBtns1.appendChild(awardBtnCalc);

        awardBtns2.appendChild(awardBtnSet);
        awardBtns2.appendChild(awardBtnReset);
        awardBtns2.appendChild(hSwitch);

        awardBtns3.appendChild(awardBtnStart);
        awardBtns3.appendChild(awardBtnStop);
        awardBtns3.appendChild(awardStatus);

        awardPanel.appendChild(genSpan(t('senderBotAccount')));
        awardPanel.appendChild(feedbackLink);
        awardPanel.appendChild(genBr());
        awardPanel.appendChild(awardBot);
        awardPanel.appendChild(genSpan(t('receverAccount')));
        awardPanel.appendChild(genBr());
        awardPanel.appendChild(awardSteamID);
        awardPanel.appendChild(awardBtns1);
        awardPanel.appendChild(genSpan(t('sendPoints')));
        awardPanel.appendChild(genBr());
        awardPanel.appendChild(awardPoints);
        awardPanel.appendChild(genSpan(t('awardPrefer')));
        awardPanel.appendChild(genBr());
        awardPanel.appendChild(awardCProfile);
        awardPanel.appendChild(awardCRecommand);
        awardPanel.appendChild(genBr());
        awardPanel.appendChild(awardCScreenshot);
        awardPanel.appendChild(awardCImage);
        awardPanel.appendChild(genBr());
        awardPanel.appendChild(awardBtns2);
        awardPanel.appendChild(genHr());
        awardPanel.appendChild(awardBtns3);

        panelMain.appendChild(awardPanel);

        Object.assign(GObjs, {
            bSwitch, hSwitch, panelMain,
            busyPanel, busyMessage, workPanel, workLog, workHide,
            accountPanel, accountList, historyPanel, historyList,
            awardBot, awardSteamID, awardPoints, awardStatus,
            awardProfile, awardRecommand, awardScreenshot, awardImage,
            awardBtnStart, awardBtnStop, awardBtnSet, awardBtnReset
        });
    }
    //面板显示开关
    function panelSwitch() {
        const { bSwitch, panelMain } = GObjs;

        if (GPanel.panelMain !== true) {
            panelMain.style.display = '';
            bSwitch.textContent = '🔴';
            GPanel.panelMain = true;
        } else {
            panelMain.style.display = 'none';
            bSwitch.textContent = '⭕';
            GPanel.panelMain = false;
        }
        GM_setValue('panel', GPanel);
    }
    //左侧面板切换
    function leftPanelSwitch() {
        const { hSwitch, accountPanel, historyPanel } = GObjs;
        if (GPanel.panelLeft !== true) {
            accountPanel.style.display = 'none';
            historyPanel.style.display = '';
            hSwitch.textContent = `🤖${t('botList')}`;
            GPanel.panelLeft = true;
        } else {
            historyPanel.style.display = 'none';
            accountPanel.style.display = '';
            hSwitch.textContent = `🕒${t('awardHistory')}`;
            GPanel.panelLeft = false;
        }
        GM_setValue('panel', GPanel);
    }
    //添加账户
    function accountAdd() {
        let v_nick, v_token, v_steamID;
        loadScreen(true, t('fetchLoginAccount'));
        getMySteamID()
            .then(({ nick, steamID }) => {
                v_nick = nick;
                v_steamID = steamID;
                loadScreen(true, t('fetchToken'));
                return getToken();
            })
            .then((tk) => {
                v_token = tk;
                loadScreen(true, t('fetchPoints'));
                return getPoints(v_steamID, tk);
            })
            .then((points) => {
                showAlert(t('success'), `<p>${t('addAccountSuccessTips1')}</p><p>${t('addAccountSuccessTips2')}: ${points} ${t('points')}</p>`, true);
                GBots[v_steamID] = { nick: v_nick, token: v_token, points };
                GM_setValue('bots', GBots);
                flashBotList();
            })
            .catch((reason) => {
                showAlert(t('error'), reason, false);
            }).finally(() => {
                loadScreen(false, null);
            });
    }
    //删除账户
    function accountDel() {
        const { accountList } = GObjs;
        if (accountList.selectedIndex >= 0) {
            showConfirm(t('confirm'), t('deleteAccountConfirmTips'), () => {
                let i = 0;
                for (const opt of accountList.selectedOptions) {
                    delete GBots[opt.value];
                    i++;
                }
                flashBotList();
                GM_setValue('bots', GBots);
                showAlert(t('tips'), `${t('deleteAccountDoneTips1')} ${i} ${t('deleteAccountDoneTips2')}`, true);
            }, null);
        } else {
            showAlert(t('tips'), t('notSelectedAnyBotsTips'), false);
        }
    }
    //刷新账户点数
    async function flashAllAccounts() {
        //刷新点数
        function makePromise(sid, tk) {
            return new Promise((resolve, reject) => {
                getPoints(sid, tk)
                    .then((points) => {
                        GBots[sid].points = points;
                        loadScreen(true, `${t('currentProcess')}: ${++fin} / ${count}`);
                    }).catch((reason) => {
                        GBots[sid].points = -1;
                        // GBots[sid].nick = '读取失败';
                        loadScreen(true, `${sid} ${t('updateFailed')}: ${reason}`);
                    }).finally(() => {
                        GM_setValue('bots', GBots);
                        resolve();
                    });
            });
        }
        let count = 0, fin = 0;
        for (const _ in GBots) {
            count++;
        }
        if (count > 0) {
            loadScreen(true, t('fetchingAccountPoints'));
            const pList = [];
            for (const steamID in GBots) {
                const { token } = GBots[steamID];
                pList.push(makePromise(steamID, token));
            }
            Promise.all(pList)
                .finally(() => {
                    loadScreen(false, null);
                    flashBotList();
                    if (fin >= count) {
                        showAlert(t('done'), t('allDataLoaded'), true);
                    } else {
                        showAlert(t('done'), t('someDataLoadFailed'), true);
                    }
                });
        } else {
            showAlert(t('error'), t('botListEmpty'), false);
        }
    }
    //刷新账户列表
    function flashBotList() {
        const { bot } = GTask;
        const { accountList, awardBot } = GObjs;
        accountList.options.length = 0;
        awardBot.options.length = 0;
        awardBot.options.add(new Option(t('notSelected'), ''));
        let i = 1;
        let flag = false;
        if (!isEmptyObject(GBots)) {
            for (const steamID in GBots) {
                const { nick, points } = GBots[steamID];
                const pointsStr = parseInt(points).toLocaleString();
                accountList.options.add(new Option(`${i} | ${nick} | ${steamID} | ${pointsStr} 点`, steamID));
                awardBot.options.add(new Option(`${i++} | ${nick} | ${pointsStr} 点`, steamID));
                if (steamID === bot) {
                    flag = true;
                    awardBot.selectedIndex = i - 1;
                }
            }
        } else {
            accountList.options.add(new Option(t('noBotAccountTips'), ''));
        }
        if ((!isEmptyObject(GTask)) && (!flag)) {
            GTask = {};
            GM_setValue('task', GTask);
            appllyTask();
            showAlert(t('tips'), t('awardTaskWasResetTips'), false);
        }
    }
    //刷新历史记录列表
    function flashHistoryList() {
        const { historyList } = GObjs;
        historyList.options.length = 0;
        let i = 1;
        if (!isEmptyObject(GHistory)) {
            for (const steamID in GHistory) {
                const [nick, points] = GHistory[steamID];
                const pointsStr = parseInt(points).toLocaleString();
                historyList.options.add(new Option(`${i++} | ${nick} | ${steamID} | ${pointsStr} 点`, steamID));
            }
        } else {
            historyList.options.add(new Option(t('noHistoryTips'), ''));
        }
    }
    //历史记录增加点数
    function addHistory(steamID, nick, points) {
        if (GHistory[steamID] !== undefined) {
            GHistory[steamID] = [nick, GHistory[steamID][1] + points];
        } else {
            GHistory[steamID] = [nick, points];
        }
        GM_setValue('history', GHistory);
    }
    //获取当前个人资料
    function getCurrentProfile() {
        const { awardSteamID } = GObjs;
        awardSteamID.value = g_rgProfileData.steamid;
    }
    //计算可打赏项目
    function calcAwardItems() {
        const { awardSteamID } = GObjs;
        const steamID = awardSteamID.value.trim();
        if (steamID === '') {
            showAlert(t('error'), t('steamIDisEmpty!'), false);
        } else {
            loadScreen(true, t('fetchingProfile'));
            getProfile(steamID)
                .then(([succ, nick]) => {
                    if (succ) {
                        loadScreen(true, t('fetchingAwardableItems'));
                        const pList = [
                            getAwardCounts(steamID, 'r'),
                            getAwardCounts(steamID, 's'),
                            getAwardCounts(steamID, 'i')
                        ];
                        Promise.all(pList)
                            .then((result) => {
                                const data = {};
                                let sum = 0;
                                for (const [type, succ, count] of result) {
                                    if (succ) {
                                        const points = count * 6600;
                                        data[type] = `${count} , ${t('awardableAmount')}: ${points.toLocaleString()} ${t('points')}`;
                                        sum += points;
                                    } else {
                                        data[type] = t('fetchError');
                                    }
                                }
                                let text = `<p>${t('nickName')}: ${nick}</p><p>${t('recommands')}: ${data.r}</p><p>${t('screenshots')}: ${data.s}</p><p>${t('artworks')}: ${data.i}</p><p>${t('totalPoints')}: ${sum.toLocaleString()}</p><p>*${t('calcTips')}*</p>`;
                                showAlert(t('tips'), text, true);
                            })
                            .finally(() => {
                                loadScreen(false, null);
                            });
                    } else {
                        showAlert(t('error'), t('profileNotExistsTips'), false);
                        loadScreen(false, null);
                    }
                })
                .catch((reason) => {
                    showAlert(t('error'), `<p>${t('profileLoadFailedTips')}</p><p>${reason}</p>`, false);
                    loadScreen(false, null);
                });
        }
    }
    //查看个人资料
    function showProfile() {
        const { historyList } = GObjs;
        const i = historyList.selectedIndex;
        if (i > -1) {
            const { value } = historyList.options[i];
            if (value != '') {
                window.open(`https://steamcommunity.com/profiles/${value}`);
            }
        } else {
            showAlert(t('tips'), t('notSelectedAnyHistoryTips'), false);
        }
    }
    //清除历史
    function clearHistory() {
        if (!isEmptyObject(GHistory)) {
            showConfirm(t('confirm'), t('clearHistoryConfirmTips'), () => {
                GHistory = {};
                flashHistoryList();
                GM_setValue('history', GHistory);
                showAlert(t('tips'), t('clearHistorySuccess'), true);
            }, null);
        } else {
            showAlert(t('tips'), t('historyListEmpty'), false);
        }
    }
    //删除历史
    function deleteHistory() {
        const { historyList } = GObjs;
        if (historyList.selectedIndex >= 0) {
            showConfirm(t('confirm'), t('deleteHistoryConfirmTips'), () => {
                let i = 0;
                for (const opt of historyList.selectedOptions) {
                    delete GHistory[opt.value];
                    i++;
                }
                flashHistoryList();
                GM_setValue('history', GHistory);
                showAlert(t('tips'), `${t('deleteResultTips1')} ${i} ${t('deleteResultTips2')}`, true);
            }, null);
        } else {
            showAlert(t('tips'), t('notSelectedAnyHistoryTips'), false);
        }
    }
    //保存打赏设置
    async function applyAwardConfig() {
        const {
            awardBtnStart, awardBtnStop,
            awardBot, awardSteamID, awardPoints,
            awardProfile, awardRecommand, awardScreenshot, awardImage
        } = GObjs;

        awardBtnStart.disabled = awardBtnStop.disabled = true;

        let bot = awardBot.value;
        let points = parseInt(awardPoints.value);
        let steamID = String(awardSteamID.value).trim();

        let type = 0;
        if (!awardProfile.checked) { type += 1; }
        if (!awardRecommand.checked) { type += 2; }
        if (!awardScreenshot.checked) { type += 4; }
        if (!awardImage.checked) { type += 8; }

        if (bot == '') {
            // 未选择机器人则自动使用当前登录账号
            loadScreen(true, t('fetchLoginAccount'));
            const nick = document.querySelector("#account_pulldown")?.textContent?.trim();
            if (g_steamID && nick) {
                try {
                    loadScreen(true, t('fetchToken'));
                    const token = await getToken();
                    loadScreen(true, t('fetchPoints'));
                    const points = await getPoints(g_steamID, token);
                    GBots[g_steamID] = { nick: nick, token: token, points };
                    GM_setValue('bots', GBots);
                    flashBotList();
                    bot = g_steamID;
                } catch (reason) {
                    showAlert(t('error'), reason, false);
                } finally {
                    loadScreen(false, null);
                }
            }
        }

        if (bot == '') {
            showAlert(t('error'), t('notSelectedAwardBotsTips'), false);
        } else if (steamID === '') {
            showAlert(t('error'), t('steamIDEmptyWithTips'), false);
        } else if (!steamID.match(/^\d+$/)) {
            showAlert(t('error'), t('steamIDErrorWithTips'), false);
        } else if (points !== points || points < 100) {
            showAlert(t('error'), t('pointsErrorWithTips'), false);
        } else if (type === 15) {
            showAlert(t('error'), t('awardTypeEmptyTips'), false);
        } else {
            points = Math.ceil(points / 100) * 100;
            GTask = { bot, steamID, points, type, work: false, nick: null };
            awardBtnStart.disabled = awardBtnStop.disabled = false;
            GM_setValue('task', GTask);
            showAlert(t('tips'), t('awardReadyToStartTips'), true);
        }
    }
    //重置打赏设置
    function restoreAwardConfig() {
        showConfirm(t('confirm'), t('resetConfigConfirmTips'), () => {
            GTask = {};
            GM_setValue('task', GTask);
            appllyTask();
            showAlert(t('tips'), t('configResetSuccessTips'), true);
        }, null);
    }
    //读取设置到界面
    function appllyTask() {
        const {
            awardBtnStart, awardBtnStop,
            awardBot, awardSteamID, awardPoints,
            awardProfile, awardRecommand, awardScreenshot, awardImage
        } = GObjs;
        const { bot, steamID, points, type } = GTask;

        awardBtnStart.disabled = awardBtnStop.disabled = isEmptyObject(GTask);

        awardBot.value = bot ? bot : '';
        awardSteamID.value = steamID ? steamID : '';
        awardPoints.value = points ? points : '';

        awardProfile.checked = !Boolean(type & 1);
        awardRecommand.checked = !Boolean(type & 2);
        awardScreenshot.checked = !Boolean(type & 4);
        awardImage.checked = !Boolean(type & 8);
    }
    //开始自动打赏
    async function startAward() {
        if (isEmptyObject(GTask)) {
            showAlert(t('error'), t('awardTaskDataInvalid'), false);
            return;
        }
        const { steamID, work, points, bot, nick: taskNick } = GTask;
        const { nick: botNick } = GBots[bot];
        const pointsStr = parseInt(points).toLocaleString();

        if (!work) {
            spaceLine(1);
            if (!taskNick) {
                loadScreen(true, t('fetchingTargetProfile'));
                getProfile(steamID)
                    .then(([succ, nickName]) => {
                        if (succ) {
                            GTask.work = true;
                            GTask.nick = nickName;
                            GM_setValue('task', GTask);
                            print(`${t('awardConfig')}:\n〖${t('targetNickName')}: ${nickName}, ${t('targetReceivePoints')}: ${pointsStr}, ${t('targetBot')}: ${botNick}〗`);
                            print(t('taskReadyToStartTips'));
                            workScreen(true);
                            setTimeout(() => {
                                autoAward();
                            }, 2000);
                        } else {
                            print(t('taskFailedProfileNotFound'), 'E');
                            showAlert(t('error'), t('profileNotExistsTips'), false);
                        }
                    })
                    .catch((reason) => {
                        showAlert(t('error'), `<p>${t('profileLoadFailedTips')}</p><p>${reason}</p>`, false);
                    }).finally(() => {
                        loadScreen(false, null);
                    });
            } else {
                GTask.work = true;
                GM_setValue('task', GTask);
                print(`〖${t('targetNickName')}: ${taskNick}, ${t('targetReceivePoints')}: ${pointsStr}, ${t('targetBot')}: ${botNick}〗`);
                print(t('taskReadyToStartTips'));
                workScreen(true);
                setTimeout(() => {
                    autoAward();
                }, 2000);
            }
        } else {
            print(t('taskAlreadyStartTips'));
        }
    }
    //停止自动打赏
    async function stopAward() {
        if (isEmptyObject(GTask)) {
            showAlert(t('error'), t('awardTaskDataInvalid'), false);
            return;
        }
        const { work } = GTask;
        if (work) {
            spaceLine(4);
            print(t('taskEndManually'));
            GTask.work = false;
            GM_setValue('task', GTask);
            showStatus(t('stop'), false);
        } else {
            showAlert(t('error'), t('taskNotStart'), false);
        }
    }
    //打赏项目
    const reactionsDict = {
        1: 300, 2: 300, 3: 300, 4: 300, 5: 300, 6: 300, 7: 300, 8: 300, 9: 600,
        10: 1200, 11: 2400, 12: 300, 13: 2400, 14: 600, 15: 1200, 16: 600,
        17: 4800, 18: 300, 19: 600, 20: 1200, 21: 300, 22: 600, 23: 300
    };
    const reactionValues = [
        300, 300, 300, 300, 300, 300, 300, 300, 600, 1200, 2400, 300,
        2400, 600, 1200, 600, 4800, 300, 600, 1200, 300, 600, 300
    ];
    const reactionIDs = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
        13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
    ];
    //自动打赏  
    async function autoAward() {
        //打赏类型
        const reactionType = {
            'p': ['3', t('profile')], 'r': ['1', t('recommands')], 's': ['2', t('screenshots')], 'i': ['2', t('artworks')]
        };
        const { bot, steamID, type, points: pointsGoal, nick: taskNick } = GTask;
        const { nick: botNick, token } = GBots[bot];

        appllyTask();
        addHistory(steamID, taskNick, 0);
        showStatus(t('running'), true);
        let pointsLeft = pointsGoal;

        if (token) {
            const workflow = [];
            if (!Boolean(type & 8)) { workflow.push('i'); };
            if (!Boolean(type & 4)) { workflow.push('s'); };
            if (!Boolean(type & 2)) { workflow.push('r'); };
            if (!Boolean(type & 1)) { workflow.push('p'); };

            while (GTask.work && workflow.length > 0) {
                const award_type = workflow.pop();
                const [target_type, target_name] = reactionType[award_type];
                let process = genProgressBar((pointsGoal - pointsLeft) / pointsGoal * 100);

                spaceLine(3);
                print(`【${target_name}】${t('taskStartPointsSummary')}: ${pointsLeft.toLocaleString()} / ${pointsGoal.toLocaleString()} ${t('points')}`);
                print(`${t('currentProcess')}: ${process}`);
                spaceLine(3);

                let coast = 0;

                if (target_type === '3') { //个人资料
                    let GoldReactions = null;
                    for (let i = 0; i < 3; i++) { //重试3次
                        if (GoldReactions === null) { //旧打赏列表为空,重新读取并打赏
                            const [succOld, oldReactions] = await getAwardRecords(token, target_type, steamID);
                            if (!succOld) {
                                print(t('fetchAwardItemFailedRetry'));
                                continue;
                            }
                            GoldReactions = oldReactions;
                            const todoReactions = selectFitableReactions(pointsLeft, GoldReactions);
                            if (todoReactions.length === 0) {
                                print(`【${target_name}】${t('fetchNoAwardItemSkip')}`);
                                break;
                            }
                            coast = sumReactionsPoints(todoReactions);
                            print(`【${target_name}】${t('beforeSendAward')}: ${todoReactions.length} ${t('itemAndTotal')}: ${coast.toLocaleString()} ${t('points')}`);
                            const plist = [];
                            for (const id of todoReactions) {
                                plist.push(sendAwardReaction(token, target_type, steamID, id));
                            }
                            print(t('sendingAwards'));
                            const result = await Promise.all(plist);
                            const [succ, fail] = countSuccess(result);
                            print(`${t('fetchSuccessAndFailed')}: ${succ} / ${fail}`);
                        }
                        //统计新的打赏列表,计算打赏点数
                        const [succNew, newReactions] = await getAwardRecords(token, target_type, steamID);
                        if (!succNew) {
                            print(t('fetchAwardItemFailedRetryIn2Min'));
                            await aiosleep(2500);
                            continue;
                        }
                        const diffReactions = filterDiffReactions(newReactions, GoldReactions);
                        coast = sumReactionsPoints(diffReactions);
                        pointsLeft -= coast;
                        addHistory(steamID, taskNick, coast);
                        print(`【${target_name}】${t('awardSuccess')}: ${diffReactions.length} ${t('itemAndTotal')}: ${coast.toLocaleString()} ${t('points')}`);
                        break;
                    }
                    GTask.points = pointsLeft;
                    if (pointsLeft <= 0) {
                        GTask.work = false;
                    }
                    GM_setValue('task', GTask);
                    process = genProgressBar((pointsGoal - pointsLeft) / pointsGoal * 100);

                    spaceLine(3);
                    print(`【${target_name}】${t('taskFinishedPointsSummary')}: ${pointsLeft.toLocaleString()} / ${pointsGoal.toLocaleString()} ${t('points')}`);
                    print(`${t('currentProcess')}: ${process}`);
                    spaceLine(3);

                    print(t('updateBotPointsBalance'));

                    await getPoints(bot, token)
                        .then((p) => {
                            GBots[bot].points = p;
                            GM_setValue('bots', GBots);
                            print(`${t('bot')}【${botNick}】${t('pointsBalanceUpdateSuccess')}: ${p.toLocaleString()} ${t('points')}`);
                            if (p < 300) {
                                print(`${t('bot')}【${botNick}】${t('lackOfPointsTaskEnd')}`);
                                GTask.work = false;
                            }
                        }).catch((r) => {
                            print(`${t('bot')}【${botNick}】${t('pointBalanceUpdateFailed')}: ${r}`);
                        });


                } else { //截图 
                    let page = 1;
                    while (GTask.work) {
                        let j = 0;
                        print(t('fetchingAwardableItems'));
                        const [succ, items] = await getAwardItems(steamID, award_type, page++);
                        if (!succ) {
                            page--;
                            if (++j < 3) {
                                print(t('fetchAwardItemFailedRetryIn2Min'));
                                await aiosleep(2500);
                                continue;
                            } else {
                                print(t('fetchAwardItemFailedSkip'));
                                break;
                            }
                        }
                        if (items.length === 0) {
                            print(`【${target_name}】${t('taskEndListEmpty')}`);
                            break;
                        }

                        print(`【${target_name}】${t('fetchCompletedTotal')} ${items.length} ${t('entries')}`);

                        for (const itemID of items) {

                            print(`【${target_name}】${t('objectID')}: ${itemID}`);
                            let GoldReactions = null;

                            for (let i = 0; i < 3; i++) {
                                if (GoldReactions === null) { //旧打赏列表为空,重新读取并打赏
                                    const [succOld, oldReactions] = await getAwardRecords(token, target_type, itemID);
                                    if (!succOld) {
                                        print(t('fetchAwardItemFailedRetry'));
                                        continue;
                                    }
                                    GoldReactions = oldReactions;
                                    const todoReactions = selectFitableReactions(pointsLeft, GoldReactions);
                                    if (todoReactions.length === 0) {
                                        print(`【${target_name}】${t('noAwardableObjectSkip')}`);
                                        break;
                                    }
                                    coast = sumReactionsPoints(todoReactions);
                                    print(`【${target_name}】${t('willAward')}: ${todoReactions.length} ${t('itemAndTotal')}: ${coast.toLocaleString()} ${t('points')}`);
                                    const plist = [];
                                    for (const id of todoReactions) {
                                        plist.push(sendAwardReaction(token, target_type, itemID, id));
                                    }
                                    print(t('sendingAwards'));
                                    const result = await Promise.all(plist);
                                    const [succ, fail] = countSuccess(result);
                                    print(`${t('requestsSummary')}: ${succ} / ${fail}`);
                                }
                                print(t('wait2Seconds'));
                                await asleep(2000);
                                //统计新的打赏列表,计算打赏点数
                                const [succNew, newReactions] = await getAwardRecords(token, target_type, itemID);
                                if (!succNew) {
                                    print(t('fetchAwardItemFailedRetry'));
                                    continue;
                                }
                                const diffReactions = filterDiffReactions(newReactions, GoldReactions);
                                coast = sumReactionsPoints(diffReactions);
                                pointsLeft -= coast;
                                addHistory(steamID, taskNick, coast);
                                print(`【${target_name}】${t('awardSuccess')}: ${diffReactions.length} ${t('itemAndTotal')}: ${coast.toLocaleString()} ${t('points')}`);
                                break;
                            }
                            GTask.points = pointsLeft;
                            if (pointsLeft <= 0) {
                                GTask.work = false;
                            }
                            GM_setValue('task', GTask);
                            process = genProgressBar((pointsGoal - pointsLeft) / pointsGoal * 100);

                            spaceLine(3);
                            print(`【${target_name}】${t('taskFinishedPointsSummary')}: ${pointsLeft.toLocaleString()} / ${pointsGoal.toLocaleString()} ${t('points')}`);
                            print(`${t('currentProcess')}: ${process}`);
                            spaceLine(3);

                            print(t('updateBotPointsBalance'));

                            await getPoints(bot, token)
                                .then((p) => {
                                    GBots[bot].points = p;
                                    GM_setValue('bots', GBots);
                                    print(`${t('bot')}【${botNick}】${t('pointsBalanceUpdateSuccess')}: ${p.toLocaleString()} ${t('points')}`);
                                    if (p < 300) {
                                        print(`${t('bot')}【${botNick}】${t('lackOfPointsTaskEnd')}`);
                                        GTask.work = false;
                                    }
                                }).catch((r) => {
                                    print(`${t('bot')}【${botNick}】${t('pointBalanceUpdateFailed')}: ${r}`);
                                });

                            if (!GTask.work) {
                                break;
                            }
                        }
                    }
                }
                if (workflow.length > 0) {
                    await aiosleep(1500);
                }
            }
        } else {
            delete GBots[bot];
            GM_setValue('bots', GBots);
            print(t('botDataError'));
            showAlert(t('error'), t('botDataError'), false);
        }
        spaceLine(4);
        if (pointsLeft <= 0) {
            GTask = {};
            print(t('awardTaskFinish'));
        } else {
            GTask.work = false;
            print(t('awardTaskNotFinish'));
        }
        GM_setValue('task', GTask);
        appllyTask();
        showStatus(t('stop'), false);
        flashHistoryList();
    }
    //====================================================================================
    //显示提示
    function showAlert(title, text, succ = true) {
        ShowAlertDialog(`${succ ? '✅' : '❌'}${title}`, `<div>${text}</div>`);
    }
    //显示确认
    function showConfirm(title, text, done = null, cancel = null) {
        ShowConfirmDialog(`⚠️${title}`, `<div>${text}</div>`, t('confirm'), t('cancel'))
            .done(() => {
                if (done) { done(); }
            })
            .fail(() => {
                if (cancel) { cancel(); }
            });
    }
    //显示状态
    function showStatus(text, run = true) {
        const { awardStatus, workHide } = GObjs;
        workHide.disabled = run;
        awardStatus.textContent = `${run ? '🟩' : '🟥'} ${text}`;
    }
    //读取设置
    function loadConf() {
        const bots = GM_getValue('bots');
        GBots = isEmptyObject(bots) ? {} : bots;
        const hs = GM_getValue('history');
        GHistory = isEmptyObject(hs) ? {} : hs;
        const task = GM_getValue('task');
        GTask = isEmptyObject(task) ? {} : task;
        const panel = GM_getValue('panel');
        GPanel = isEmptyObject(panel) ? {} : panel;
    }
    //保存设置
    function saveConf() {
        GM_setValue('bots', GBots);
        GM_setValue('history', GHistory);
        GM_setValue('task', GTask);
        GM_setValue('panel', GPanel);
    }
    //是不是空对象
    function isEmptyObject(obj) {
        for (const _ in obj) { return false; }
        return true;
    }
    //显示加载面板
    function loadScreen(show = true, msg = t('operating')) {
        const { busyPanel, busyMessage } = GObjs;
        if (show) {
            busyPanel.style.opacity = '1';
            busyPanel.style.visibility = 'visible';
            if (msg) {
                busyMessage.textContent = msg;
            }
        } else {
            busyPanel.style.opacity = '0';
            busyPanel.style.visibility = 'hidden';
        }
    }
    //显示日志面板
    function workScreen(show = true) {
        const { workPanel } = GObjs;
        if (show) {
            workPanel.style.opacity = '1';
            workPanel.style.visibility = 'visible';
        } else {
            workPanel.style.opacity = '0';
            workPanel.style.visibility = 'hidden';
        }
    }
    //生成进度条
    const BAR_STYLE = '⣀⣄⣤⣦⣶⣷⣿';
    function genProgressBar(percent) {
        const full_symbol = '⣿';
        const none_symbol = '⣀';
        const percentStr = ` ${percent.toFixed(2)}%`;
        if (percent >= 100) {
            return full_symbol.repeat(40) + percentStr;
        } else {
            percent = percent / 100;
            let full = Math.floor(percent * 40);
            let rest = percent * 40 - full;
            let middle = Math.floor(rest * 6);
            if (percent !== 0 && full === 0 && middle === 0) { middle = 1; }
            let d = Math.abs(percent - (full + middle / 6) / 40) * 100;
            if (d < Number.POSITIVE_INFINITY) {
                let m = BAR_STYLE[middle];
                if (full === 40) { m = ""; }
                return full_symbol.repeat(full) + m + BAR_STYLE[0].repeat(39 - full) + percentStr;
            }
            return none_symbol.repeat(40) + percentStr;
        }
    }
    //日志时间
    function formatTime() {
        const date = new Date();
        return `${date.toLocaleDateString()} ${date.toTimeString().substr(0, 8)}`;
    }
    //输出日志
    function print(msg, level = 'I') {
        const { workLog } = GObjs;
        const time = formatTime();
        workLog.value += `${time} - ${level} - ${msg}\n`;
        workLog.scrollTop = workLog.scrollHeight;
        console.log(`${time} - ${level} - ${msg}`);
    }
    //画分割线
    function spaceLine(style = 1) {
        switch (style) {
            case 1:
                print('#'.repeat(68));
                return;
            case 2:
                print('='.repeat(68));
                return;
            case 3:
                print('+'.repeat(68));
                return;
            case 4:
                print('~'.repeat(68));
                return;
        }
    }
    //异步延时
    function asleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    //====================================================================================
    //计算合适的打赏项目
    function selectFitableReactions(goal, doneList) {
        const fitableList = [];
        const aviableList = [];
        for (const id of reactionIDs) {
            if (doneList.indexOf(id) === -1) {
                aviableList.push(id);
            }
        }
        aviableList.sort((a, b) => { return reactionsDict[a] - reactionsDict[b]; });
        for (const id of aviableList) {
            if (goal < 100) {
                break;
            }
            const value = reactionsDict[id] / 3;
            if (goal >= value) {
                fitableList.push(id);
                goal -= value;
            }
        }
        return fitableList;
    }
    //获取新增打赏项目
    function filterDiffReactions(newList, oldList) {
        const diffList = [];
        for (const id of newList) {
            if (oldList.indexOf(id) === -1) {
                diffList.push(id);
            }
        }
        return diffList;
    }
    //计算打赏项目点数开销
    function sumReactionsPoints(reactions) {
        let points = 0;
        for (const id of reactions) {
            points += reactionsDict[id];
        }
        return points / 3;
    }
    //统计成功失败
    function countSuccess(result) {
        let succ = 0, fail = 0;
        for (const r of result) {
            if (r) {
                succ++;
            } else {
                fail++;
            }
        }
        return ([succ, fail]);
    }
    //异步延时
    function aiosleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    //====================================================================================
    function getMySteamID() {
        return new Promise((resolve, reject) => {
            try {
                const steamID = g_steamID;
                const nick = document.querySelector("div.playerAvatar>a>img")?.getAttribute("alt");

                if (nick && steamID) {
                    resolve({ nick, steamID });
                } else {
                    reject(t('steamStoreNotLogin'));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
    function getToken() {
        return new Promise((resolve, reject) => {
            try {
                let token = document.querySelector("#application_config")?.getAttribute("data-loyalty_webapi_token");

                if (isEmptyObject(token)) {
                    reject(t('steamStoreNotLogin'));
                }
                else {
                    token = token.replace(/"/g, "");
                    resolve(token);
                }
            } catch (err) {
                reject(err);
            }
        });
    }
    function getPoints(steamID, token) {
        return new Promise((resolve, reject) => {
            $http.get(`https://api.steampowered.com/ILoyaltyRewardsService/GetSummary/v1/?access_token=${token}&steamid=${steamID}`)
                .then(({ response }) => {
                    if (isEmptyObject(response)) {
                        reject(t('steamStoreNotLogin'));
                    }
                    try {
                        const points = parseInt(response.summary.points);
                        if (points === points) {
                            resolve(points);
                        } else {
                            reject(t('parseDataFailedMaybeNetworkError'));
                        }
                    } catch (e) {
                        reject(t('parseDataFailedMaybeNetworkError'));
                    }
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }
    function getProfile(steamID) {
        return new Promise((resolve, reject) => {
            $http.getText(`https://steamcommunity.com/profiles/${steamID}/?xml=1`)
                .then((text) => {
                    try {
                        const match = text.match(/<steamID><!\[CDATA\[([\s\S]*)\]\]><\/steamID>/) ||
                            text.match(/<steamID>([\s\S]*)<\/steamID>/);
                        if (match) {
                            resolve([true, match[1].substring()]);
                        } else {
                            resolve([false, null]);
                        }
                    } catch (e) {
                        reject(e);
                    }
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }
    function getAwardCounts(steamID, type) {
        let subPath, preg;
        switch (type) {
            case 'r':
                subPath = 'recommended/?l=schinese';
                preg = /共 (\d+) 项条目/;
                break;
            case 's':
                subPath = 'screenshots/?l=schinese&appid=0&sort=newestfirst&browsefilter=myfiles&view=grid';
                preg = /共 (\d+) 张/;
                break;
            case 'i':
                subPath = 'images/?l=schinese&appid=0&sort=newestfirst&browsefilter=myfiles&view=grid';
                preg = /共 (\d+) 张/;
                break;
            default:
                throw 'type错误';
        }
        return new Promise((resolve, reject) => {
            $http.getText(`https://steamcommunity.com/profiles/${steamID}/${subPath}`)
                .then((text) => {
                    try {
                        const match = text.match(preg);
                        const count = match ? Number(match[1]) : 0;
                        resolve([type, true, count]);
                    } catch (e) {
                        resolve([type, false, 0]);
                    }
                })
                .catch((reason) => {
                    console.error(reason);
                    resolve([type, false, 0]);
                });
        });
    }
    function getAwardItems(steamID, type, p = 1) {
        let subPath, preg;
        switch (type) {
            case 'r':
                subPath = `recommended/?p=${p}&l=schinese`;
                preg = /id="RecommendationVoteUpBtn(\d+)"/g;
                break;
            case 's':
                subPath = `screenshots/?p=${p}&view=grid&l=schinese`;
                preg = /id="imgWallHover(\d+)"/g;
                break;
            case 'i':
                subPath = `images/?p=${p}&view=grid&l=schinese`;
                preg = /id="imgWallHover(\d+)"/g;
                break;
            default:
                throw t('typeError');
        }
        return new Promise((resolve, reject) => {
            $http.getText(`https://steamcommunity.com/profiles/${steamID}/${subPath}`)
                .then((text) => {
                    try {
                        const result = [];
                        const matches = text.matchAll(preg);
                        for (const match of matches) {
                            result.push(match[1]);
                        }
                        resolve([true, result]);
                    } catch (e) {
                        console.error(e);
                        resolve([false, e]);
                    }
                })
                .catch((reason) => {
                    console.error(reason);
                    resolve([false, reason]);
                });
        });
    }
    function getAwardRecords(token, targetType, targetID) {
        return new Promise((resolve, reject) => {
            const params = `access_token=${token}&target_type=${targetType}&targetid=${targetID}`;
            $http.get('https://api.steampowered.com/ILoyaltyRewardsService/GetReactions/v1/?' + params)
                .then(({ response }) => {
                    const { reactionids } = response;
                    resolve([true, reactionids || []]);
                })
                .catch((reason) => {
                    console.error(reason);
                    resolve([false, null]);
                });
        });
    }
    function sendAwardReaction(token, targetType, targetID, reactionID) {
        return new Promise((resolve, reject) => {
            const params = `access_token=${token}&target_type=${targetType}&targetid=${targetID}&reactionid=${reactionID}`;
            $http.post('https://api.steampowered.com/ILoyaltyRewardsService/AddReaction/v1/?' + params)
                .then((json) => {
                    console.log(json);
                    resolve(true);
                })
                .catch((reason) => {
                    console.error(reason);
                    resolve(false);
                });
        });
    }
})();
//====================================================================================
class Request {
    constructor(timeout = 3000) {
        this.timeout = timeout;
    }
    get(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, 'json');
    }
    getHtml(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, '');
    }
    getText(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, 'text');
    }
    post(url, data, opt = {}) {
        opt.data = JSON.stringify(data);
        return this.baseRequest(url, 'POST', opt, 'json');
    }
    baseRequest(url, method = 'GET', opt = {}, responseType = 'json') {
        Object.assign(opt, {
            url, method, responseType, timeout: this.timeout
        });
        return new Promise((resolve, reject) => {
            opt.ontimeout = opt.onerror = reject;
            opt.onload = ({ readyState, status, response, responseText }) => {
                if (readyState === 4 && status === 200) {
                    if (responseType == 'json') {
                        resolve(response);
                    } else if (responseType == 'text') {
                        resolve(responseText);
                    }
                } else {
                    console.error("网络错误");
                    console.log(readyState);
                    console.log(status);
                    console.log(response);
                    reject("解析失败");
                }
            };
            GM_xmlhttpRequest(opt);
        });
    }
}
const $http = new Request();

//CSS表
GM_addStyle(`.aam_panel,
.aam_work {
  padding: 10px;
  display: flex;
}
.aam_work {
  z-index: 500 !important;
}
.aam_busy {
  width: 100%;
  height: 100%;
  z-index: 700;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  display: table;
  visibility: hidden;
  opacity: 0;
  transition: all 0.1s;
}
.aam_busy_content {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
.aam_left {
  width: 61%;
  padding-right: 10px;
}
.aam_award {
  width: 39%;
}
.aam_list,
.aam_select,
.aam_input,
.aam_textarea {
  background-color: #fff !important;
  color: #000 !important;
  border: none !important;
  border-radius: 0 !important;
}
.aam_input {
  width: 98% !important;
  text-align: center;
}
.aam_list {
  height: 230px;
}
.aam_textarea {
  height: calc(100% - 85px);
  width: calc(100% - 45px);
  resize: none;
  font-size: 12px;
}
.aam_left > div > *,
.aam_award:not(span, button) > * {
  width: 100%;
  margin-bottom: 5px;
}
.aam_btns > button:not(:last-child) {
  margin-right: 4px;
}
.aam_award_btns {
  z-index: 600;
  bottom: 10px;
  position: absolute;
}
.aam_work > * {
  position: absolute;
}
.aam_work > span {
  bottom: 12%;
  left: 70px;
}
.aam_work > button {
  bottom: 11%;
}
.aam_a {
  margin-left: 110px;
}`);
