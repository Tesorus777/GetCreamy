// workflow
// 1) Get blog element
// 2) Get upcoming projects
// 3) Populate blog element with upcoming project data

// #region Variables

// DOM Elements
const blogBody = querySelector(`#BlogBody`);

// Blog data
const blogData = await API.Get("Site/IncompleteProjects");

// #endregion Variables

// #region Load Data

function LoadBlog() {
    for (const project of blogData) {
        let container = document.createElement("div");
        let name = document.createElement("h3");
        let description = document.createElement("p");
        // Classes
        container.classList.add("home-blog-project-container");
        name.classList.add("home-blog-name");
        description.classList.add("home-blog-description");
        // Information
        name.innerText = project.Name;
        description.innerHTML = project.Description
        // Append
        container.append(name, description);
        blogBody.append(container);
    }
}

// #endregion Load Data

(() => {
    LoadBlog();
})();