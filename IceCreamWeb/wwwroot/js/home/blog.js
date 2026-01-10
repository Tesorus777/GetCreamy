// workflow
// 1) Get blog element
// 2) Get upcoming projects
// 3) Populate blog element with upcoming project data

// #region Variables

// DOM Elements
const blogBody = querySelector(`#BlogBody`);

// Blog data
const blogData = blog;

// #endregion Variables

// #region Load Data

function LoadBlog() {
    for (const project of blogData) {
        blogBody.append(createElement({
            tag: "div",
            classList: ["home-blog-project-container"],
            children: [
                {
                    tag: "h3",
                    innerText: project.Name,
                    classList: ["home-blog-name"]
                },
                {
                    tag: "p",
                    innerHTML: project.Description,
                    classList: ["home-blog-description"]
                }
            ]
        }));
    };
};

// #endregion Load Data

(() => {
    LoadBlog();
})();