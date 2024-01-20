// ==UserScript==
// @name:zh-CN      卡单小工具
// @name            Fake_Purchase
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.3
// @description     一键批量卡单
// @description:zh-CN  一键批量卡单
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
  let giftAccountId = null;

  let fpValue = parseInt(localStorage.getItem("fpValue") ?? "5");
  if (fpValue !== fpValue) {
    fpValue = 5;
  }

  if (sessionId && cartGid && match) {
    const purchaseType = match[1];

    if (purchaseType === "gift") {
      document.getElementById("gift_recipient_name").value = localStorage.getItem("gift_recipient_name") ?? "";
      document.getElementById("gift_message_text").value = localStorage.getItem("gift_message_text") ?? "";
      document.getElementById("gift_signature").value = localStorage.getItem("gift_signature") ?? "";

      const inputs = document.querySelectorAll('input[name="friend_radio"]');
      for (let i of inputs) {
        i.addEventListener("click", () => {
          giftAccountId = i.value;
          console.log(giftAccountId);
        });
      }
    }

    const logContainer = genTextArea();
    function log(msg) {
      if (logContainer.value) {
        logContainer.value += "\n";
      }
      logContainer.value += msg;
      logContainer.scrollTop = logContainer.scrollHeight;
      console.log(msg);
    }

    setTimeout(() => {
      const container = document.getElementById("col_right_payment_info");

      const div1 = genDiv("block_content fp_div");
      const span = genSpan("卡单次数");
      const input = genInput(fpValue);
      const btn = genBtn("给我卡", async () => {
        try {
          btn.disabled = true;
          localStorage.setItem("fpValue", input.value);

          if (purchaseType === "gift" && !giftAccountId) {
            alert("收礼人Id不能为空");
            return;
          }

          for (let i = 1; i <= input.value; i++) {
            try {
              const transId = purchaseType === "self" ? await initTransaction() : await initTransactionGift();
              log(`${i} 初始化付款成功`);
              await asyncDelay(800);
              const price = await getFinalPrice(transId, purchaseType);
              log(`${i} 购物车总价 ${price}`);
              await cancelTransaction(transId);
              log(`${i} 取消付款成功`);
            } catch (err) {
              log(`${i} ${err}`);
              await asyncDelay(2000);
            } finally {
              await asyncDelay(800);
            }
          }
        } catch (err) {
          log(err);
        } finally {
          btn.disabled = false;
        }
      })
      div1.appendChild(span);
      div1.appendChild(input);
      div1.appendChild(btn);
      container.appendChild(div1);

      const div2 = genDiv("block_content fp_div2");
      div2.appendChild(logContainer);
      container.appendChild(div2);
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
  function genInput(value) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.max = 99;
    input.value = value;
    return input;
  }
  function genTextArea() {
    return document.createElement("textarea");
  }
  function asyncDelay(ms) {
    return new Promise((resolve, _) => {
      setTimeout(resolve, ms);
    })
  }

  // 初始化付款
  async function initTransaction() {
    return new Promise((resolve, reject) => {
      fetch(
        `https://checkout.steampowered.com/checkout/inittransaction/`,
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
  // 初始化付款
  async function initTransactionGift() {
    return new Promise((resolve, reject) => {
      const recipient_name = document.getElementById("gift_recipient_name").value;
      const message_text = document.getElementById("gift_message_text").value;
      const signature = document.getElementById("gift_signature").value;

      if (recipient_name) {
        localStorage.setItem("gift_recipient_name", recipient_name);
      }
      if (message_text) {
        localStorage.setItem("gift_message_text", message_text);
      }
      if (signature) {
        localStorage.setItem("gift_signature", signature);
      }

      fetch(
        `https://checkout.steampowered.com/checkout/inittransaction/`,
        {
          method: "POST",
          credentials: "include",
          body: `gidShoppingCart=${cartGid}&gidReplayOfTransID=-1&bUseAccountCart=0&PaymentMethod=steamaccount&bIsGift=1&GifteeAccountID=${giftAccountId}&GifteeEmail=&GifteeName=${recipient_name}&GiftMessage=${message_text}&Sentiment=%E7%A5%9D%E4%BD%A0%E5%A5%BD%E8%BF%90&Signature=${signature}&ScheduledSendOnDate=0&sessionid=${sessionId}`,
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
})();

GM_addStyle(`
.fp_div > * {
  margin-right: 10px;
}
.fp_div > input {
  width: 50px;
}
.fp_div2 > textarea {
  width: 100%;
  height: 100px;
  font-size: 14px;
  resize: vertical;
}
`);
