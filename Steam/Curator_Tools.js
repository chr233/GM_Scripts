// ==UserScript==
// @name:zh-CN      鉴赏家小工具
// @name            Curator_Tools
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.10
// @description     添加删除按钮
// @description:zh-CN  添加删除按钮
// @author          Chr_
// @include         https://store.steampowered.com/curator/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==

// 初始化
(() => {
  "use strict";

  const eleContailer = document.getElementById("subpage_container");
  if (eleContailer) {
    const observer = new MutationObserver(onPageLoad);
    observer.observe(eleContailer, { childList: true, subtree: true });
  }

  let lastPathname = "";
  let lastCount = 0;
  let t = 0;

  function onPageLoad() {
    if (lastPathname == location.pathname) {
      return;
    }
    lastPathname = location.pathname;

    if (t !== 0) {
      clearInterval(t);
      t = 0;
    }

    if (location.pathname.includes("admin/review_create")) {
      injectReviewCreate();
    } else if (location.pathname.includes("admin/stats")) {
      injectStats();
    }
  }

  onPageLoad();

  function genBtn(text, cls, foo) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = cls;
    btn.addEventListener("click", foo);
    return btn;
  }
  function genA(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    return a;
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

  function injectReviewCreate() {
    const [_, curator, appid] = lastPathname.match(
      /\/curator\/([^\/]+)\/admin\/review_create\/?(\d+)?/
    ) ?? [null, null, null];

    if (curator) {
      const btnArea = document.querySelector("div.titleframe");

      if (appid) {
        const btn = genBtn(
          "删除该评测",
          "ct_btn",
          async () => await deleteReview(curator, appid)
        );
        btnArea.appendChild(btn);
        const link = genA(`https://store.steampowered.com/app/${appid}`);
        const btn2 = genBtn("商店页", "ct_btn");
        link.appendChild(btn2);
        btnArea.appendChild(link);
      } else {
        const appSuggest = document.querySelector("#app_suggest_id");
        const reviewType = document.querySelector('textarea[name="blurb"]');
        if (appSuggest && reviewType) {
          let suggestAppId = null;

          const btn = genBtn("编辑原先的评测", "ct_btn");
          const link = genA("#");
          link.appendChild(btn);
          btnArea.appendChild(link);

          const btn2 = genBtn(
            "删除原先的评测",
            "ct_btn",
            async () => await deleteReview(curator, suggestAppId)
          );
          btnArea.appendChild(btn2);

          const link3 = genA("#");
          const btn3 = genBtn("商店页", "ct_btn");
          link3.appendChild(btn3);
          btnArea.appendChild(link3);

          const spStatus = genSpan("test");
          btnArea.appendChild(spStatus);

          t = setInterval(() => {
            if (appSuggest.value !== suggestAppId) {
              suggestAppId = appSuggest.value;
              btn.disabled = true;
              btn2.disabled = true;
              link.href = "#";

              if (suggestAppId) {
                spStatus.textContent = "正在获取评测内容";

                getReviewText(curator, suggestAppId)
                  .then((text) => {
                    if (text) {
                      spStatus.textContent = "读取完成";
                      reviewType.value = text;
                      btn.disabled = false;
                      btn2.disabled = false;
                      link.href = `https://store.steampowered.com/curator/${curator}/admin/review_create/${suggestAppId}`;
                    } else {
                      spStatus.textContent = "未写过评测";
                    }
                  })
                  .catch((e) => {
                    spStatus.textContent = "读取失败";
                    console.error(e);
                  });

                link3.href = `https://store.steampowered.com/app/${suggestAppId}`;
                btn3.disabled = false;
              } else {
                spStatus.textContent = "未选择游戏";
                link3.href = "#";
                btn3.disabled = true;
              }
            }
          }, 500);
        }
      }
    }
  }

  function injectStats() {
    injectBtn();
    injectGotoBtn();

    lastCount = document.querySelectorAll(
      "#RecentReferralsRows td>.ct_div,#TopReferralsRows td>.ct_div"
    ).length;

    const spanList = document.querySelectorAll(
      "#RecentReferrals_controls>span,#RecentReferrals_controls>span>span,#TopReferrals_controls>span,#TopReferrals_controls>span>span"
    );
    for (let span of spanList) {
      span.addEventListener("click", updateInjectBtn);
    }
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
                  if (location.pathname.includes(appid)) {
                    location.pathname = `/curator/${curator}/admin/reviews_manage`;
                  }
                } else {
                  if (ele) {
                    ele.style.opacity = "0.5";
                  }
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

  function updateInjectBtn() {
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
          deleteReview(curator, appid, td.parentNode)
        );
        div.appendChild(btn);

        getReviewType(curator, appid).then((type) => {
          let text = "";
          let color = "#fff";
          switch (type) {
            case 0:
              text = "推荐";
              color = "#a9be7b";
              break;
            case 1:
              text = "不推荐";
              color = "#9e2a22";
              break;
            case 2:
              text = "情报";
              color = "#ecd452";
              break;
            default:
              text = "错误";
              color = "#d3ccd6";
              break;
          }
          const span = genSpan(text);
          span.style.color = color;
          td.insertBefore(span, td.childNodes[0]);
        });
      }
    }
  }

  function injectGotoBtn() {
    const recentController = new CAjaxPagingControls(
      g_RecentReferralsPagingData,
      g_RecentReferralsPagingData["url"]
    );
    const recentCtn = document.querySelector(
      "#RecentReferrals_ctn > div:nth-child(2)"
    );
    recentCtn.appendChild(
      genBtn("跳转到...", "ct_btn2", () => {
        gotoPage(recentController);
      })
    );

    const topController = new CAjaxPagingControls(
      g_TopReferralsPagingData,
      g_TopReferralsPagingData["url"]
    );
    const topCtn = document.querySelector(
      "#TopReferrals_ctn > div:nth-child(2)"
    );
    topCtn.appendChild(
      genBtn("跳转到...", "ct_btn2", () => {
        gotoPage(topController);
      })
    );
  }

  function gotoPage(controller) {
    const dialog = ShowPromptDialog("请输入页码", "", "跳转", "取消");

    dialog.done((txt) => {
      const page = parseInt(txt);
      if (page !== page || page < 1) {
        showAlert("请输入有效数字", false);
        return;
      }

      controller.GoToPage(page - 1, true);
      updateInjectBtn();
    });

    dialog.fail(() => {
      dialog.Dismiss();
    });
  }

  function showAlert(text, succ = true) {
    return ShowAlertDialog(`${succ ? "✅" : "❌"}`, text);
  }

  //获取评测类型
  function getReviewType(curatorId, appId) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://store.steampowered.com/curator/${curatorId}/admin/review_create/${appId}`,
        {
          method: "GET",
          credentials: "include",
        }
      )
        .then((response) => {
          if (response.ok) {
            return response.text();
          } else {
            resolve(-2);
          }
        })
        .then((data) => {
          const match = data.match(
            /"recommendation_state" value="(\d)" checked/
          );
          if (match) {
            resolve(parseInt(match[1]));
          } else {
            resolve(-1);
          }
        })
        .catch((err) => {
          console.error(err);
          resolve(-3);
        });
    });
  }

  //获取写过的评测
  function getReviewText(curatorId, appId) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://store.steampowered.com/curator/${curatorId}/admin/review_create/${appId}`,
        {
          method: "GET",
          credentials: "include",
        }
      )
        .then((response) => {
          if (response.ok) {
            return response.text();
          } else {
            resolve(-2);
          }
        })
        .then((data) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, "text/html");
          const match = xmlDoc.querySelector('textarea[name="blurb"]');
          if (match) {
            resolve(match.value);
          } else {
            resolve(-1);
          }
        })
        .catch((err) => {
          console.error(err);
          resolve(-3);
        });
    });
  }
})();

GM_addStyle(`
.ct_btn {
  padding: 3px;
  margin-right: 10px;
}
.ct_btn2 {
  padding: 0 3px;
  margin-right: 10px;
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
