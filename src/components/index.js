document.addEventListener("DOMContentLoaded", () => {
  if (localStorage["chapterLink"]?.length) {
    document.querySelector(".input_chapter input").value = localStorage["chapterLink"];

    getChapter(localStorage["chapterLink"]);
  }
  if (localStorage["commentsLink"]?.length) {
    document.querySelector(".input_comment input").value = localStorage["commentsLink"];

    getComment(localStorage["commentsLink"]);
  }
});

const getChapter = (link) => {
  if (link != "") {
    document.querySelector(".chapter_text .loader").classList.remove("hide");
    fetch(link)
      .then(async (res) => {
        const html = await res.text();
        const websiteData = selectWebsiteChapter(link, html);
        document.querySelector(".chapter_text_wrapper").innerHTML = websiteData.text;
        document.querySelectorAll(".nav .prev").forEach((item) => item.setAttribute("chapter", websiteData.prev));
        document.querySelectorAll(".nav .next").forEach((item) => item.setAttribute("chapter", websiteData.next));
        document.querySelector(".title_chapter").innerHTML = websiteData.title;
        document.querySelector(".chapter_text .loader").classList.add("hide");
        localStorage["chapterLink"] = link;
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    localStorage["chapterLink"] = "";
  }
};

const selectWebsiteChapter = (link, html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const url = new URL(link);
  const origin = url.origin;
  var title, text, next, prev;

  if (link.includes("m.wuxiaworld.co")) {
    title = tempDiv.querySelector(".chapter-title").innerHTML;
    text = tempDiv.querySelector(".chapter-entity").innerHTML.replaceAll("<br><br>", "</p><p>");
    prev = origin + tempDiv.querySelector(".reader-page a.prev").getAttribute("href");
    next = origin + tempDiv.querySelector(".reader-page a.next").getAttribute("href");
  }

  if (link.includes("novelsrock.com")) {
    title = tempDiv.querySelector("#chapter-heading").innerHTML;
    text = tempDiv.querySelector(".reading-content .text-left").innerHTML;
    prev = tempDiv.querySelector("a.btn.prev_page").getAttribute("href");
    next = tempDiv.querySelector("a.btn.next_page").getAttribute("href");
  }

  return { title, text, prev, next };
};

const getComment = async (link) => {
  if (link != "") {
    document.querySelector(".chapter_comments .loader").classList.remove("hide");
    fetch(link)
      .then(async (res) => {
        const html = await res.text();
        const websiteData = await selectWebsiteComment(link, html);
        if (document.querySelector(".comments_wrapper")) {
          document.querySelector(".comments_wrapper").remove();
        }
        document.querySelector(".chapter_comments_wrapper").appendChild(websiteData.comments);
        document.querySelectorAll(".nav .prev").forEach((item) => item.setAttribute("comment", websiteData.prev));
        document.querySelectorAll(".nav .next").forEach((item) => item.setAttribute("comment", websiteData.next));
        document.querySelector(".title_comments").innerHTML = websiteData.title;
        localStorage["commentsLink"] = link;
        document.querySelector(".chapter_comments .loader").classList.add("hide");
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    localStorage["commentsLink"] = "";
  }
};

const selectWebsiteComment = async (link, html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const url = new URL(link);
  const origin = url.origin;
  var title, comments, next, prev;

  if (link.includes("wuxiaworld.com")) {
    title = tempDiv.querySelector("#chapter-outer .caption h4").innerHTML;
    const commentsID = html.match(/COMMENTS_SETTINGS = {"id"\:([^,]*)\,/)[1];
    comments = await fetch(`https://www.wuxiaworld.com/api/comments/${commentsID}/top/?page=1`)
      .then(async (res) => {
        const commentsJson = await res.json();
        const commentsData = commentsJson.items.map((item) => createComment(item));
        const commentsWrapper = document.createElement("div");
        commentsWrapper.className = "comments_wrapper";
        commentsData.map((item) => {
          commentsWrapper.appendChild(item);
        });
        return commentsWrapper;
      })
      .catch((e) => {
        console.log(e);
      });
    prev = origin + tempDiv.querySelector("li.prev a.btn").getAttribute("href");
    next = origin + tempDiv.querySelector("li.next a.btn").getAttribute("href");
  }

  return { title, comments, prev, next };
};

const createComment = (item) => {
  const comment = document.createElement("div");
  const commentImageWrapper = document.createElement("div");
  const commentContentWrapper = document.createElement("div");
  const img = document.createElement("img");
  const poster = document.createElement("h3");
  const p = document.createElement("p");
  comment.className = "comment";
  commentContentWrapper.className = "comment_content";
  commentImageWrapper.className = "comment_image";
  img.src = item.avatar === "/images/profile.png" ? `https://www.wuxiaworld.com${item.avatar}` : item.avatar;
  poster.innerHTML = item.poster;
  p.innerHTML = item.content;
  commentImageWrapper.appendChild(img);
  commentContentWrapper.appendChild(poster);
  commentContentWrapper.appendChild(p);
  comment.appendChild(commentImageWrapper);
  comment.appendChild(commentContentWrapper);
  if (item.children.length != 0) {
    const children = item.children.map((aitem) => createComment(aitem));
    const childrenWrapper = document.createElement("div");
    childrenWrapper.className = "children_wrapper";
    children.map((item) => {
      childrenWrapper.appendChild(item);
    });
    comment.appendChild(childrenWrapper);
  }

  return comment;
};

const nextChapter = () => {
  updateChapter(document.querySelector(".nav .next").getAttribute("chapter"));
};

const prevChapter = () => {
  updateChapter(document.querySelector(".nav .prev").getAttribute("chapter"));
};

const nextComment = () => {
  updateComment(document.querySelector(".nav .next").getAttribute("comment"));
};

const prevComment = () => {
  updateComment(document.querySelector(".nav .prev").getAttribute("comment"));
};

const updateChapter = (link) => {
  if (link) {
    document.querySelector(".input_chapter input").value = link;
    getChapter(link);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const updateComment = (link) => {
  if (link) {
    document.querySelector(".input_comment input").value = link;
    getComment(link);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
