// #region Variables

const jobDescriptions= querySelectorAll(`div.job-description-container`);
const jobExperienceCollapse = querySelectorAll(`svg.job-experience-collapse`);

// #endregion Variables


// #region Event Listeners

jobExperienceCollapse.forEach((collapseButton, index) => {
    collapseButton.addEventListener("click", () => {
        collapseButton.classList.toggle("closed");
        jobDescriptions[index].classList.toggle("closed");
    })
})

// #endregion Event Listeners