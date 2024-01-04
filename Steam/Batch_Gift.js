// ==UserScript==
// @name:zh-CN      批量送礼小工具
// @name            Batch_Gift
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description     一键批量送礼
// @description:zh-CN  一键批量送礼
// @author          Chr_
// @include         https://checkout.steampowered.com/checkout/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==

// 初始化
(() => {
  "use strict";

  const sessionId = g_sessionID;
  const cartGid = document.getElementById("shopping_cart_gid")?.getAttribute("value");
  const match = location.search.match(/purchasetype=([^&]+)/);

  if (sessionId && cartGid && match) {
    const runLog = genTextArea("运行日志");
    function runtimeLog(msg) {
      if (runLog.value) {
        runLog.value += "\n";
      }
      runLog.value += msg;
      runLog.scrollTop = runLog.scrollHeight;
      console.log(msg);
    }

    const sendGiftLog = genTextArea("送礼结果日志");
    function giftLog(msg) {
      if (sendGiftLog.value) {
        sendGiftLog.value += "\n";
      }
      sendGiftLog.value += msg;
      sendGiftLog.scrollTop = sendGiftLog.scrollHeight;
      console.log(msg);
    }

    setTimeout(() => {
      const bgGiftName = localStorage.getItem("bgGiftName") ?? "";
      const bgGiftInfo = localStorage.getItem("bgGiftInfo") ?? "";
      const bgGiftSign = localStorage.getItem("bgGiftSign") ?? "";
      const bgTargetUsers = localStorage.getItem("bgTargetUsers") ?? "";

      const container = document.getElementById("col_right_payment_info");

      appendChild(container, genSpan("送礼对象"));
      const targetUsers = genTextArea("一行一个, 支持 SteamId 和 好友代码", bgTargetUsers);
      appendChild(container, targetUsers);

      appendChild(container, genSpan("接收人名字"));
      const giftName = genInput(bgGiftName, "留空自动使用默认信息");
      appendChild(container, giftName);

      appendChild(container, genSpan("礼物信息"));
      const giftInfo = genInput(bgGiftInfo, "留空自动使用默认信息");
      appendChild(container, giftInfo);

      appendChild(container, genSpan("礼物签名"));
      const giftSign = genInput(bgGiftSign, "留空自动使用默认签名");
      appendChild(container, giftSign);

      const btn = genBtn("批量送礼", async () => {
        try {
          btn.disabled = true;

          localStorage.setItem("bgGiftName", giftName.value);
          localStorage.setItem("bgGiftInfo", giftInfo.value);
          localStorage.setItem("bgGiftSign", giftSign.value);
          localStorage.setItem("bgTargetUsers", targetUsers.value);
          await batchSendGift(targetUsers.value, giftName.value, giftInfo.value, giftSign.value, runtimeLog, giftLog);
        } catch (err) {
          runtimeLog(err);
        } finally {
          btn.disabled = false;
        }
      });
      appendChild(container, btn);

      appendChild(container, genSpan("运行日志"));
      appendChild(container, runLog);

      appendChild(container, genSpan("送礼结果日志"));
      appendChild(container, sendGiftLog);
    }, 500);
  } else {
    console.log("sessionId或者cartGid为null")
  }

  function genBtn(text, foo) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.addEventListener("click", foo);
    return btn;
  }
  function genDiv(cls) {
    const div = document.createElement("div");
    div.className = cls;
    return div;
  }
  function genSpan(name) {
    const span = document.createElement("span");
    span.textContent = name;
    return span;
  }
  function genInput(value, placeholder) {
    const input = document.createElement("input");
    input.value = value;
    input.placeholder = placeholder;
    return input;
  }
  function genTextArea(placeholder, value) {
    const t = document.createElement("textarea");
    if (placeholder) {
      t.placeholder = placeholder;
    }
    if (value) {
      t.value = value;
    }
    return t;
  }
  function appendChild(father, child) {
    const div = genDiv("block_content bg_div2");
    div.appendChild(child);
    father.appendChild(div);
  }
  function asyncDelay(ms) {
    return new Promise((resolve, _) => {
      setTimeout(resolve, ms);
    })
  }

  async function batchSendGift(targetSteamIds, giftName, giftInfo, giftSign, log, log2) {
    const matchNumber = /^\d+$/;
    const steamIds = [];

    for (let line of targetSteamIds.split('\n')) {
      const tLine = line.trim();

      if (tLine) {
        if (matchNumber.test(tLine)) {
          let steamId = BigInt(tLine);
          steamIds.push(steamId);
        } else {
          log(`非法SteamId: ${tLine}`);
        }
      }
    }

    if (steamIds.length === 0) {
      alert("收礼人不能为空, 请输入有效的 SteamId / 好友代码");
      return;
    }

    if (isEmptyOrNull(giftName)) {
      giftName = "自动送礼工具";
    }

    if (isEmptyOrNull(giftInfo)) {
      giftInfo = "祝你好运";
    }

    if (isEmptyOrNull(giftSign)) {
      giftSign = "自动送礼工具 作者: Chr_";
    }

    // for (let steamId of steamIds) {
    //   try {
    //     const sid32 = isSteam64Id(steamId) ? convert2Steam32Id(steamId) : steamId;

    //     log(`=== ${steamId} 开始送礼 ===`);

    //     const transId = await initTransactionGift(sid32, giftName, giftInfo, giftSign);
    //     log("初始化付款成功");
    //     await asyncDelay(800);
    //     const price = await getFinalPrice(transId, "gift");
    //     log(`购物车总价 ${price}`);
    //     const code = await finalizeTransaction(transId);
    //     log(`最终结算完成, 代码: ${code}, 总价 ${price}`);

    //     if (code === 22) {
    //       log2(`${steamId}: 送礼成功, 总价: ${price}`);
    //     } else {
    //       log2(`${steamId}: 送礼失败, 代码: ${code}, 总价 ${price}`);
    //     }

    //   } catch (err) {
    //     log(`送礼出错 ${err}`)
    //     log2(`${steamId}: 送礼出错 ${err}`)
    //     await asyncDelay(2000);
    //   } finally {
    //     await asyncDelay(800);
    //   }
    // }

    let transId = -1;
    for (let steamId of steamIds) {
      try {
        const sid32 = isSteam64Id(steamId) ? convert2Steam32Id(steamId) : steamId;

        log(`=== ${steamId} 开始送礼 ===`);

        transId = await initTransactionGift2(sid32, giftName, giftInfo, giftSign, transId);
        log("初始化付款成功");
        log2(`${steamId}: 生成订单成功: ${transId}`);

      } catch (err) {
        log(`送礼出错 ${err}`)
        log2(`${steamId}: 送礼出错 ${err}`)
        await asyncDelay(2000);
      } finally {
        await asyncDelay(800);
      }
    }

    if (transId !== -1) {
      try {
        const price = await getFinalPrice(transId, "gift");
        log(`购物车总价 ${price}`);
        const code = 1// await finalizeTransaction(transId);
        log(`最终结算完成, 单号 ${transId}, 代码: ${code}, 总价 ${price}`);
        if (code === 22) {
          log2(`最终结算完成, 总价 ${price}`)
        } else {
          log2(`最终结算, 代码: ${code}, 总价 ${price}`);
        }
      } catch (err) {
        log2(`最终结算出错 ${err}`)

      }
    }
  }

  function isEmptyOrNull(value) {
    return !(value.trim());
  }

  // SteamId常量
  const STEAMID_CONVERT = BigInt('76561197960265728');
  // 是否为64Id
  function isSteam64Id(input) {
    return input > STEAMID_CONVERT;
  }
  // 64Id转32Id
  function convert2Steam32Id(steam64ID) {
    return steam64ID - STEAMID_CONVERT;
  }
  // 32Id转64Id
  function convert2Steam64Id(steam64ID) {
    return steam64ID + STEAMID_CONVERT;
  }
  // 初始化付款(送礼)
  async function initTransactionGift(targerSteamId, giftName, giftInfo, giftSign) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://checkout.steampowered.com/checkout/inittransaction/`,
        {
          method: "POST",
          credentials: "include",
          body: `gidShoppingCart=${cartGid}&gidReplayOfTransID=-1&bUseAccountCart=0&PaymentMethod=steamaccount&bIsGift=1&GifteeAccountID=${targerSteamId}&GifteeEmail=&GifteeName=${giftName}&GiftMessage=${giftInfo}&Sentiment=%E7%A5%9D%E4%BD%A0%E5%A5%BD%E8%BF%90&Signature=${giftSign}&ScheduledSendOnDate=0&sessionid=${sessionId}`,
          headers: {
            "content-type":
              "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      )
        .then(response => {
          response.json().then(json => {
            const { success, transid } = json;
            if (success === 1) {
              resolve(transid);
            } else {
              reject("初始化付款失败");
            }
          })
        })
        .catch((err) => {
          console.error(err);
          reject(`初始化付款失败 ${err}`);
        });
    });
  }

  // 初始化付款(送礼2)
  async function initTransactionGift2(targerSteamId, giftName, giftInfo, giftSign, transId) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://checkout.steampowered.com/checkout/inittransaction/`,
        {
          method: "POST",
          credentials: "include",
          body: `gidShoppingCart=${cartGid}&gidReplayOfTransID=${transId}&bUseAccountCart=0&PaymentMethod=steamaccount&bIsGift=1&GifteeAccountID=${targerSteamId}&GifteeEmail=&GifteeName=${giftName}&GiftMessage=${giftInfo}&Sentiment=%E7%A5%9D%E4%BD%A0%E5%A5%BD%E8%BF%90&Signature=${giftSign}&ScheduledSendOnDate=0&sessionid=${sessionId}`,
          headers: {
            "content-type":
              "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      )
        .then(response => {
          response.json().then(json => {
            const { success, transid } = json;
            if (success === 1) {
              resolve(transid);
            } else {
              reject("初始化付款失败");
            }
          })
        })
        .catch((err) => {
          console.error(err);
          reject(`初始化付款失败 ${err}`);
        });
    });
  }

  // 获取最终价格
  function getFinalPrice(transId, purchaseType) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://checkout.steampowered.com/checkout/getfinalprice/?count=1&transid=${transId}&purchasetype=${purchaseType}&microtxnid=-1&cart=${cartGid}&gidReplayOfTransID=-1`,
        {
          method: "POST",
          credentials: "include",
          body: `gidShoppingCart=${cartGid}&gidReplayOfTransID=-1&PaymentMethod=steamaccount&sessionid=${sessionId}`,
          headers: {
            "content-type":
              "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      )
        .then(response => {
          response.json().then(json => {
            const { success, formattedTotal } = json;
            if (success === 1) {
              resolve(formattedTotal);
            } else {
              reject("获取最终价格失败");
            }
          })
        })
        .catch((err) => {
          console.error(err);
          reject(`获取最终价格失败 ${err}`);
        });
    });
  }

  // 取消付款
  function cancelTransaction(transId) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://checkout.steampowered.com/checkout/canceltransaction/`,
        {
          method: "POST",
          credentials: "include",
          body: `transid=${transId}&sessionid=${sessionId}`,
          headers: {
            "content-type":
              "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      )
        .then(async (response) => {
          response.json().then(json => {
            const { success, transid } = json;
            if (success === 2) {
              resolve();
            } else {
              reject("取消付款失败");
            }
          })
        })
        .catch((err) => {
          console.error(err);
          reject(`取消付款失败 ${err}`);
        });
    });
  }

  // 确认付款
  function finalizeTransaction(transId) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://checkout.steampowered.com/checkout/finalizetransaction/?count=1&transid=${transId}`,
        {
          method: "POST",
          credentials: "include",
          body: `transid=${transId}&CardCVV2=&browserInfo={"language":"zh-CN","javaEnabled":"false","colorDepth":24,"screenHeight":1080,"screenWidth":1920}"&sessionid=${sessionId}`,
          headers: {
            "content-type":
              "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      )
        .then(async (response) => {
          response.json().then(json => {
            const { success } = json;
            resolve(success);
          })
        })
        .catch((err) => {
          console.error(err);
          reject(`确认付款失败 ${err}`);
        });
    });
  }

})();

GM_addStyle(`
.bg_div2 {
  padding: 4px 8px !important;
}
.bg_div2 > * {
  width: 100%;
}
.bg_div2 > textarea {
  height: 100px;
  font-size: 14px;
  resize: vertical;
  width: 98%;
  padding: 3px;
}
`);
