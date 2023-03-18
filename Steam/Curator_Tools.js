// ==UserScript==
// @name:zh-CN      鉴赏家小工具
// @name            Curator_Tools
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description     添加删除按钮
// @description:zh-CN  添加删除按钮
// @author          Chr_
// @include         https://store.steampowered.com/curator/*/admin/review_create/*
// @include         https://store.steampowered.com/curator/*/admin/stats/
// @include         https://store.steampowered.com/curator/*/admin/stats
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==

// 初始化
(() => {
  "use strict";
  if (location.pathname.include("review_create")) {
    let lastPathname = "";
    setInterval(() => {
      if (location.pathname !== lastPathname) {
        lastPathname = location.pathname;

        const [_, curator, appid] = lastPathname.match(
          /\/curator\/([^\/]+)\/admin\/review_create\/(\d+)/
        ) ?? [null, null, null];

        if (curator !== null && appid !== null) {
          console.log("Curator_Tools: appid", appid);
          const btnArea = document.querySelector("div.titleframe");
          const btn = genBtn("删除该评测", async () => {
            await deleteReview(curator, appid);
          });
          btnArea.appendChild(btn);
        }
      }
    }, 500);
  } else {
    const tdList = document.querySelectorAll(
      "#RecentReferralsRows>table>tbody>tr>td:last-child"
    );
    for (let td of tdList) {
    }
  }

  // 生成按钮
  function genBtn(text, foo) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.style.padding = "3px";
    btn.addEventListener("click", foo);
    return btn;
  }

  // 删除评测
  async function deleteReview(curator, appid) {
    ShowConfirmDialog("", "真的要删除这篇评测吗", "给我删", "手滑了").done(
      () => {
        fetch(
          `https://store.steampowered.com/curator/${curator}/admin/ajaxdeletereview/`,
          {
            method: "POST",
            credentials: "include",
            body: `appid=${appid}&sessionid=${g_sessionID}`,
            headers: {
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
          .then(async (response) => {
            if (response.ok) {
              showAlert("删除成功", true);

              setTimeout(() => {
                location.pathname = `/curator/${curator}/admin/reviews_manage`;
              }, 500);
            } else {
              showAlert("删除失败", false);
            }
          })
          .catch((err) => {
            console.error(err);
            showAlert(`删除出错 ${err}`, false);
          });
      }
    );
  }

  function showAlert(text, succ = true) {
    return ShowAlertDialog(`${succ ? "✅" : "❌"}`, text);
  }
})();
