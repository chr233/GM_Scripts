// ==UserScript==
// @name:zh-CN      Steam 愿望单截图助手
// @name            Wishlist_Screenshot
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.1
// @description     自动截取愿望单
// @description:zh-CN  自动截取愿望单
// @author          Chr_
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @require         https://lib.baomitu.com/html2canvas/1.4.1/html2canvas.min.js
// @include         https://store.steampowered.com/app/*
// @include         https://store.steampowered.com/wishlist/*
// @grant           GM_addStyle
// @grant           GM_registerMenuCommand
// ==/UserScript==

(() => {
    "use strict";

    const PC_MODE_KEY = "pcMode";
    const MANUAL_MODE = "autoMode";

    const usePcMode = !!localStorage.getItem(PC_MODE_KEY);
    const manualMode = !!localStorage.getItem(MANUAL_MODE);

    GM_registerMenuCommand(`愿望单模式: ${usePcMode ? "PC" : "手机"}`, () => {
        localStorage.setItem(PC_MODE_KEY, usePcMode ? "" : "1");
        window.location.reload();
    });

    GM_registerMenuCommand(`截图模式: ${manualMode ? "手动" : "自动"}`, () => {
        localStorage.setItem(MANUAL_MODE, manualMode ? "" : "1");
        window.location.reload();
    });

    // 控制注入逻辑
    if (location.pathname.startsWith("/app/")) {
        if (checkCanAddWishlist()) {
            injectStorePage();
        }
    } else if (location.pathname.startsWith("/wishlist/")) {
        const params = new URLSearchParams(window.location.search);

        // 检查某个参数是否存在
        if (params.has('wsShoot')) {
            console.log('wsShoot');
            injectWishlistPage();
        }
    }

    // 生成按钮
    function genButton(text, className = null, foo = null) {
        const btn = document.createElement("button");
        btn.textContent = text;
        if (className) {
            btn.className = className;
        }
        if (foo) {
            btn.addEventListener("click", foo);
        }

        return btn;
    }

    // 检查是否可以添加愿望单
    function checkCanAddWishlist() {
        const eleAddWishlist = document.querySelector("#add_to_wishlist_area");
        const eleAddWishlistS = document.querySelector("#add_to_wishlist_area_success");
        const eleAddWishlistF = document.querySelector("#add_to_wishlist_area_fail");
        return !!(eleAddWishlist && eleAddWishlistS && eleAddWishlistF);
    }

    // 注入商店页
    function injectStorePage() {

        const area = document.querySelector("#queueActionsCtn");
        const lastA = document.querySelector("#queueActionsCtn>a");

        const btn = genButton("愿望单截图", "btnv6_blue_hoverfade ws_take_photo ws_lg", openWishlist);
        area.insertBefore(btn, lastA);

        const btnSm = genButton("📷", "btnv6_blue_hoverfade ws_take_photo ws_sm", openWishlist);
        area.insertBefore(btnSm, lastA);
    }

    // 注入愿望单页面
    function injectWishlistPage() {
        window.addEventListener("load", () => {
            document.querySelector('header').style.display = "none";

            const t = setInterval(async () => {
                const eleImgs = document.querySelectorAll("img[role='presentation']");

                for (let img of eleImgs) {
                    if (!img.complete || img.naturalHeight === 0) {
                        return;
                    }
                }

                clearInterval(t);

                setTimeout(doScreenshot, 800);

            }, 500);
        });
    }

    // 获取 AppId
    function getCurrentAppId() {
        const match = location.pathname.match(/\/app\/(\d+)/);
        if (!match) {
            return null;
        }

        return match[1];
    }

    // 获取用户个人资料路径
    function getCurrentUserPath() {
        const href = document.querySelector("#global_actions>a")?.getAttribute("href");
        if (!href) {
            return null;
        }

        const match = href.match(/(id|profiles)\/([^\/\s]+)/);
        if (!match) {
            return null;
        }

        return `${match[1]}/${match[2]}`;
    }

    // 打卡愿望单
    function openWishlist() {
        if (document.querySelector("#add_to_wishlist_area")?.style?.display !== "none") {
            ShowAlertDialog("提示", "请先添加愿望单, 如果已添加, 请刷新页面后再试");
            return;
        }

        const appId = getCurrentAppId();
        const userPath = getCurrentUserPath();

        if (!appId || !userPath) {
            ShowAlertDialog("提示", "可能没有登录Steam");
            return;
        }

        let targetUrl = `https://store.steampowered.com/wishlist/${userPath}/?sort=discount&wng=${appId}`;
        if (!manualMode) {
            targetUrl += '&wsShoot=1';
        }

        const newWindow = window.open(
            targetUrl,
            '愿望单',
            usePcMode ? 'width=810,height=580' : 'width=430,height=750',
        );

        console.log(newWindow);
    }

    async function doScreenshot() {
        try {
            console.log('📸 正在截屏...');

            // 截取页面
            const canvas = await html2canvas(document.body, {
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: true,
                windowHeight: window.innerHeight,
                windowWidth: window.innerWidth,
                // ✓ 从当前滚动位置开始
                x: 0,
                y: window.scrollY
            });

            // Canvas 转 Blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            // 使用 Clipboard API 复制图片
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);

            console.log('✓ 愿望单截图已复制!');
            alert('✓ 愿望单截图已复制!');

            if (window.opener) {
                window.close();
            }

        } catch (error) {
            console.error('✗ 失败:', error);
            alert('✗ 复制失败, 请手动截图!');
        }
    }

    GM_addStyle(`
.ws_lg {
  display: block;
}

.ws_sm {
  display: none;
}

@media (max-width: 910px) {
  .ws_lg {
    display: none;
  }

  .ws_sm {
    display: block;
  }
}

.ws_take_photo {
  padding: 5px 10px;
}

`);

})();