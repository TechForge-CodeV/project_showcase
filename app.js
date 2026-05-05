// Load projects from project-data.js
// Make sure project-data.js uses: let projects = [...]
const projectList = document.getElementById("projectList");
const memberList = document.getElementById("memberList");
const themeToggle = document.getElementById("themeToggle");

// -------------------- PROJECTS --------------------

function renderProjects(filteredProjects = projects) {
  if (!projectList) return;

  projectList.innerHTML = "";

  if (!filteredProjects || filteredProjects.length === 0) {
    projectList.innerHTML = `
      <div class="col-12 text-center text-white py-5">
        No projects found.
      </div>
    `;
    return;
  }

  filteredProjects.forEach(project => {
const tags = project.tech
  .map(t => `<span class="tag">${t}</span>`)
  .join("");

const developerTags = project.developers && project.developers.length > 0
  ? project.developers.map(dev => `<span class="tag">${dev}</span>`).join("")
  : `<span class="text-white opacity-75 small">No developers listed</span>`;

    let avgRating = project.rating || 0;

    if (project.reviews && project.reviews.length > 0) {
      const sum = project.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      avgRating = (sum / project.reviews.length).toFixed(1);
    }

    let starsHtml = "";

    for (let i = 1; i <= 5; i++) {
      if (i <= avgRating) {
        starsHtml += `<i class="bi bi-star-fill text-warning"></i>`;
      } else if (i - 0.5 <= avgRating) {
        starsHtml += `<i class="bi bi-star-half text-warning"></i>`;
      } else {
        starsHtml += `<i class="bi bi-star text-warning"></i>`;
      }
    }

    projectList.innerHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="project-card">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="project-icon mb-0">
              <i class="bi ${project.icon || "bi-rocket-takeoff"}"></i>
            </div>

            <div class="text-end">
              <div class="fs-5">${starsHtml}</div>
              <small class="text-white opacity-75">
                ${project.reviews ? project.reviews.length : 0} reviews
              </small>
            </div>
          </div>

          <h4>${project.title}</h4>
          <p class="text-white opacity-75 mb-2">${project.category}</p>
          <p class="text-white">${project.description}</p>

          <div class="mb-3">
  ${tags}
</div>

<div class="mb-4">
  <p class="text-white opacity-75 mb-2 small">Developed by:</p>
  ${developerTags}
</div>

          <div class="project-actions d-flex gap-2 flex-wrap">
            ${
              project.liveUrl
                ? `
                  <a href="${project.liveUrl}" target="_blank" class="btn btn-sm btn-primary rounded-pill flex-grow-1">
                    Live Demo
                  </a>
                `
                : ""
            }

            ${
              project.githubUrl
                ? `
                  <a href="${project.githubUrl}" target="_blank" class="btn btn-sm btn-outline-light rounded-pill flex-grow-1">
                    GitHub
                  </a>
                `
                : ""
            }

            <button class="btn btn-sm btn-outline-light rounded-pill flex-grow-1" onclick="openReviewModal(${project.id})">
              Feedback
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function loadProjects() {
  const stored = localStorage.getItem("codev_projects");

  if (stored) {
    const storedProjects = JSON.parse(stored);

    const merged = [...projects];

    storedProjects.forEach(storedProject => {
      if (!merged.some(project => project.id === storedProject.id)) {
        merged.push(storedProject);
      }
    });

    projects = merged;
  }

  projects.sort((a, b) => b.id - a.id);
  renderProjects();
}

// -------------------- MEMBERS --------------------

function renderMembers(filteredMembers = members) {
  if (!memberList) return;

  memberList.innerHTML = "";

  if (!filteredMembers || filteredMembers.length === 0) {
    memberList.innerHTML = `
      <div class="col-12 text-center text-white py-5">
        No members found.
      </div>
    `;
    return;
  }

  filteredMembers.forEach(member => {
    const originalIdx = members.indexOf(member);
    const initials = member.name.charAt(0);
    const skills = member.skills
      .map(skill => `<span class="tag">${skill}</span>`)
      .join("");

    memberList.innerHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="member-card">
          <div class="member-avatar">${initials}</div>

          <h4 class="contributor-name d-inline-block text-white" onclick="openContributorModal(${originalIdx})">
            ${member.name}
          </h4>

          <p class="text-white opacity-75">${member.role}</p>

          <div>${skills}</div>

          <button class="btn btn-outline-light rounded-pill mt-4" onclick="openContributorModal(${originalIdx})">
            View Profile
          </button>
        </div>
      </div>
    `;
  });
}

// -------------------- THEME --------------------

function loadTheme() {
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem("codev_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle.innerHTML =
    savedTheme === "dark"
      ? `<i class="bi bi-moon-stars"></i>`
      : `<i class="bi bi-brightness-high"></i>`;
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");

    if (currentTheme === "dark") {
      html.setAttribute("data-theme", "light");
      localStorage.setItem("codev_theme", "light");
      themeToggle.innerHTML = `<i class="bi bi-brightness-high"></i>`;
    } else {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("codev_theme", "dark");
      themeToggle.innerHTML = `<i class="bi bi-moon-stars"></i>`;
    }
  });
}

// -------------------- SUBMIT PROJECT --------------------

document.getElementById("projectForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("projectTitle").value.trim();
  const category = document.getElementById("projectCategory").value;
  const description = document.getElementById("projectDescription").value.trim();

  const tech = document
    .getElementById("projectTech")
    .value.split(",")
    .map(item => item.trim())
    .filter(Boolean);

const githubUrl = document.getElementById("projectGithub").value.trim();
const liveUrl = document.getElementById("projectDemo").value.trim();

const developers = document.getElementById("projectDevelopers").value
  .split(",")
  .map(name => name.trim())
  .filter(Boolean);

  if (!title || !description) {
    alert("Please fill all required fields.");
    return;
  }

projects.unshift({
  id: Date.now(),
  title,
  category,
  description,
  tech,
  developers,
  icon: "bi-rocket-takeoff",
  githubUrl,
  liveUrl,
  rating: 0,
  reviews: []
});

  localStorage.setItem("codev_projects", JSON.stringify(projects));

  renderProjects();
  this.reset();

  const modal = bootstrap.Modal.getInstance(document.getElementById("projectModal"));
  if (modal) modal.hide();

  alert("Project submitted successfully!");
});

// -------------------- SEARCH PROJECTS --------------------

const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", e => {
    const query = e.target.value.toLowerCase();

    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query) ||
      project.tech.some(tech => tech.toLowerCase().includes(query))
    );

    renderProjects(filtered);
  });
}

// -------------------- SEARCH MEMBERS --------------------

const memberSearchInput = document.getElementById("memberSearchInput");

if (memberSearchInput) {
  memberSearchInput.addEventListener("input", e => {
    const query = e.target.value.toLowerCase();

    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.skills.some(skill => skill.toLowerCase().includes(query))
    );

    renderMembers(filtered);
  });
}

// -------------------- CONTRIBUTOR MODAL --------------------

function openContributorModal(memberIdx) {
  const member = members[memberIdx];
  if (!member) return;

  document.getElementById("contributorName").innerText = member.name;
  document.getElementById("contributorRole").innerText = member.role;
  document.getElementById("contributorAvatar").innerText = member.name.charAt(0);

  const modal = new bootstrap.Modal(document.getElementById("contributorModal"));
  modal.show();
}

// -------------------- REVIEW MODAL --------------------

function openReviewModal(projectId) {
  const project = projects.find(project => project.id === projectId);
  if (!project) return;

  document.getElementById("reviewModalTitle").innerText = `Reviews: ${project.title}`;
  document.getElementById("reviewProjectId").value = project.id;

  updateReviewUI(project);

  document.querySelectorAll("#ratingInput i").forEach(star => {
    star.classList.remove("bi-star-fill");
    star.classList.add("bi-star");
  });

  document.getElementById("selectedRating").value = 0;
  document.getElementById("reviewComment").value = "";

  const reviewForm = document.getElementById("reviewForm");
  const loginMessage = document.getElementById("loginMessage");

  if (reviewForm && loginMessage) {
    if (!isLoggedIn) {
      reviewForm.style.display = "none";
      loginMessage.style.display = "block";
    } else {
      reviewForm.style.display = "block";
      loginMessage.style.display = "none";
    }
  }

  const modal = new bootstrap.Modal(document.getElementById("reviewModal"));
  modal.show();
}

function updateReviewUI(project) {
  let avgRating = 0;

  if (project.reviews && project.reviews.length > 0) {
    const sum = project.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    avgRating = (sum / project.reviews.length).toFixed(1);
  }

  document.getElementById("avgRatingDisplay").innerText = avgRating;
  document.getElementById("totalReviewsDisplay").innerText =
    `(${project.reviews ? project.reviews.length : 0} reviews)`;

  let starsHtml = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= avgRating) {
      starsHtml += `<i class="bi bi-star-fill text-warning"></i>`;
    } else if (i - 0.5 <= avgRating) {
      starsHtml += `<i class="bi bi-star-half text-warning"></i>`;
    } else {
      starsHtml += `<i class="bi bi-star text-warning"></i>`;
    }
  }

  document.getElementById("avgStarsDisplay").innerHTML = starsHtml;

  const reviewList = document.getElementById("reviewList");

  if (!project.reviews || project.reviews.length === 0) {
    reviewList.innerHTML = `
      <p class="text-white text-center py-3">
        No reviews yet. Be the first to review!
      </p>
    `;
  } else {
    reviewList.innerHTML = project.reviews.map(review => {
      let reviewStars = "";

      for (let i = 1; i <= 5; i++) {
        reviewStars += i <= review.rating
          ? `<i class="bi bi-star-fill text-warning"></i>`
          : `<i class="bi bi-star text-warning"></i>`;
      }

      return `
        <div class="review-item">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong class="text-white">${review.user}</strong>
            <div>${reviewStars}</div>
          </div>
          <p class="mb-0 text-white opacity-75">${review.comment}</p>
        </div>
      `;
    }).join("");
  }
}

// -------------------- RATING INPUT --------------------

document.querySelectorAll("#ratingInput i").forEach(star => {
  star.addEventListener("click", function () {
    const rating = this.getAttribute("data-rating");

    document.getElementById("selectedRating").value = rating;

    document.querySelectorAll("#ratingInput i").forEach(s => {
      if (s.getAttribute("data-rating") <= rating) {
        s.classList.remove("bi-star");
        s.classList.add("bi-star-fill");
      } else {
        s.classList.remove("bi-star-fill");
        s.classList.add("bi-star");
      }
    });
  });
});

// -------------------- SUBMIT REVIEW --------------------

document.getElementById("reviewForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const projectId = parseInt(document.getElementById("reviewProjectId").value);
  const rating = parseInt(document.getElementById("selectedRating").value);
  const comment = document.getElementById("reviewComment").value.trim();

  if (rating === 0) {
    alert("Please select a star rating!");
    return;
  }

  if (!comment) {
    alert("Please enter a comment!");
    return;
  }

  const project = projects.find(project => project.id === projectId);

  if (project) {
    if (!project.reviews) project.reviews = [];

    project.reviews.unshift({
      user: "Guest User",
      rating,
      comment
    });

    localStorage.setItem("codev_projects", JSON.stringify(projects));

    updateReviewUI(project);
    renderProjects();

    document.getElementById("selectedRating").value = 0;
    document.getElementById("reviewComment").value = "";

    document.querySelectorAll("#ratingInput i").forEach(star => {
      star.classList.remove("bi-star-fill");
      star.classList.add("bi-star");
    });
  }
});

// -------------------- INIT --------------------

loadTheme();
loadProjects();
renderMembers();