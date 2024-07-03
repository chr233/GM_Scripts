// ==UserScript==
// @name:zh-CN      好友管理工具
// @name            Friend_Manager
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description     按照共同群组或者隐私设置管理好友
// @description:zh-CN  按照共同群组或者隐私设置管理好友
// @author          Chr_
// @include         https://steamcommunity.com/id/*/friends/
// @include         https://steamcommunity.com/profiles/*/friends/
// @include         https://steamcommunity.com/id/*/friends
// @include         https://steamcommunity.com/profiles/*/friends
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_registerMenuCommand
// ==/UserScript==

// 初始化
(() => {
    "use strict";

    GM_registerMenuCommand("选择在群组中的好友", () => doSelectInGroup(true));
    GM_registerMenuCommand("选择不在群组中的好友", () => doSelectInGroup(false));

    async function doSelectInGroup(mode) {
        enforceToManageMode();
        await showOperationDialog();

        const groupLink = await showInputGroupLinkDialog();
        const match = groupLink.match(/^(?:https:\/\/steamcommunity\.com\/groups\/)?([^/\s]+)\/?/)

        if (!match) {
            ShowAlertDialog("提示", "群组链接错误, 无法完成操作");
            return;
        }

        const group = match[1];

        const friendList = new Set();

        let page = 1;
        let dialog = ShowDialog("提示", `正在读取共同好友列表, 第 ${page} 页, 已读取 ${friendList.size} 个好友`);
        while (true) {
            const result = await getGroupFriendList(group, page++);
            for (let id of result) {
                friendList.add(id);
            }

            dialog?.Dismiss();
            if (result.length < 51) {
                dialog = ShowDialog("提示", `读取完成, 共读取 ${friendList.size} 个好友`);
                setTimeout(() => {
                    dialog?.Dismiss();
                }, 1000);
                break;
            } else {
                dialog = ShowDialog("提示", `正在读取共同好友列表, 第 ${page} 页, 已读取 ${friendList.size} 个好友`);
            }
        }

        if (friendList.size === 0) {
            ShowAlertDialog("提示", "未获取到共同好友, 群组链接可能无效");
            return;
        }

        const eles = document.querySelectorAll("#search_results>.friend_block_v2");
        const regex = /steamcommunity\.com\/((?:id\/[^"]+)|(?:profiles\/\d+))/;
        for (let ele of eles) {
            const profileLink = ele.querySelector("a")?.href;
            if (profileLink) {
                const m = profileLink.match(regex);
                if (m) {
                    const id = m[1];
                    if (mode === friendList.has(id)) {
                        ele.classList.add("selected");
                        const input = ele.querySelector("div.indicator.select_friend>input");
                        if (input) {
                            input.checked = true;
                        }
                    }
                }
            }
        }

        console.log(friendList);

    }

    function enforceToManageMode() {
        const ele = document.querySelector("#search_results>.friend_block_v2");
        if (!ele.classList.contains("manage")) {
            ToggleManageFriends();
        }
    }

    function showOperationDialog() {
        return new Promise((resolve, reject) => {
            const eles = document.querySelectorAll("#search_results>.friend_block_v2.selected");

            if (eles.length > 0) {

                ShowConfirmDialog(
                    "需要如何处理已经勾选的项目?",
                    "",
                    "不做处理",
                    "取消勾选"
                ).done(() => {
                    resolve();
                }).fail((bool) => {
                    if (bool) {
                        for (let ele of eles) {
                            ele.classList.remove("selected");
                            const input = ele.querySelector("div.indicator.select_friend>input");
                            if (input) {
                                input.checked = false;
                            }
                        }
                    }
                    resolve();
                });
            }
        });
    }

    function showInputGroupLinkDialog() {
        return new Promise((resolve, reject) => {
            ShowPromptDialog(
                "请输入群组链接",
                "例如 https://steamcommunity.com/groups/keylol-player-club",
                "查找好友"
            ).done((text) => {
                resolve(text.trim());
            }).fail(() => {
                resolve(null);
            });
        });
    }

    //读取群组共同好友
    function getGroupFriendList(group, page = 1) {
        return new Promise((resolve, reject) => {
            fetch(`https://steamcommunity.com/groups/${group}/members/?friends=1&p=${page}`, {
                method: "GET",
                credentials: "include",
            })
                .then(async (response) => {
                    if (response.ok) {
                        const data = await response.text();
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(data, "text/html");
                        const container = xmlDoc.querySelector("#memberList");
                        const linkFriends = container.querySelectorAll(".member_block a.linkFriend");

                        const result = [];
                        const regex = /steamcommunity\.com\/((?:id\/[^"]+)|(?:profiles\/\d+))/;
                        for (let link of linkFriends) {
                            const href = link.href;
                            const match = href.match(regex);
                            if (match) {
                                result.push(match[1]);
                            }
                        }
                        console.log(result);
                        resolve(result);
                    } else {
                        console.error("网络请求失败");
                        resolve(null);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    resolve(null);
                });
        });
    }
})();

