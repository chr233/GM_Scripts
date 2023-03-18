// ==UserScript==
// @name:zh-CN      鉴赏家小工具
// @name            Curator_Tools
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.2
// @description     添加删除按钮
// @description:zh-CN  添加删除按钮
// @author          Chr_
// @include         https://store.steampowered.com/curator/*/admin/review_create/*
// @include         https://store.steampowered.com/curator/*/admin/stats/
// @include         https://store.steampowered.com/curator/*/admin/stats
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==

// 初始化
(() => {
  "use strict";
  let lastPathname = "";
  setInterval(() => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;

      if (location.pathname.includes("review_create")) {
        const [_, curator, appid] = lastPathname.match(
          /\/curator\/([^\/]+)\/admin\/review_create\/(\d+)/
        ) ?? [null, null, null];

        if (curator !== null && appid !== null) {
          const btnArea = document.querySelector("div.titleframe");
          const btn = genBtn(
            "删除该评测",
            "ct_btn",
            async () => await deleteReview(curator, appid)
          );
          btnArea.appendChild(btn);
        }
      } else {
        injectBtn();

        let lastCount = document.querySelectorAll(
          "#RecentReferralsRows td>.ct_div,#TopReferralsRows td>.ct_div"
        ).length;

        const spanList = document.querySelectorAll(
          "#RecentReferrals_controls>span,#RecentReferrals_controls>span>span,#TopReferrals_controls>span,#TopReferrals_controls>span>span"
        );
        for (let span of spanList) {
          span.addEventListener("click", () => {
            const t = setInterval(() => {
              const count = document.querySelectorAll(
                "#RecentReferralsRows td>.ct_div,#TopReferralsRows td>.ct_div"
              ).length;
              if (count != lastCount) {
                clearInterval(t);
                injectBtn();
                lastCount = document.querySelectorAll(
                  "#RecentReferralsRows td>.ct_div,#TopReferralsRows td>.ct_div"
                ).length;
              }
            }, 500);
          });
        }
      }
    }
  }, 500);

  function genBtn(text, cls, foo) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = cls;
    btn.addEventListener("click", foo);
    return btn;
  }

  function genDiv(cls) {
    const div = document.createElement("div");
    div.className = cls;
    return div;
  }

  // 删除评测
  async function deleteReview(curator, appid, ele = null) {
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
                if (location.pathname.includes("review_create")) {
                  location.pathname = `/curator/${curator}/admin/reviews_manage`;
                } else {
                  ele.style.opacity = "0.5";
                }
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

  function injectBtn() {
    const tdList = document.querySelectorAll(
      "#RecentReferralsRows>table>tbody>tr>td:last-child,#TopReferralsRows>table>tbody>tr>td:last-child"
    );
    for (let td of tdList) {
      const a = td.childNodes[0];

      if (a.nodeName !== "A") {
        continue;
      }

      const div = genDiv("ct_div");
      div.appendChild(a);
      td.appendChild(div);

      const [_, curator, appid] = a.href.match(
        /\/curator\/([^\/]+)\/admin\/review_create\/(\d+)/
      ) ?? [null, null, null];

      if (curator !== null && appid !== null) {
        const btn = genBtn("删", "ct_btn", async () =>
          deleteReview(curator, appid, td)
        );
        div.appendChild(btn);
      }
    }
  }

  function showAlert(text, succ = true) {
    return ShowAlertDialog(`${succ ? "✅" : "❌"}`, text);
  }
})();

GM_addStyle(`
.ct_btn {
  padding: 3px;
}
td {
  height: 100%;
}
.ct_div {
  display: flex;
  align-content: center;
  align-items: center;
  height: 25px;
  width: 40px;
}
tr > td > .ct_div > .ct_btn {
  display: none;
}
tr:hover > td > .ct_div > .ct_btn {
  display: block;
}
`);
