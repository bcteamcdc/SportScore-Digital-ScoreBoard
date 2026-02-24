// ========================================
// ZOOM PREVENTION - Selective Lock
// ========================================
// ========================================
// AUTO FIT - Dynamic Scaling & Zoom Control
// ========================================
(function autoFitSystem() {
  // 1. Enable Auto-Scaling for Desktop/Laptops
  function applyAutoFit() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Target design width (approximate standard laptop/desktop base)
    // We want the 1400px+ content to fit nicely on 1366px or 1280px screens
    const targetWidth = 1550;

    // Only apply scaling scaling on desktop-like aspect ratios (landscape)
    // and screens that are likely laptops/monitors (width > 900)
    // Mobile devices (width < 900) should use the responsive CSS media queries instead
    if (width > 900 && width < targetWidth) {
      const scale = width / targetWidth;
      // Use CSS zoom for desktop browsers (Chrome/Edge/Safari support this well for this purpose)
      // Leaving a small buffer (0.98) to prevent edge touches
      // Cap the zoom so it doesn't get too tiny (e.g. min 60%)
      document.body.style.zoom = Math.max(scale, 0.6);
    } else {
      // Reset zoom on larger screens or mobile
      document.body.style.zoom = 1;
    }
  }

  // 2. Event Listeners
  window.addEventListener("resize", applyAutoFit);
  window.addEventListener("load", applyAutoFit);
  // Initial call
  applyAutoFit();

  // 3. Selective Zoom Prevention (Optional - keeping touch restrictions but allowing generic browser zoom)
  // Prevent specific gesture zooming (pinch) which can mess up the "app-like" feel on touch pads
  document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
  });
})();

// Loading Screen Progress Logic
(function startLoading() {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const loadingStatus = document.getElementById("loadingStatus");
  if (!progressFill || !progressText) return;

  let start = null;
  const duration = 3000;
  const statusMessages = ["LOADING...", "PREPARING DATA...", "ALMOST READY..."];

  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(1 + (elapsed / duration) * 99, 100);

    progressFill.style.width = progress + "%";
    progressText.textContent = Math.floor(progress) + "%";

    const msgIndex = Math.min(
      Math.floor((progress / 100) * statusMessages.length),
      statusMessages.length - 1,
    );
    if (
      loadingStatus &&
      loadingStatus.textContent !== statusMessages[msgIndex]
    ) {
      loadingStatus.textContent = statusMessages[msgIndex];
    }

    if (progress < 100) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) {
          loadingScreen.classList.add("hidden");
          document.body.style.overflow = "auto";
        }
      }, 1000);
    }
  }
  requestAnimationFrame(animate);
})();

// DOM Elements - Navigation and Pages
const scoresTab = document.getElementById("scores-tab");
const leaderboardTab = document.getElementById("leaderboard-tab");
const momentsTab = document.getElementById("moments-tab");
const leadersTab = document.getElementById("leaders-tab");
const analyticsTab = document.getElementById("analytics-tab");

const scoresPage = document.getElementById("scores-page");
const leaderboardPage = document.getElementById("leaderboard-page");
const momentsPage = document.getElementById("moments-page");
const leadersPage = document.getElementById("leaders-page");
const analyticsPage = document.getElementById("analytics-page");
const houseDetailsPage = document.getElementById("house-details-page");
const athleticsDetailsPage = document.getElementById("athletics-details-page");

// DOM Elements - Containers
const sportsContainer = document.getElementById("sports-container");
const rankingsContainer = document.getElementById("rankings-container");
const momentsContainer = document.getElementById("moments-container");
const houseSportsContainer = document.getElementById("house-sports-container");
const athleticsContainer = document.getElementById("athletics-container");
const slideshowContainer = document.getElementById("slideshow-container");
const slideshowControls = document.getElementById("slideshow-controls");

// DOM Elements - Buttons and Titles
const houseDetailsTitle = document.getElementById("house-details-title");
const backButton = document.getElementById("back-to-leaderboard");
const backToScoresButton = document.getElementById("back-to-scores");

// Slideshow Variables
let currentSlide = 0;
let slideshowInterval;
const slideshowDelay = 2000;

// Moments Data
let momentsData = null;
let bcpasData = null;
let bcmuData = null;
let currentCategory = "bcpas"; // Default category filter

// Navigation State
let athleticsSourceHouse = null;

// Page Navigation Functions
function showPage(pageElement) {
  // Hide all pages
  const allPages = [
    scoresPage,
    leaderboardPage,
    momentsPage,
    leadersPage,
    analyticsPage,
    houseDetailsPage,
    athleticsDetailsPage,
  ];
  allPages.forEach((page) => (page.style.display = "none"));

  // Show selected page
  pageElement.style.display = "block";

  // Scroll to top of the page
  window.scrollTo(0, 0);

  // Handle slideshow for moments page
  if (pageElement === momentsPage) {
    startSlideshow();
  } else {
    stopSlideshow();
  }

  // Initialize chart for analytics page
  if (pageElement === analyticsPage) {
    initChart();
  }
}

function setActiveTab(tab) {
  // Remove active class from all tabs
  const allTabs = [
    scoresTab,
    leaderboardTab,
    momentsTab,
    leadersTab,
    analyticsTab,
  ];
  allTabs.forEach((t) => t.classList.remove("active"));

  // Set active tab
  tab.classList.add("active");
}

// Navigation Event Listeners
scoresTab.addEventListener("click", () => {
  showPage(scoresPage);
  setActiveTab(scoresTab);
});

leaderboardTab.addEventListener("click", () => {
  showPage(leaderboardPage);
  setActiveTab(leaderboardTab);
  renderRankings();
});

momentsTab.addEventListener("click", () => {
  showPage(momentsPage);
  setActiveTab(momentsTab);
  // Initialize both filters
  setupMomentsFilter();
  setupMomentsCategoryFilter();
});

leadersTab.addEventListener("click", () => {
  showPage(leadersPage);
  setActiveTab(leadersTab);
  renderLeaders();
});

analyticsTab.addEventListener("click", () => {
  showPage(analyticsPage);
  setActiveTab(analyticsTab);
});

// Scores Filter Event Listeners
function setupScoresFilter() {
  const filterOptions = document.querySelectorAll(
    "#scores-filter-options .filter-option",
  );
  if (filterOptions.length === 0) return;

  filterOptions.forEach((option) => {
    option.addEventListener("click", () => {
      filterOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      currentScoresFilter = option.dataset.filter;
      renderSports();
    });
  });
}

function setupAthleticsFilter() {
  const filterOptions = document.querySelectorAll(
    "#athletics-filter-options .filter-option",
  );
  if (filterOptions.length === 0) return;

  filterOptions.forEach((option) => {
    option.addEventListener("click", () => {
      filterOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      currentAthleticsFilter = option.dataset.filter;
      renderAthleticsDetails(athleticsSourceHouse);
    });
  });
}

// Back Button Event Listeners
backButton.addEventListener("click", (e) => {
  e.preventDefault();
  showPage(leaderboardPage);
  setActiveTab(leaderboardTab);
});

backToScoresButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (athleticsSourceHouse) {
    // Go back to house details
    showHouseDetails(athleticsSourceHouse);
    // Clear the source so subsequent navigations reset unless set again
    athleticsSourceHouse = null;
  } else {
    // Default back to scores
    showPage(scoresPage);
    setActiveTab(scoresTab);
  }
});

// Moments Data Loading
async function loadMomentsData() {
  // Load main moments data (may not exist)
  try {
    const response = await fetch("data/moments.json");
    if (response.ok) {
      momentsData = await response.json();
    }
  } catch (error) {
    console.log("No moments.json found, using category data only");
    momentsData = { moments: [] };
  }

  // Load BCPAS data
  try {
    const bcpasResponse = await fetch("data/bcpas.json");
    if (bcpasResponse.ok) {
      bcpasData = await bcpasResponse.json();
    }
  } catch (error) {
    console.error("Error loading BCPAS data:", error);
    bcpasData = { moments: [] };
  }

  // Load BCMU data
  try {
    const bcmuResponse = await fetch("data/bcmu.json");
    if (bcmuResponse.ok) {
      bcmuData = await bcmuResponse.json();
    }
  } catch (error) {
    console.error("Error loading BCMU data:", error);
    bcmuData = { moments: [] };
  }

  // Proactively cache images for better offline experience
  cacheMomentsImages();
}

function cacheMomentsImages() {
  // Cache images from all sources
  const allMoments = [];
  if (momentsData && momentsData.moments)
    allMoments.push(...momentsData.moments);
  if (bcpasData && bcpasData.moments) allMoments.push(...bcpasData.moments);
  if (bcmuData && bcmuData.moments) allMoments.push(...bcmuData.moments);

  allMoments.forEach((moment) => {
    if (moment.image) {
      const img = new Image();
      img.src = moment.image;
    }
  });
}

// Leaders Data Loading
let leadersData = null;
let selectedLeaderYear = null;
let selectedLeaderHouse = "gemunu";
let currentScoresFilter = "completed";
let currentAthleticsFilter = "completed";

async function loadLeadersData() {
  try {
    const response = await fetch("data/leaders.json");
    if (response.ok) {
      leadersData = await response.json();
      // Proactively cache images for better offline experience
      cacheLeadersImages();
    }
  } catch (error) {
    console.error("Error loading leaders data:", error);
    leadersData = null;
  }
}

function cacheLeadersImages() {
  if (!leadersData || !leadersData.years) return;

  const imageUrls = [];

  leadersData.years.forEach((yearData) => {
    // Sports Captain
    if (yearData.sportsCaptain && yearData.sportsCaptain.photo) {
      imageUrls.push(yearData.sportsCaptain.photo);
    }

    // Sports Committee
    if (yearData.sportsCommittee) {
      yearData.sportsCommittee.forEach((member) => {
        if (member.photo) imageUrls.push(member.photo);
      });
    }

    // House Masters
    if (yearData.houseMasters) {
      Object.values(yearData.houseMasters).forEach((house) => {
        if (house.master && house.master.photo)
          imageUrls.push(house.master.photo);
        if (house.mistress && house.mistress.photo)
          imageUrls.push(house.mistress.photo);
      });
    }

    // Student Leaders
    if (yearData.studentLeaders) {
      Object.values(yearData.studentLeaders).forEach((house) => {
        if (house.houseCaptain && house.houseCaptain.photo)
          imageUrls.push(house.houseCaptain.photo);
        if (house.sportsCaptain && house.sportsCaptain.photo)
          imageUrls.push(house.sportsCaptain.photo);
      });
    }
  });

  // Add Awards images if any
  if (leadersData.awards) {
    leadersData.awards.forEach((award) => {
      if (award.photo) imageUrls.push(award.photo);
    });
  }

  // Trigger fetch for each image to let Service Worker cache them
  imageUrls.forEach((url) => {
    // Use a low-priority fetch or just create an Image object
    const img = new Image();
    img.src = url;
  });
}

function renderLeaders() {
  if (!leadersData) {
    loadLeadersData().then(() => {
      if (leadersData) {
        renderLeaders();
      }
    });
    return;
  }

  // Render year filter
  renderLeadersYearFilter();

  const years = getLeadersAvailableYears();
  if (years.length > 0 && !selectedLeaderYear) {
    // Always default to currentYear from basic.json
    // If currentYear exists in the years array, use it. Otherwise use the first year.
    let defaultYear = years.includes(currentYear) ? currentYear : years[0];
    selectedLeaderYear = defaultYear;

    // Update the active button in year filter
    document
      .querySelectorAll("#leaders-year-options .filter-option")
      .forEach((btn) => {
        btn.classList.remove("active");
        if (parseInt(btn.dataset.year) === selectedLeaderYear) {
          btn.classList.add("active");
        }
      });
  }
  if (selectedLeaderYear) {
    renderLeadersContent(selectedLeaderYear);
  }
}

// Helper function to get year data
function getLeadersYearData(year) {
  if (!leadersData || !leadersData.years) return null;
  return leadersData.years.find((y) => y.year === year);
}

function getLeadersAvailableYears() {
  if (!leadersData || !leadersData.years) return [];
  return leadersData.years.map((y) => y.year).sort((a, b) => b - a);
}

function renderLeadersYearFilter() {
  const container = document.getElementById("leaders-year-options");
  if (!container) return;

  const years = getLeadersAvailableYears();
  container.innerHTML = "";

  years.forEach((year, index) => {
    const btn = document.createElement("div");
    btn.className = `filter-option ${index === 0 ? "active" : ""}`;
    btn.dataset.year = year;
    btn.textContent = year;

    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#leaders-year-options .filter-option")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedLeaderYear = parseInt(year);
      renderLeadersContent(selectedLeaderYear);
    });

    container.appendChild(btn);
  });
}

function setupLeadersHouseFilter() {
  const houseOptions = document.querySelectorAll(
    "#leaders-house-options .filter-option",
  );
  houseOptions.forEach((option) => {
    option.addEventListener("click", () => {
      houseOptions.forEach((o) => o.classList.remove("active"));
      option.classList.add("active");
      selectedLeaderHouse = option.dataset.house;
      if (selectedLeaderYear) {
        renderLeadersContent(selectedLeaderYear);
      }
    });
  });
}

function renderLeadersContent(year) {
  // Get year data
  const yearData = getLeadersYearData(year);

  if (!yearData) return;

  // Render Sports Captain
  renderSportsCaptain(yearData);

  // Render Sports Committee
  renderSportsCommittee(yearData);

  // Render House Masters & Mistresses
  renderHouseMasters(yearData);

  // Render Student Leaders
  renderStudentLeaders(yearData);

  // Render House Captains
  renderHouseCaptains(yearData);

  // Render Awards
  renderAwards(yearData);

  // Setup house filter
  setupLeadersHouseFilter();
}

function renderSportsCaptain(yearData) {
  const titleContainer = document.getElementById(
    "sports-captain-title-container",
  );
  const cardContainer = document.getElementById(
    "sports-captain-card-container",
  );

  if (!titleContainer || !cardContainer) return;

  if (!yearData.sportsCaptain || !yearData.sportsCaptain.name) {
    titleContainer.innerHTML = `<h2 class="section-main-title">Sport Captain ${yearData.year}</h2>`;
    cardContainer.innerHTML = `
            <div class="no-data" style="text-align: center; padding: 4rem 2rem; font-size: 1.8rem; letter-spacing: 3px; opacity: 0.5; font-weight: 700; color: white; width: 100%;">
              COMING SOON
            </div>
          `;
    return;
  }

  const captain = yearData.sportsCaptain;
  const yearRange = `${yearData.year}-${yearData.year + 1}`;
  const description =
    captain.description ||
    `As the Sports Captain for ${yearData.year}, he exemplifies the spirit of Bandaranayake College. Leading with integrity, discipline, and an unwavering commitment to sports excellence across all internal houses.`;

  titleContainer.innerHTML = `<h2 class="section-main-title">Sport Captain ${yearData.year}</h2>`;

  cardContainer.innerHTML = `
          <div class="sports-captain-horizontal-card">
            <div class="captain-image-box">
              <img src="${captain.photo}" alt="${captain.name}" onerror="this.src='https://i.ibb.co/xS1WJrFC/New-Project-2-min.png'">
              <div class="captain-image-overlay"></div>
            </div>
            <div class="captain-info-content">
              <h3 class="captain-name-large">${captain.name}</h3>
              <div class="captain-year-badge">ACADEMIC YEAR ${yearRange}</div>
              <p class="captain-description">${description}</p>
            </div>
          </div>
        `;
}

function renderHouseCaptains(yearData) {
  const grid = document.getElementById("house-captains-grid");
  if (!grid || !yearData.houses || Object.keys(yearData.houses).length === 0) {
    if (grid) {
      grid.innerHTML = `
              <div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.5; letter-spacing: 2px;">
                COMING SOON
              </div>
            `;
    }
    return;
  }

  grid.innerHTML = "";

  const houseMap = {
    gemunu: "Gemunu",
    vijaya: "Vijaya",
    parakrama: "Parakrama",
    tissa: "Tissa",
  };

  const houseColors = {
    Gemunu: "#3b82f6",
    Vijaya: "#ef4444",
    Parakrama: "#fbbf24",
    Tissa: "#10b981",
  };

  const housesToShow =
    selectedLeaderHouse === "all"
      ? Object.keys(yearData.houses)
      : [houseMap[selectedLeaderHouse.toLowerCase()] || selectedLeaderHouse];

  housesToShow.forEach((houseName) => {
    const houseData = yearData.houses[houseName];
    if (!houseData) return;

    const houseColor = houseColors[houseName] || "#FFC107";

    // Render all roles for this house
    const roles = [
      { key: "captain", label: "HOUSE CAPTAIN" },
      { key: "assistantCaptain", label: "ASST. CAPTAIN" },
      { key: "secretary", label: "SECRETARY" },
      { key: "assistantSecretary", label: "ASST. SECRETARY" },
      { key: "treasurer", label: "TREASURER" },
    ];

    roles.forEach((role) => {
      if (
        houseData[role.key] &&
        houseData[role.key].name &&
        houseData[role.key].photo
      ) {
        const person = houseData[role.key];
        const card = createLeaderCard(
          person.name,
          role.label,
          houseName,
          person.photo,
          yearData.year,
          houseColor,
        );
        grid.appendChild(card);
      }
    });
  });
}

function renderAwards(yearData) {
  const grid = document.getElementById("awards-grid");
  if (
    !grid ||
    !leadersData.awards ||
    !leadersData.awards.some((a) => a.year === yearData.year)
  ) {
    if (grid) {
      grid.innerHTML = `
              <div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.5; letter-spacing: 2px;">
                COMING SOON
              </div>
            `;
    }
    return;
  }

  grid.innerHTML = "";

  const yearAwards = leadersData.awards.filter((a) => a.year === yearData.year);
  const houseMap = {
    gemunu: "Gemunu",
    vijaya: "Vijaya",
    parakrama: "Parakrama",
    tissa: "Tissa",
  };

  const houseColors = {
    Gemunu: "#3b82f6",
    Vijaya: "#ef4444",
    Parakrama: "#fbbf24",
    Tissa: "#10b981",
  };

  const filteredAwards =
    selectedLeaderHouse === "all"
      ? yearAwards
      : yearAwards.filter(
        (a) =>
          a.house &&
          a.house.toLowerCase() ===
          houseMap[selectedLeaderHouse.toLowerCase()]?.toLowerCase(),
      );

  if (filteredAwards.length > 0) {
    const header = document.createElement("div");
    header.className = "awards-section-header";
    header.innerHTML = `<h2>AWARDS & RECOGNITION</h2>`;
    grid.appendChild(header);

    filteredAwards.forEach((award) => {
      if (award && award.player && award.title && award.house && award.photo) {
        const houseColor = houseColors[award.house] || "#FFC107";
        const card = createLeaderCard(
          award.player,
          award.title.toUpperCase(),
          award.house,
          award.photo,
          yearData.year,
          houseColor,
          true,
          award.description,
        );
        grid.appendChild(card);
      }
    });
  }
}

function createLeaderCard(
  name,
  role,
  house,
  photo,
  year,
  houseColor,
  isAward = false,
  description = "",
) {
  const card = document.createElement("div");
  card.className = isAward ? "leader-card award-card" : "leader-card";

  const yearRange = `${year}-${year + 1}`;

  if (isAward) {
    card.innerHTML = `
            <div class="award-icon-badge"><i class="fas fa-trophy"></i></div>
            <div class="leader-photo-circle" style="border-color: ${houseColor};">
              <img src="${photo}" alt="${name}" onerror="this.src='https://i.ibb.co/xS1WJrFC/New-Project-2-min.png'">
            </div>
            <div class="leader-role-badge award-title-badge" style="background: ${houseColor};">
              ${role}
            </div>
            <h3 class="leader-name award-recipient-name">${name}</h3>
            <p class="award-description-text">${description}</p>
            <div class="leader-year-info">
              <i class="fas fa-university"></i> ${house} House
            </div>
          `;
  } else {
    card.innerHTML = `
            <div class="leader-photo-circle" style="border-color: ${houseColor};">
              <img src="${photo}" alt="${name}" onerror="this.src='https://i.ibb.co/xS1WJrFC/New-Project-2-min.png'">
            </div>
            <div class="leader-role-badge" style="background: ${houseColor};">
              ${role}
            </div>
            <h3 class="leader-name">${name}</h3>
            <div class="leader-year-info">
              <i class="far fa-calendar-alt"></i> ${yearRange} | ${house}
            </div>
          `;
  }

  return card;
}

// Principal Rendering - Similar to Sports Captain card
function renderPrincipal(yearData) {
  const cardContainer = document.getElementById("principal-card-container");
  if (!cardContainer) return;

  if (!yearData.sportsCommittee || yearData.sportsCommittee.length === 0) {
    cardContainer.innerHTML = "";
    return;
  }

  // Get the Principal (first member or role contains 'principal')
  const principal =
    yearData.sportsCommittee.find(
      (member) => member.role.toLowerCase() === "principal",
    ) || yearData.sportsCommittee[0];

  if (!principal) {
    cardContainer.innerHTML = "";
    return;
  }

  // Use principal's message if available, otherwise use default
  const message =
    principal.message ||
    "Under the leadership of our respected Principal, Bandaranayake College continues to excel in sports and athletics, fostering a spirit of teamwork, discipline, and sportsmanship among all students.";

  cardContainer.innerHTML = `
    <div class="principal-horizontal-card">
      <div class="principal-image-box">
        <img src="${principal.photo}" alt="${principal.name}" onerror="this.src='https://i.ibb.co/xS1WJrFC/New-Project-2-min.png'">
        <div class="principal-image-overlay"></div>
      </div>
      <div class="principal-info-content">
        <h3 class="principal-name-large">${principal.name}</h3>
        <div class="principal-role-badge">${principal.role}</div>
        <p class="principal-message">${message}</p>
      </div>
    </div>
  `;
}

// Sports Committee Rendering
function renderSportsCommittee(yearData) {
  const grid = document.getElementById("sports-committee-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // First render the Principal in the horizontal card
  renderPrincipal(yearData);

  if (!yearData.sportsCommittee || yearData.sportsCommittee.length === 0) {
    grid.innerHTML = `
            <div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; font-size: 1.8rem; letter-spacing: 3px; opacity: 0.5; font-weight: 700;">
              COMING SOON
            </div>
          `;
    return;
  }

  // Skip the Principal (first member)
  const members = yearData.sportsCommittee.slice(1);

  // Group members by role
  const deputyPrincipals = members.filter((m) =>
    m.role.toLowerCase().includes("deputy principal"),
  );
  const assistantPrincipals = members.filter((m) =>
    m.role.toLowerCase().includes("assistant principal"),
  );
  const others = members.filter(
    (m) =>
      !m.role.toLowerCase().includes("deputy principal") &&
      !m.role.toLowerCase().includes("assistant principal"),
  );

  // Create row for Deputy Principals (4 columns)
  if (deputyPrincipals.length > 0) {
    const deputyRow = document.createElement("div");
    deputyRow.className = "committee-row deputy-row";
    deputyPrincipals.forEach((member) => {
      // Format role for better display
      const formattedRole = member.role;
      deputyRow.innerHTML += `
        <div class="committee-card deputy-card">
          <div class="committee-photo">
            <img src="${member.photo}" alt="${member.name}" onerror="this.src='https://via.placeholder.com/150'">
          </div>
          <h4 class="committee-name">${member.name}</h4>
          <p class="committee-role">${formattedRole}</p>
        </div>
      `;
    });
    grid.appendChild(deputyRow);
  }

  // Create row for Assistant Principals (3 columns)
  if (assistantPrincipals.length > 0) {
    const assistantRow = document.createElement("div");
    assistantRow.className = "committee-row assistant-row";
    assistantPrincipals.forEach((member) => {
      // Format role for better display
      const formattedRole = member.role;
      assistantRow.innerHTML += `
        <div class="committee-card assistant-card">
          <div class="committee-photo">
            <img src="${member.photo}" alt="${member.name}" onerror="this.src='https://via.placeholder.com/150'">
          </div>
          <h4 class="committee-name">${member.name}</h4>
          <p class="committee-role">${formattedRole}</p>
        </div>
      `;
    });
    grid.appendChild(assistantRow);
  }

  // Create row for others (Sports Administrator, Teachers, etc.)
  if (others.length > 0) {
    const othersRow = document.createElement("div");
    othersRow.className = "committee-row others-row";
    others.forEach((member) => {
      // Format role for better display - specifically "Physical Education Teacher"
      let formattedRole = member.role;

      othersRow.innerHTML += `
        <div class="committee-card">
          <div class="committee-photo">
            <img src="${member.photo}" alt="${member.name}" onerror="this.src='https://via.placeholder.com/150'">
          </div>
          <h4 class="committee-name">${member.name}</h4>
          <p class="committee-role">${formattedRole}</p>
        </div>
      `;
    });
    grid.appendChild(othersRow);
  }
}

// House Masters & Mistresses Rendering
function renderHouseMasters(yearData) {
  const grid = document.getElementById("house-masters-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (
    !yearData.houseMasters ||
    Object.keys(yearData.houseMasters).length === 0
  ) {
    grid.innerHTML = `
            <div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; font-size: 1.8rem; letter-spacing: 3px; opacity: 0.5; font-weight: 700;">
              COMING SOON
            </div>
          `;
    return;
  }

  const houses = ["Vijaya", "Gemunu", "Parakrama", "Tissa"];
  const houseColors = {
    Gemunu: "var(--gemunu-color)",
    Vijaya: "var(--vijaya-color)",
    Parakrama: "var(--parakrama-color)",
    Tissa: "var(--tissa-color)",
  };

  houses.forEach((house) => {
    if (yearData.houseMasters[house]) {
      const houseData = yearData.houseMasters[house];
      const houseColor = houseColors[house];

      const houseCard = document.createElement("div");
      houseCard.className = "house-master-card";
      houseCard.style.borderTop = `4px solid ${houseColor}`;

      houseCard.innerHTML = `
              <div class="house-master-header" style="background: linear-gradient(135deg, ${houseColor}15, transparent);">
                <h3 class="house-master-house-name" style="color: ${houseColor};">${house} House</h3>
              </div>
              <div class="house-master-members">
                <div class="house-master-member">
                  <div class="house-master-photo">
                    <img src="${houseData.master.photo}" alt="${houseData.master.name}" onerror="this.src='https://via.placeholder.com/150'">
                  </div>
                  <h4 class="house-master-name">${houseData.master.name}</h4>
                  <p class="house-master-role">House Master</p>
                </div>
                <div class="house-master-member">
                  <div class="house-master-photo">
                    <img src="${houseData.mistress.photo}" alt="${houseData.mistress.name}" onerror="this.src='https://via.placeholder.com/150'">
                  </div>
                  <h4 class="house-master-name">${houseData.mistress.name}</h4>
                  <p class="house-master-role">House Mistress</p>
                </div>
              </div>
            `;
      grid.appendChild(houseCard);
    }
  });
}

// Student Leaders Rendering
function renderStudentLeaders(yearData) {
  const houseCaptainsGrid = document.getElementById(
    "house-captains-student-grid",
  );
  const sportsCaptainsGrid = document.getElementById(
    "sports-captains-student-grid",
  );

  if (!houseCaptainsGrid || !sportsCaptainsGrid) return;

  houseCaptainsGrid.innerHTML = "";
  sportsCaptainsGrid.innerHTML = "";

  if (
    !yearData.studentLeaders ||
    Object.keys(yearData.studentLeaders).length === 0
  ) {
    houseCaptainsGrid.innerHTML = `
            <div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; font-size: 1.8rem; letter-spacing: 3px; opacity: 0.5; font-weight: 700;">
              COMING SOON
            </div>
          `;
    sportsCaptainsGrid.innerHTML = "";
    return;
  }

  const houses = ["Vijaya", "Gemunu", "Parakrama", "Tissa"];
  const houseColors = {
    Gemunu: "var(--gemunu-color)",
    Vijaya: "var(--vijaya-color)",
    Parakrama: "var(--parakrama-color)",
    Tissa: "var(--tissa-color)",
  };

  houses.forEach((house) => {
    if (yearData.studentLeaders[house]) {
      const leaders = yearData.studentLeaders[house];
      const houseColor = houseColors[house];

      // House Captain Card
      if (leaders.houseCaptain) {
        const captainCard = document.createElement("div");
        captainCard.className = "student-leader-card";
        captainCard.innerHTML = `
                <div class="student-leader-house-badge" style="background: ${houseColor};">
                  ${house}
                </div>
                <div class="student-leader-photo" style="border-color: ${houseColor};">
                  <img src="${leaders.houseCaptain.photo}" alt="${leaders.houseCaptain.name}" onerror="this.src='https://via.placeholder.com/150'">
                </div>
                <h4 class="student-leader-name">${leaders.houseCaptain.name}</h4>
                <p class="student-leader-role">${leaders.houseCaptain.role}</p>
              `;
        houseCaptainsGrid.appendChild(captainCard);
      }

      // Sports Captain Card
      if (leaders.sportsCaptain) {
        const sportsCaptainCard = document.createElement("div");
        sportsCaptainCard.className = "student-leader-card";
        sportsCaptainCard.innerHTML = `
                <div class="student-leader-house-badge" style="background: ${houseColor};">
                  ${house}
                </div>
                <div class="student-leader-photo" style="border-color: ${houseColor};">
                  <img src="${leaders.sportsCaptain.photo}" alt="${leaders.sportsCaptain.name}" onerror="this.src='https://via.placeholder.com/150'">
                </div>
                <h4 class="student-leader-name">${leaders.sportsCaptain.name}</h4>
                <p class="student-leader-role">${leaders.sportsCaptain.role}</p>
              `;
        sportsCaptainsGrid.appendChild(sportsCaptainCard);
      }
    }
  });
}

// Sports Rendering Functions
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "")
    return new Date(0);

  // Handle formats like "2026.01.09", "2026/01/09", "09/01/2026"
  const normalized = dateStr.replace(/\./g, "/");
  const parts = normalized.split("/");

  if (parts.length === 3) {
    const p0 = parseInt(parts[0]);
    const p1 = parseInt(parts[1]);
    const p2 = parseInt(parts[2]);

    if (parts[0].length === 4) {
      // YYYY/MM/DD
      return new Date(p0, p1 - 1, p2);
    } else if (parts[2].length === 4) {
      // DD/MM/YYYY
      return new Date(p2, p1 - 1, p0);
    }
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function getMaxScore(scores) {
  return Math.max(...scores.map((item) => item.score));
}

function renderSports() {
  sportsContainer.innerHTML = "";

  // Filter sports to only show those with at least one score > 0 OR those with a date set
  // For Athletics, also check if any individual event has scores
  const filteredSports = sportsData.sports.filter((sport) => {
    const hasScores = sport.scores.some((s) => s.score > 0);
    const hasDate = sport.date && sport.date.trim() !== "";
    const isHeld = sport.isHeld;

    let hasAthleticsScores = false;
    let hasAthleticsDate = false;

    if (sport.name === "Athletics") {
      hasAthleticsScores = athleticsData.categories.some((cat) =>
        cat.events.some((event) => event.scores.some((s) => s.score > 0)),
      );
      hasAthleticsDate = athleticsData.categories.some((cat) =>
        cat.events.some((event) => event.date && event.date.trim() !== ""),
      );
    }

    const isCompleted = hasScores || hasAthleticsScores;
    const isOngoing = isHeld;
    const isUpcoming = !isHeld && !isCompleted && (hasDate || hasAthleticsDate);

    // Apply the selected filter
    if (currentScoresFilter === "completed") {
      return isCompleted;
    } else if (currentScoresFilter === "ongoing") {
      return isOngoing && !isCompleted;
    } else if (currentScoresFilter === "upcoming") {
      return isUpcoming;
    }

    return isCompleted || isOngoing || isUpcoming;
  });

  if (filteredSports.length === 0) {
    sportsContainer.innerHTML = '<div class="no-data">NO SPORTS</div>';
    return;
  }

  // Sort sports by date:
  // For 'upcoming', show soonest first (ascending)
  // For 'completed' and 'now', show most recent first (descending)
  const sortedSports = [...filteredSports].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    if (currentScoresFilter === "upcoming") {
      return dateA - dateB; // Ascending: soonest first
    } else {
      return dateB - dateA; // Descending: latest first
    }
  });

  sortedSports.forEach((sport) => {
    let currentScores = sport.scores;

    // If Athletics and main scores are 0, use aggregated scores from events
    if (sport.name === "Athletics" && !sport.scores.some((s) => s.score > 0)) {
      const aggregated = [
        { house: "Gemunu", score: 0 },
        { house: "Vijaya", score: 0 },
        { house: "Parakrama", score: 0 },
        { house: "Tissa", score: 0 },
      ];
      athleticsData.categories.forEach((cat) => {
        cat.events.forEach((event) => {
          event.scores.forEach((s) => {
            const h = aggregated.find((as) => as.house === s.house);
            if (h) h.score += s.score;
          });
        });
      });
      currentScores = aggregated;
    }

    const maxScore = getMaxScore(currentScores) || 1;
    const isDataMissing = !currentScores.some((s) => s.score > 0);
    const hasDate = sport.date && sport.date.trim() !== "";

    if (isDataMissing && !hasDate && sport.name !== "Athletics") return;

    const sportCard = document.createElement("div");
    sportCard.className = "sport-card";

    // Add click event for Athletics card
    if (sport.name === "Athletics") {
      sportCard.dataset.sport = "Athletics";
      sportCard.addEventListener("click", () => showAthleticsDetails());
    }

    let sportContent = `
          <div class="sport-header">
            <div class="sport-title-row">
              <div class="sport-title">${sport.name} <i class="fas ${sport.name === "Athletics" ? "fa-external-link-alt" : ""
      }" style="font-size: 0.8em; margin-left: 5px; opacity: 0.7; ${sport.name === "Athletics" ? "" : "display:none;"
      }"></i></div>
              <div class="sport-date">${sport.date}</div>
            </div>
            <div class="sport-subtitle">${sport.venue}</div>
          </div>

          <div class="sport-scores-container" style="position: relative;">
        `;

    const isAthleticsCard = sport.name && sport.name.trim() === "Athletics";

    if (isDataMissing && hasDate) {
      const isHeldPending = sport.isHeld;

      let overlayText = "";
      if (isAthleticsCard) {
        overlayText = `Main Athletics events are scheduled to start on ${sport.date}.<br>
                       <span style="color: var(--theme-bright); font-size: 1.1rem; font-weight: 800; display: block; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px;">Tap to view scheduled dates</span>`;
      } else if (isHeldPending) {
        overlayText = `The game was held on the scheduled date; however,<br> the sports teachers have not yet finalized the official scores.<br>
                       <span class="please-wait-text" style="color: var(--theme-bright); font-size: 1.1rem; font-weight: 800; display: block; margin-top: 12px;">Please wait<span class="dots-animation"></span></span>`;
      } else {
        overlayText = `This event is scheduled to be held on ${sport.date}.<br>
                       <span style="color: var(--theme-bright); font-size: 1.1rem; font-weight: 800; display: block; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px;">GET READY FOR ACTION!</span>`;
      }

      sportContent += `
        <div class="blur-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 15px; padding: 20px;">
          <div style="color: #fff; font-size: 0.95rem; font-weight: 600; line-height: 1.6; text-shadow: 0 2px 8px rgba(0,0,0,0.8); width: 100%;">
            ${overlayText}
          </div>
        </div>
      `;
    }

    // Add scores for each house
    currentScores.forEach((score) => {
      const percentage = (score.score / maxScore) * 100;
      sportContent += `
          <div class="score-item">
            <div class="score-row">
              <div class="house-name ${score.house.toLowerCase()}">${score.house
        }</div>
              <div class="house-score">${score.score}</div>
            </div>
            <div class="progress-container">
              <div class="progress-bar ${score.house.toLowerCase()}" style="width: ${percentage}%"></div>
            </div>
          </div>
          `;
    });

    sportContent += `</div>`; // Close sport-scores-container

    // Add details link for Athletics
    if (sport.name === "Athletics") {
      sportContent += `
            <div class="click-hint" style="font-size: 0.65rem; opacity: 0.6; margin-top: 0.8rem; text-transform: uppercase; letter-spacing: 1px; text-align: right;">
              <i class="fas fa-hand-pointer" style="margin-right: 4px;"></i> Tap to view details
            </div>`;
    }

    sportCard.innerHTML = sportContent;
    sportsContainer.appendChild(sportCard);
  });
}

// Rankings Functions
function calculateTotalPoints() {
  const houses = {
    Vijaya: {
      total: 0,
      color: "vijaya",
    },
    Tissa: {
      total: 0,
      color: "tissa",
    },
    Gemunu: {
      total: 0,
      color: "gemunu",
    },
    Parakrama: {
      total: 0,
      color: "parakrama",
    },
  };

  sportsData.sports.forEach((sport) => {
    let currentScores = sport.scores;
    // If Athletics and main scores are 0, use aggregated scores from events
    if (sport.name === "Athletics" && !sport.scores.some((s) => s.score > 0)) {
      const aggregated = [
        { house: "Gemunu", score: 0 },
        { house: "Vijaya", score: 0 },
        { house: "Parakrama", score: 0 },
        { house: "Tissa", score: 0 },
      ];
      athleticsData.categories.forEach((cat) => {
        cat.events.forEach((event) => {
          event.scores.forEach((s) => {
            const h = aggregated.find((as) => as.house === s.house);
            if (h) h.score += s.score;
          });
        });
      });
      currentScores = aggregated;
    }

    currentScores.forEach((score) => {
      houses[score.house].total += score.score;
    });
  });

  return Object.entries(houses)
    .map(([name, data]) => ({
      name,
      total: data.total,
      color: data.color,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Dynamically updates the website theme based on the leading house
 */
function updateDynamicTheme() {
  const rankings = calculateTotalPoints();
  if (!rankings || rankings.length === 0) return;

  const topScore = rankings[0].total;
  const leaders = rankings.filter((r) => r.total === topScore);

  // Only change theme if the leader has more than 0 points
  if (leaders.length === 0 || topScore === 0) return;

  // Define theme colors for each house
  const themes = {
    Vijaya: {
      bright: "#9e0d0d",
      deep: "#7a0a0a",
      accent: "#f23d3d",
      glow: "rgba(158, 13, 13, 0.4)",
      glowSoft: "rgba(158, 13, 13, 0.2)",
      accent10: "rgba(255, 31, 31, 0.1)",
      accent20: "rgba(255, 31, 31, 0.2)",
      accent50: "rgba(255, 31, 31, 0.5)",
      glass: "rgba(158, 13, 13, 0.15)",
    },
    Gemunu: {
      bright: "#1e40af",
      deep: "#1e3a8a",
      accent: "#3b82f6",
      glow: "rgba(30, 64, 175, 0.4)",
      glowSoft: "rgba(30, 64, 175, 0.2)",
      accent10: "rgba(59, 130, 246, 0.1)",
      accent20: "rgba(59, 130, 246, 0.2)",
      accent50: "rgba(59, 130, 246, 0.5)",
      glass: "rgba(30, 64, 175, 0.15)",
    },
    Parakrama: {
      bright: "#b45309",
      deep: "#92400e",
      accent: "#fbbf24",
      glow: "rgba(180, 83, 9, 0.4)",
      glowSoft: "rgba(180, 83, 9, 0.2)",
      accent10: "rgba(251, 191, 36, 0.1)",
      accent20: "rgba(251, 191, 36, 0.2)",
      accent50: "rgba(251, 191, 36, 0.5)",
      glass: "rgba(180, 83, 9, 0.15)",
    },
    Tissa: {
      bright: "#065f46",
      deep: "#064e3b",
      accent: "#10b981",
      glow: "rgba(6, 95, 70, 0.4)",
      glowSoft: "rgba(6, 95, 70, 0.2)",
      accent10: "rgba(16, 185, 129, 0.1)",
      accent20: "rgba(16, 185, 129, 0.2)",
      accent50: "rgba(16, 185, 129, 0.5)",
      glass: "rgba(6, 95, 70, 0.15)",
    },
  };

  if (leaders.length === 1) {
    // Single leader - use their theme
    applyTheme(themes[leaders[0].name]);
  } else {
    // Tie - Mix the themes of the top two houses
    const theme1 = themes[leaders[0].name];
    const theme2 = themes[leaders[1].name];

    const mixedTheme = {
      bright: theme1.bright,
      deep: theme2.bright, // Using bright color of 2nd house for contrast
      accent: theme1.accent,
      glow: theme1.glow,
      glowSoft: theme2.glow,
      accent10: theme1.accent10,
      accent20: theme2.accent20,
      accent50: theme1.accent50,
      glass: `linear-gradient(135deg, ${theme1.glass}, ${theme2.glass})`,
    };
    applyTheme(mixedTheme);
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (!theme) return;

  // Update CSS Variables dynamically
  root.style.setProperty("--bright-red", theme.bright);
  root.style.setProperty("--deep-red", theme.deep);
  root.style.setProperty("--theme-bright", theme.accent);
  root.style.setProperty("--theme-glow", theme.glow);
  root.style.setProperty("--theme-glow-soft", theme.glowSoft);
  root.style.setProperty("--theme-accent-10", theme.accent10);
  root.style.setProperty("--theme-accent-20", theme.accent20);
  root.style.setProperty("--theme-accent-50", theme.accent50);
  root.style.setProperty("--shadow-glow", `0 0 20px ${theme.glow}`);
  root.style.setProperty("--glass-border", theme.glass);

  // Update meta theme color for browser UI
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme.deep);
  }
}

function renderRankings() {
  // Update theme first based on leaders
  updateDynamicTheme();

  const rankings = calculateTotalPoints();
  rankingsContainer.innerHTML = "";

  if (rankings.length === 0 || rankings.every((h) => h.total === 0)) {
    rankingsContainer.innerHTML = '<div class="no-data">COMING SOON</div>';
    return;
  }

  let currentRank = 1;
  rankings.forEach((house, index) => {
    if (index > 0 && house.total < rankings[index - 1].total) {
      currentRank = index + 1;
    }

    const rankCard = document.createElement("div");
    rankCard.className = `ranking-card ${house.color}-card ${index === 0 ? "highlighted" : ""
      }`;
    rankCard.dataset.house = house.name;
    rankCard.addEventListener("click", () => showHouseDetails(house.name));

    rankCard.innerHTML = `
        <div class="rank-number">Rank #${currentRank}</div>
        <div class="house-ranking ${house.color}">
          <span class="house-icon"><i class="fas fa-home"></i></span>
          <span>${house.name}</span>
        </div>
        <div class="total-score">${house.total}</div>
        <div class="click-hint" style="font-size: 0.65rem; opacity: 0.6; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 1px;"><i class="fas fa-hand-pointer" style="margin-right: 4px;"></i> Tap to view sports</div>
        `;

    rankingsContainer.appendChild(rankCard);
  });
}

// House Details Functions
function showHouseDetails(houseName) {
  showPage(houseDetailsPage);
  houseDetailsTitle.textContent = `${houseName} House Details`;
  renderHouseSports(houseName);
}

function renderHouseSports(houseName) {
  houseSportsContainer.innerHTML = "";

  // Filter sports where the selected house has a score > 0
  // Special handling for Athletics: check aggregated scores if main score is 0
  const houseSports = sportsData.sports
    .filter((sport) => {
      // Find score for this house
      const houseScoreEntry = sport.scores.find((s) => s.house === houseName);
      let score = houseScoreEntry ? houseScoreEntry.score : 0;

      // Special handling for Athletics aggregation
      if (sport.name === "Athletics" && score === 0) {
        let aggregatedScore = 0;
        athleticsData.categories.forEach((cat) => {
          cat.events.forEach((event) => {
            const eventScore = event.scores.find((s) => s.house === houseName);
            if (eventScore) aggregatedScore += eventScore.score;
          });
        });
        score = aggregatedScore;
      }

      return score > 0;
    })
    .map((sport) => {
      // Create a copy of the sport with only the selected house's score
      // We need to potentially update the score for Athletics if it was aggregated
      const houseScoreEntry = sport.scores.find((s) => s.house === houseName);
      let finalScore = houseScoreEntry ? houseScoreEntry.score : 0;

      if (sport.name === "Athletics" && finalScore === 0) {
        let aggregatedScore = 0;
        athleticsData.categories.forEach((cat) => {
          cat.events.forEach((event) => {
            const eventScore = event.scores.find((s) => s.house === houseName);
            if (eventScore) aggregatedScore += eventScore.score;
          });
        });
        finalScore = aggregatedScore;
      }

      return {
        ...sport,
        scores: [{ house: houseName, score: finalScore }],
      };
    })
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  if (houseSports.length === 0) {
    houseSportsContainer.innerHTML = '<div class="no-data">COMING SOON</div>';
    return;
  }

  houseSports.forEach((sport) => {
    const sportCard = document.createElement("div");
    sportCard.className = "sport-card";

    // Make Athletics card clickable
    if (sport.name === "Athletics") {
      sportCard.style.cursor = "pointer";
      sportCard.addEventListener("click", () =>
        showAthleticsDetails(houseName),
      );
      sportCard.setAttribute(
        "title",
        `Click to view Athletics breakdown for ${houseName}`,
      );
    }

    let sportContent = `
        <div class="sport-header">
          <div class="sport-title-row">
            <div class="sport-title">${sport.name} <i class="fas ${sport.name === "Athletics" ? "fa-external-link-alt" : ""
      }" style="font-size: 0.8em; margin-left: 5px; opacity: 0.7; ${sport.name === "Athletics" ? "" : "display:none;"
      }"></i></div>
            <div class="sport-date">${sport.date}</div>
          </div>
          <div class="sport-subtitle">${sport.venue}</div>
        </div>
        `;

    sport.scores.forEach((score) => {
      sportContent += `
          <div class="score-item ${score.house.toLowerCase()}">
            <div class="score-row">
              <div class="house-name ${score.house.toLowerCase()}">${score.house
        }</div>
              <div class="house-score">${score.score}</div>
            </div>
          </div>
          `;
    });

    if (sport.name === "Athletics") {
      sportContent += `
            <div class="click-hint" style="font-size: 0.65rem; opacity: 0.6; margin-top: 0.8rem; text-transform: uppercase; letter-spacing: 1px; text-align: right;">
              <i class="fas fa-hand-pointer" style="margin-right: 4px;"></i> Tap to view details
            </div>`;
    }

    sportCard.innerHTML = sportContent;
    houseSportsContainer.appendChild(sportCard);
  });
}

// Athletics Details Functions
function showAthleticsDetails(houseName = null) {
  athleticsSourceHouse = houseName;

  // Dynamic default filter: Check for events based on whether we are filtering by house
  const hasCompleted = athleticsData.categories.some((cat) =>
    cat.events.some((ev) => {
      if (houseName) {
        const hs = ev.scores.find((s) => s.house === houseName);
        return hs && hs.score > 0;
      }
      return ev.scores.some((s) => s.score > 0);
    }),
  );

  const hasOngoing = athleticsData.categories.some((cat) =>
    cat.events.some((ev) => {
      // For ongoing, we just care if the event isHeld but scores aren't finished
      const evHasScores = ev.scores.some((s) => s.score > 0);
      return ev.isHeld && !evHasScores;
    }),
  );

  let defaultFilter = "upcoming";
  if (hasCompleted) {
    defaultFilter = "completed";
  } else if (hasOngoing) {
    defaultFilter = "ongoing";
  }

  const filterOptions = document.querySelectorAll(
    "#athletics-filter-options .filter-option",
  );
  filterOptions.forEach((opt) => {
    opt.classList.remove("active");
    if (opt.dataset.filter === defaultFilter) opt.classList.add("active");
  });
  currentAthleticsFilter = defaultFilter;

  showPage(athleticsDetailsPage);
  renderAthleticsDetails(houseName);
}

function renderAthleticsDetails(houseName = null) {
  athleticsContainer.innerHTML = "";

  if (!athleticsData.categories || athleticsData.categories.length === 0) {
    athleticsContainer.innerHTML = '<div class="no-data">NO SPORTS</div>';
    return;
  }

  athleticsData.categories.forEach((category) => {
    // Only show category if it has events matching the filter
    const filteredEvents = category.events.filter((event) => {
      // 1. House Filter (if applicable)
      if (houseName) {
        const houseScore = event.scores.find((s) => s.house === houseName);
        if (!houseScore || houseScore.score === 0) return false;
      }

      // 2. Status Filter
      const hasScores = event.scores.some((s) => s.score > 0);
      const hasDate = event.date && event.date.trim() !== "";
      const isHeld = event.isHeld;

      const isEvCompleted = hasScores;
      const isEvOngoing = isHeld;
      const isEvUpcoming = !isHeld && !hasScores && hasDate;

      if (currentAthleticsFilter === "completed") {
        return isEvCompleted;
      } else if (currentAthleticsFilter === "ongoing") {
        return isEvOngoing && !isEvCompleted;
      } else if (currentAthleticsFilter === "upcoming") {
        return isEvUpcoming;
      }

      return isEvCompleted || isEvOngoing || isEvUpcoming;
    });

    if (filteredEvents.length === 0) return;

    // Sort events by date
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if (currentAthleticsFilter === "upcoming") {
        return dateA - dateB; // Ascending: soonest first
      } else {
        return dateB - dateA; // Descending: latest first
      }
    });

    const categoryGroup = document.createElement("div");
    categoryGroup.className = "category-group";

    // Updated Category Header with Accent
    const headerWrapper = document.createElement("div");
    headerWrapper.className = "category-label-wrapper";
    headerWrapper.innerHTML = `
            <div class="category-accent"></div>
            <div class="category-label">${category.name}</div>
          `;
    categoryGroup.appendChild(headerWrapper);

    const categoryEvents = document.createElement("div");
    categoryEvents.className = "category-events";

    sortedEvents.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.className = "event-card";

      // Get max score for progress bar calculation
      const eventMaxScore = Math.max(...event.scores.map((s) => s.score)) || 1;

      // Build new event card HTML
      const isDataMissing = !event.scores.some((s) => s.score > 0);
      const hasDate = event.date && event.date.trim() !== "";

      if (isDataMissing && !hasDate) return;

      let eventContent = `
                <div class="event-header">
                  <div class="event-name">${event.name}</div>
                  <div class="event-date-badge">${event.date || "04/03/2026"}</div>
                </div>
                <div class="event-scores-list" style="position: relative;">
              `;

      if (isDataMissing && hasDate) {
        const isHeldPending = event.isHeld;

        eventContent += `
        <div class="blur-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 12px; padding: 15px;">
          <div style="color: #fff; font-size: 0.85rem; font-weight: 600; line-height: 1.5; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">
            ${isHeldPending
            ? `Scores are being finalized.<br>
                 <span style="color: var(--theme-bright); font-size: 1rem; font-weight: 800; display: block; margin-top: 10px; text-transform: uppercase;">Please wait<span class="dots-animation"></span></span>`
            : `Scheduled to be held on ${event.date || "soon"}.<br>
                 <span style="color: var(--theme-bright); font-size: 1rem; font-weight: 800; display: block; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">GET READY FOR ACTION!</span>`
          }
          </div>
        </div>
      `;
      }

      // Add scores for each house using the progress bar style
      // If houseName provided, only show that house's score
      event.scores.forEach((score) => {
        if (houseName && score.house !== houseName) return;

        const hClass = score.house.toLowerCase();
        const percentage = (score.score / eventMaxScore) * 100;

        eventContent += `
                  <div class="score-item ${hClass}">
                    <div class="score-row">
                      <div class="house-name ${hClass}">${score.house}</div>
                      <div class="house-score">${score.score}</div>
                    </div>
                    <div class="progress-container">
                      <div class="progress-bar ${hClass}" style="width: ${percentage}%"></div>
                    </div>
                  </div>
                `;
      });

      eventContent += `</div>`; // Close event-scores-list

      eventCard.innerHTML = eventContent;
      categoryEvents.appendChild(eventCard);
    });

    categoryGroup.appendChild(categoryEvents);
    athleticsContainer.appendChild(categoryGroup);
  });

  if (athleticsContainer.innerHTML === "") {
    athleticsContainer.innerHTML = '<div class="no-data">NO SPORTS</div>';
  }
}

// Slideshow Functions
function createSlideshow(selectedYear) {
  if (!selectedYear) selectedYear = currentYear.toString();
  slideshowContainer.innerHTML = "";
  slideshowControls.innerHTML = "";

  // Get moments based on category filter
  let allMoments = [];
  if (currentCategory === "bcpas" && bcpasData && bcpasData.moments) {
    allMoments = bcpasData.moments;
  } else if (currentCategory === "bcmu" && bcmuData && bcmuData.moments) {
    allMoments = bcmuData.moments;
  } else if (momentsData && momentsData.moments) {
    allMoments = momentsData.moments;
  }

  const filteredMoments = (
    selectedYear === "All"
      ? allMoments
      : allMoments.filter((m) => m.year.toString() === selectedYear)
  ).sort((a, b) => b.id - a.id);

  if (filteredMoments.length === 0) {
    slideshowContainer.style.display = "none";
    slideshowControls.style.display = "none";
    return;
  }

  slideshowContainer.style.display = "block";
  slideshowControls.style.display = "flex";

  // Create wrapper for slides
  const wrapper = document.createElement("div");
  wrapper.className = "slideshow-wrapper";

  filteredMoments.forEach((moment, index) => {
    const slide = document.createElement("div");
    slide.className = `slideshow-slide ${index === 0 ? "active" : ""
      } skeleton-loading`;

    const imagePath = moment.image || `/api/placeholder/800/400`;
    const houseColor = moment.house.toLowerCase();

    slide.innerHTML = `
          <img
            src="${imagePath}"
            alt="${moment.title}"
            class="slideshow-image img-hidden"
            loading="lazy"
            onload="this.classList.remove('img-hidden'); this.classList.add('img-visible'); this.parentElement.classList.remove('skeleton-loading');"
          >
          <span class="moment-house-badge ${houseColor}">${moment.house}</span>
          <div class="slideshow-caption">
            <div class="slideshow-title">${moment.title}</div>
            <div class="slideshow-description">${moment.description}</div>
          </div>
        `;

    wrapper.appendChild(slide);

    const indicator = document.createElement("div");
    indicator.className = `slideshow-indicator ${index === 0 ? "active" : ""}`;
    indicator.dataset.slideIndex = index;
    indicator.addEventListener("click", () => {
      goToSlide(index);
    });

    slideshowControls.appendChild(indicator);
  });

  // Add arrow buttons
  const prevArrow = document.createElement("button");
  prevArrow.className = "slideshow-arrow prev";
  prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevArrow.addEventListener("click", () => prevSlide());

  const nextArrow = document.createElement("button");
  nextArrow.className = "slideshow-arrow next";
  nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextArrow.addEventListener("click", () => nextSlide());

  slideshowContainer.appendChild(wrapper);
  slideshowContainer.appendChild(prevArrow);
  slideshowContainer.appendChild(nextArrow);

  // Reset to first slide
  currentSlide = 0;
  resetSlideshowTimer();
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".slideshow-slide");
  const indicators = document.querySelectorAll(".slideshow-indicator");

  // Check if slides exist
  if (!slides || slides.length === 0) return;
  if (index < 0 || index >= slides.length) return;

  // Remove all classes
  slides.forEach((slide, i) => {
    slide.classList.remove("active", "prev", "next");
    if (i < index) slide.classList.add("prev");
    if (i > index) slide.classList.add("next");
  });
  indicators.forEach((indicator) => indicator.classList.remove("active"));

  // Add active class
  if (slides[index]) slides[index].classList.add("active");
  if (indicators[index]) indicators[index].classList.add("active");

  currentSlide = index;
  resetSlideshowTimer();
}

function nextSlide() {
  const slides = document.querySelectorAll(".slideshow-slide");
  if (!slides || slides.length === 0) return;
  const nextIndex = (currentSlide + 1) % slides.length;
  goToSlide(nextIndex);
}

function prevSlide() {
  const slides = document.querySelectorAll(".slideshow-slide");
  if (!slides || slides.length === 0) return;
  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  goToSlide(prevIndex);
}

function startSlideshow() {
  if (!slideshowInterval) {
    slideshowInterval = setInterval(nextSlide, slideshowDelay);
  }
}

function stopSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}

function resetSlideshowTimer() {
  stopSlideshow();
  startSlideshow();
}

// Moments Functions
function renderMoments(selectedYear) {
  if (!selectedYear) selectedYear = currentYear.toString();
  momentsContainer.innerHTML = "";

  // Get moments based on category filter
  let allMoments = [];
  if (currentCategory === "bcpas" && bcpasData && bcpasData.moments) {
    allMoments = bcpasData.moments;
  } else if (currentCategory === "bcmu" && bcmuData && bcmuData.moments) {
    allMoments = bcmuData.moments;
  } else if (momentsData && momentsData.moments) {
    allMoments = momentsData.moments;
  }

  const filteredMoments = (
    selectedYear === "All"
      ? allMoments
      : allMoments.filter((m) => m.year.toString() === selectedYear)
  ).sort((a, b) => {
    // Sort by sport/title to group similar events together
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return b.id - a.id; // Secondary sort by ID descending
  });

  if (filteredMoments.length === 0) {
    momentsContainer.innerHTML = '<div class="no-data">COMING SOON</div>';
    return;
  }

  filteredMoments.forEach((moment) => {
    const momentCard = document.createElement("div");
    momentCard.className = "moment-card";

    const imagePath = moment.image || `/api/placeholder/400/200`;
    const houseColor = moment.house.toLowerCase();

    const viewAlbumBtn = moment.album
      ? `<a href="${moment.album}" target="_blank" class="moment-cta-btn">
            <span>View Album</span>
            <i class="fas fa-arrow-right"></i>
          </a>`
      : "";

    momentCard.innerHTML = `
          <div class="moment-image-wrapper skeleton-loading">
            <img
              src="${imagePath}"
              alt="${moment.title}"
              class="moment-image img-hidden"
              loading="lazy"
              onload="this.classList.remove('img-hidden'); this.classList.add('img-visible'); this.parentElement.classList.remove('skeleton-loading');"
            >
            <div class="moment-image-overlay"></div>
            <div class="moment-image-shine"></div>
            <span class="moment-house-badge ${houseColor}">${moment.house}</span>
          </div>
          <div class="moment-content">
            <div class="moment-sport-tag">
              <i class="fas fa-trophy"></i>
              <span>Winning Moment</span>
            </div>
            <h3 class="moment-title">${moment.title}</h3>
            <p class="moment-description">${moment.description}</p>
            <div class="moment-actions">
              ${viewAlbumBtn}
              <span class="moment-category-tag">${moment.category ? "© " + moment.category.toUpperCase() : ""}</span>
            </div>
          </div>
        `;

    momentsContainer.appendChild(momentCard);
  });
}

function setupMomentsFilter() {
  const yearOptions = document.getElementById("moments-year-options");
  if (!yearOptions) return; // Add null check

  const options = yearOptions.querySelectorAll(".filter-option");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      const selectedYear = option.dataset.year;
      renderMoments(selectedYear);
      createSlideshow(selectedYear);
    });
  });
}

function updateCopyrightNotice() {
  const bcpasCopyright = document.getElementById("bcpas-copyright");
  const bcmuCopyright = document.getElementById("bcmu-copyright");

  if (currentCategory === "bcpas") {
    if (bcpasCopyright) bcpasCopyright.style.display = "flex";
    if (bcmuCopyright) bcmuCopyright.style.display = "none";
  } else if (currentCategory === "bcmu") {
    if (bcpasCopyright) bcpasCopyright.style.display = "none";
    if (bcmuCopyright) bcmuCopyright.style.display = "flex";
  } else {
    // Fallback/Default
    if (bcpasCopyright) bcpasCopyright.style.display = "none";
    if (bcmuCopyright) bcmuCopyright.style.display = "none";
  }
}

function setupMomentsCategoryFilter() {
  const categoryOptions = document.getElementById("moments-category-options");
  if (!categoryOptions) return;

  const options = categoryOptions.querySelectorAll(".filter-option");

  // Initial visibility update
  updateCopyrightNotice();

  options.forEach((option) => {
    option.addEventListener("click", async () => {
      options.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      currentCategory = option.dataset.category;

      // Load category data if needed
      await loadCategoryData(currentCategory);

      // Toggle copyright notices based on category
      updateCopyrightNotice();

      // Get current year filter
      const yearOption = document.querySelector(
        "#moments-year-options .filter-option.active",
      );
      const selectedYear = yearOption
        ? yearOption.dataset.year
        : currentYear.toString();

      renderMoments(selectedYear);
      createSlideshow(selectedYear);
    });
  });
}

async function loadCategoryData(category) {
  if (category === "bcpas") {
    if (!bcpasData) {
      try {
        const response = await fetch("data/bcpas.json");
        if (response.ok) {
          bcpasData = await response.json();
        }
      } catch (error) {
        console.error("Error loading BCPAS data:", error);
      }
    }
  }

  if (category === "bcmu") {
    if (!bcmuData) {
      try {
        const response = await fetch("data/bcmu.json");
        if (response.ok) {
          bcmuData = await response.json();
        }
      } catch (error) {
        console.error("Error loading BCMU data:", error);
      }
    }
  }
}

function renderMomentsFilters() {
  const momentsFilter = document.getElementById("moments-year-options");
  if (!momentsFilter || !momentsData || !momentsData.moments) return;

  // Get unique years from momentsData
  const years = [...new Set(momentsData.moments.map((m) => m.year.toString()))];

  // Add currentYear if not in list
  if (currentYear && !years.includes(currentYear.toString())) {
    years.push(currentYear.toString());
  }

  // Sort years descending
  years.sort((a, b) => b - a);

  // Clear filters
  momentsFilter.innerHTML = "";

  // Add year buttons
  years.forEach((year) => {
    const activeClass = year == currentYear ? "active" : "";
    const btn = document.createElement("div");
    btn.className = `filter-option ${activeClass}`;
    btn.dataset.year = year;
    btn.textContent = year;
    momentsFilter.appendChild(btn);
  });

  // Re-setup event listeners
  setupMomentsFilter();
  setupMomentsCategoryFilter();
}

// Analytics Chart Functions
const houseColors = {
  Gemunu: "#3b82f6",
  Vijaya: "#ef4444",
  Parakrama: "#fbbf24",
  Tissa: "#10b981",
};

// Chart Variables
const houseOptions = document.getElementById("house-options");
const sportOptions = document.getElementById("sport-options");
const lineChartBtn = document.getElementById("line-chart-btn");
const barChartBtn = document.getElementById("bar-chart-btn");
const chartDescription = document.getElementById("chart-description");
const chartCanvas = document.getElementById("performance-chart");

let performanceChart = null;
let currentState = {
  selectedHouse: "All Houses",
  selectedSport: "All Sports",
  chartType: "bar",
};

// Filter Options Handler
function setupFilterOptions(container, stateKey) {
  if (!container) return;
  const options = container.querySelectorAll(".filter-pill");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      currentState[stateKey] = option.dataset.value;
      updateChartData();
      updateDescription();
    });
  });
}

// Initialize Chart
function initChart() {
  setupFilterOptions(houseOptions, "selectedHouse");
  setupFilterOptions(sportOptions, "selectedSport");
  updateChartData();
}

// Transform Data for Chart - uses all available years dynamically
function transformData() {
  // Sync 2026 data in historicalData with whatever is in sportsData
  const data2026Index = historicalData.findIndex((item) => item.year === 2026);
  if (data2026Index !== -1 && sportsData.sports.length > 0) {
    const calcRankings = calculateTotalPoints();
    calcRankings.forEach((h) => {
      if (!historicalData[data2026Index][h.name]) {
        historicalData[data2026Index][h.name] = { total: 0 };
      }
      historicalData[data2026Index][h.name].total = h.total;

      // Sync individual sports
      sportsData.sports.forEach((s) => {
        // Map s.name (e.g. "Football") to camelCase key used in historical.json (e.g. "football")
        let sportKey =
          s.name.charAt(0).toLowerCase() + s.name.slice(1).replace(/\s+/g, "");
        // Specific fixes for non-standard mapping if any
        if (s.name.toLowerCase() === "hardball") sportKey = "hardball";
        if (s.name.toLowerCase() === "road race") sportKey = "roadRace";
        if (s.name.toLowerCase() === "tag rugby") sportKey = "tagRugby";
        if (s.name.toLowerCase() === "table tennis") sportKey = "tableTennis";
        if (s.name.toLowerCase() === "best house design")
          sportKey = "bestHouseDesign";

        const score = s.scores.find((sc) => sc.house === h.name)?.score || 0;

        historicalData[data2026Index][h.name][sportKey] = score;
      });
    });
  }

  // Use all available years from historicalData (sorted ascending)
  const sortedData = [...historicalData].sort((a, b) => a.year - b.year);
  const labels = sortedData.map((item) => item.year);
  const datasets = [];

  const houses =
    currentState.selectedHouse === "All Houses"
      ? ["Gemunu", "Vijaya", "Parakrama", "Tissa"]
      : [currentState.selectedHouse];

  houses.forEach((house) => {
    const data = sortedData.map((yearData) => {
      if (!yearData[house]) return 0;
      return currentState.selectedSport === "All Sports"
        ? yearData[house].total
        : yearData[house][currentState.selectedSport] || 0;
    });

    datasets.push({
      label: house,
      data: data,
      backgroundColor: houseColors[house] + "80",
      borderColor: houseColors[house],
      borderWidth: 3,
      pointBackgroundColor: houseColors[house],
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: currentState.chartType === "line" ? false : true,
    });
  });

  return { labels, datasets };
}

// Update Chart Data
function updateChartData() {
  if (!chartCanvas) return;
  const chartData = transformData();
  const hasData = chartData.datasets.some((ds) =>
    ds.data.some((val) => val > 0),
  );

  if (performanceChart) {
    performanceChart.destroy();
  }

  const ctx = chartCanvas.getContext("2d");

  if (!hasData) {
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    updateDescription(true);
    return;
  }

  performanceChart = new Chart(ctx, {
    type: currentState.chartType,
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#ffffff",
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#ffffff",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Year",
            color: "#ffffff",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#ffffff",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Points",
            color: "#ffffff",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#ffffff",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });

  // Refresh the description text
  updateDescription();
}

// Update Chart Description
function updateDescription(noData = false) {
  const descriptionText = document.getElementById("chart-description-text");
  if (!descriptionText) return;

  if (noData) {
    descriptionText.textContent =
      "Historical performance data is currently unavailable for the selected filters.";
    return;
  }

  const houseText =
    currentState.selectedHouse === "All Houses"
      ? "performance of all houses"
      : `${currentState.selectedHouse} house's performance`;

  const sportText =
    currentState.selectedSport === "All Sports"
      ? "overall points"
      : currentState.selectedSport;

  // Calculate years dynamically from historicalData
  const years = historicalData.map((item) => item.year).sort((a, b) => a - b);
  const yearCount = years.length;
  const timeText =
    yearCount === 1
      ? `year ${years[0]}`
      : `${yearCount} years (${years[0]}-${years[years.length - 1]})`;

  descriptionText.textContent = `This chart shows the ${houseText} in ${sportText} over ${timeText}.`;
}

barChartBtn.addEventListener("click", () => {
  currentState.chartType = "bar";
  barChartBtn.classList.add("active");
  lineChartBtn.classList.remove("active");
  updateChartData();
});
// Chart Type Toggle Event Listeners
lineChartBtn.addEventListener("click", () => {
  currentState.chartType = "line";
  lineChartBtn.classList.add("active");
  barChartBtn.classList.remove("active");
  updateChartData();
});

// Update Analytics Stats (uses current data from sportsData)
function updateAnalyticsStats() {
  const rankings = calculateTotalPoints();
  const leader = rankings[0];
  const totalPoints = rankings.reduce((sum, house) => sum + house.total, 0);
  const sportsCount = sportsData.sports.length;

  const leaderEl = document.getElementById("stat-leader");
  const totalPointsEl = document.getElementById("stat-total-points");
  const sportsCountEl = document.getElementById("stat-sports-count");

  if (leaderEl) leaderEl.textContent = leader.name;
  if (totalPointsEl) totalPointsEl.textContent = totalPoints.toLocaleString();
  if (sportsCountEl) sportsCountEl.textContent = sportsCount;
}

// Application State & Configuration
let currentYear = 2026;
let siteConfig = null;

// Analytics Variables
let currentYearChart = null;
let sportBreakdownChart = null;
let yearDataCache = {};
let activeYearData = null;
const currentYearChartCanvas = document.getElementById("current-year-chart");
const sportBreakdownChartCanvas = document.getElementById(
  "sport-breakdown-chart",
);
const rankingsTableBody = document.getElementById("rankings-table-body");
const sportFilterButtons = document.getElementById("sport-filter-buttons");
let selectedSport = "";

// Load Basic Config
async function loadBasicConfig() {
  try {
    const response = await fetch("data/basic.json");
    if (response.ok) {
      siteConfig = await response.json();
      applyBasicConfig();
    }
  } catch (error) {
    console.error("Error loading basic config:", error);
  }
}

function applyBasicConfig() {
  if (!siteConfig) return;

  // Update Global Variable
  currentYear = siteConfig.currentYear;

  // Update Title & Meta
  document.title = `${siteConfig.siteName} ${currentYear} | Live Scores & Results`;
  const metaTitle = document.querySelector('meta[name="title"]');
  if (metaTitle)
    metaTitle.content = `${siteConfig.siteName} ${currentYear} | Live Scores & Results`;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.content = siteConfig.meta.description;

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) metaKeywords.content = siteConfig.meta.keywords;

  // Update OG & Twitter Titles
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle)
    ogTitle.content = `${siteConfig.siteName} ${currentYear} - Live Daily Updates`;
  const twTitle = document.querySelector('meta[property="twitter:title"]');
  if (twTitle) twTitle.content = `${siteConfig.siteName} ${currentYear} Live`;

  // Update Favicons & Icons
  if (siteConfig.assets && siteConfig.assets.favicon) {
    const favicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
    if (favicon32) favicon32.href = siteConfig.assets.favicon;
    const favicon16 = document.querySelector('link[rel="icon"][sizes="16x16"]');
    if (favicon16) favicon16.href = siteConfig.assets.favicon;
    const appleTouchIcons = document.querySelectorAll(
      'link[rel="apple-touch-icon"]',
    );
    appleTouchIcons.forEach((icon) => (icon.href = siteConfig.assets.favicon));
  }

  // Update OG & Twitter Meta
  if (siteConfig.assets && siteConfig.assets.ogImage) {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.content = siteConfig.assets.ogImage;
    const twImg = document.querySelector('meta[property="twitter:image"]');
    if (twImg) twImg.content = siteConfig.assets.ogImage;
  }

  // Update Header
  const headerTitle = document.querySelector(".header-title");
  if (headerTitle) headerTitle.textContent = `InterHouse Sports ${currentYear}`;

  const headerSubtitle = document.querySelector(".header-subtitle");
  if (headerSubtitle && siteConfig.ui.headerSubtitle)
    headerSubtitle.textContent = siteConfig.ui.headerSubtitle;

  // Update Brand Icons
  if (siteConfig.assets.profileIcon) {
    const profileIcon = document.querySelector(".profile-icon");
    if (profileIcon)
      profileIcon.style.backgroundImage = `url("${siteConfig.assets.profileIcon}")`;
  }
  if (siteConfig.assets.clubIcon) {
    const clubIcon = document.querySelector(".club-icon");
    if (clubIcon)
      clubIcon.style.backgroundImage = `url("${siteConfig.assets.clubIcon}")`;
  }

  // Update Share Button
  const shareBtn = document.querySelector(".share-pwa-btn");
  if (shareBtn) {
    shareBtn.setAttribute(
      "onclick",
      `PWANextLevel.shareContent('${siteConfig.siteName} ${currentYear}', 'Follow ${siteConfig.siteName} ${currentYear} live updates!', window.location.href)`,
    );
  }

  // Update Loading Status
  const loadingStatus = document.getElementById("loadingStatus");
  if (loadingStatus && siteConfig.ui.loadingText)
    loadingStatus.textContent = siteConfig.ui.loadingText;

  // Update Footer Branding
  const footerBranding = document.querySelector(".footer-branding");
  if (footerBranding) footerBranding.textContent = `SportMeet ${currentYear}`;

  // Update Copyright Year & Link
  const footerBottom = document.querySelector(".footer-bottom span");
  if (footerBottom) {
    footerBottom.innerHTML = `© ${currentYear} ${siteConfig.footer} <a class="officialweblink" href="${siteConfig.social.website}">Coding Club</a>. All rights reserved.`;
  }

  // Update Last Update Date
  if (siteConfig.dates && siteConfig.dates.lastUpdate) {
    const lastUpdateDate = document.getElementById("last-update-date");
    if (lastUpdateDate) {
      lastUpdateDate.textContent = siteConfig.dates.lastUpdate;
    }
  }

  // Update Social Links
  if (siteConfig.social) {
    const footerSocials = document.querySelector(".footer-socials");
    if (footerSocials) {
      const wa = footerSocials.querySelector(".whatsapp");
      if (wa) wa.href = siteConfig.social.whatsapp;
      const fb = footerSocials.querySelector(".facebook");
      if (fb) fb.href = siteConfig.social.facebook;
      const ins = footerSocials.querySelector(".instagram");
      if (ins) ins.href = siteConfig.social.instagram;
    }

    // Also update the Coding Club Official Hub section if it exists
    const socialPlatforms = document.querySelector(".social-platforms");
    if (socialPlatforms) {
      const wa = socialPlatforms.querySelector(".whatsapp");
      if (wa) wa.href = siteConfig.social.whatsapp;
      const fb = socialPlatforms.querySelector(".facebook");
      if (fb) fb.href = siteConfig.social.facebook;
      const ins = socialPlatforms.querySelector(".instagram");
      if (ins) ins.href = siteConfig.social.instagram;
    }
  }

  // Update Page Titles & Subtitles in Heroes
  document
    .querySelectorAll(
      ".page-title, .page-subtitle, .header-title, .footer-branding, .footer-bottom span, .logo-text, .stat-value, .card-header-badge",
    )
    .forEach((el) => {
      if (el.textContent.includes("2026")) {
        el.textContent = el.textContent.replace(/2026/g, currentYear);
      }
      if (el.textContent.includes("2025") && currentYear != 2025) {
        el.textContent = el.textContent.replace(/2025/g, currentYear);
      }
    });

  // Update JSON-LD
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      data.name = `${siteConfig.siteName} ${currentYear}`;
      data.description = siteConfig.meta.description;
      data.organizer.name = siteConfig.organizer;
      data.location.name = siteConfig.location;
      if (siteConfig.assets.ogImage) data.image = [siteConfig.assets.ogImage];
      jsonLd.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      console.error("Error updating JSON-LD:", e);
    }
  }
}

// Load Year Data from JSON
async function loadYearData(year) {
  if (yearDataCache[year]) {
    return yearDataCache[year];
  }

  try {
    const response = await fetch(`data/${year}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${year}.json`);
    }
    const data = await response.json();
    yearDataCache[year] = data;
    return data;
  } catch (error) {
    console.error(`Error loading data for year ${year}:`, error);
    return null;
  }
}

function populateSportFilterButtons(yearData) {
  if (!sportFilterButtons || !yearData || !yearData.sports) return;

  // Filter sports to only show those with at least one score > 0
  const activeSports = yearData.sports.filter((sport) =>
    sport.scores.some((s) => s.score > 0),
  );

  if (activeSports.length === 0) {
    sportFilterButtons.innerHTML =
      '<div class="no-data-small">No data yet</div>';
    return;
  }

  sportFilterButtons.innerHTML = "";

  // Add "All Sports" button first
  const allBtn = document.createElement("button");
  allBtn.className = "sport-filter-btn active";
  allBtn.dataset.sport = "";
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => handleSportFilter("", yearData));
  sportFilterButtons.appendChild(allBtn);

  activeSports.forEach((sport) => {
    const btn = document.createElement("button");
    btn.className = "sport-filter-btn";
    btn.dataset.sport = sport.id;
    btn.textContent = sport.name;
    btn.addEventListener("click", () => handleSportFilter(sport.id, yearData));
    sportFilterButtons.appendChild(btn);
  });
}

// Handle Sport Filter Button Click
function handleSportFilter(sportId, yearData) {
  selectedSport = sportId;

  // Update active state
  const buttons = sportFilterButtons.querySelectorAll(".sport-filter-btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.sport === sportId) {
      btn.classList.add("active");
    }
  });

  updateSportBreakdownChart(yearData, sportId);
}

// Update Current Year Analytics (always 2026)
async function updateCurrentYearAnalytics() {
  const yearData = await loadYearData(currentYear);

  if (!yearData) {
    console.error("No data available for 2026");
    return;
  }

  current2026Data = yearData;
  updateCurrentYearStats(yearData);
  updateCurrentYearChart(yearData);
  populateSportFilterButtons(yearData);
  updateSportBreakdownChart(yearData, "");
  updateRankingsTable(yearData);
}

// Get current year historical data from global historicalData array
function getActiveYearHistoricalData() {
  const dataHistorical = historicalData.find(
    (item) => item.year === currentYear,
  );
  return dataHistorical || null;
}

// Update Current Year Stats Cards
function updateCurrentYearStats(yearData) {
  const rankings = calculateTotalPoints();

  const totalPoints = rankings.reduce((sum, house) => sum + house.total, 0);
  const leader = totalPoints > 0 ? rankings[0] : { name: "--", total: 0 };

  // Only count sports that have at least one score recorded
  const activeSportsCount = yearData.sports
    ? yearData.sports.filter((sport) => sport.scores.some((s) => s.score > 0))
      .length
    : 0;

  const leaderEl = document.getElementById("stat-leader");
  const totalPointsEl = document.getElementById("stat-total-points");
  const sportsCountEl = document.getElementById("stat-sports-count");

  if (leaderEl) {
    leaderEl.textContent = leader.name;
  }
  if (totalPointsEl) totalPointsEl.textContent = totalPoints.toLocaleString();
  if (sportsCountEl) sportsCountEl.textContent = activeSportsCount;
}

// Update Current Year Chart
function updateCurrentYearChart(yearData) {
  if (!currentYearChartCanvas) return;

  const rankings = calculateTotalPoints();
  const totalPoints = rankings.reduce((sum, r) => sum + r.total, 0);

  if (currentYearChart) {
    currentYearChart.destroy();
  }

  const ctx = currentYearChartCanvas.getContext("2d");

  if (totalPoints === 0) {
    ctx.clearRect(
      0,
      0,
      currentYearChartCanvas.width,
      currentYearChartCanvas.height,
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 20px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "COMING SOON",
      currentYearChartCanvas.width / 2,
      currentYearChartCanvas.height / 2,
    );
    return;
  }

  const houses = rankings.map((r) => r.name);
  const totals = rankings.map((r) => r.total);

  currentYearChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: houses,
      datasets: [
        {
          label: `Total Points ${currentYear}`,
          data: totals,
          backgroundColor: houses.map((h) => houseColors[h] + "80"),
          borderColor: houses.map((h) => houseColors[h]),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "House",
            color: "#ffffff",
            font: { size: 14, weight: "bold" },
          },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "#ffffff" },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total Points",
            color: "#ffffff",
            font: { size: 14, weight: "bold" },
          },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "#ffffff" },
        },
      },
    },
  });
}

// Update Sport Breakdown Chart - shows individual sport scores when selected
function updateSportBreakdownChart(yearData, selectedSportId) {
  if (!sportBreakdownChartCanvas) return;

  const houses = ["Gemunu", "Vijaya", "Parakrama", "Tissa"];

  if (sportBreakdownChart) {
    sportBreakdownChart.destroy();
  }

  // If no sport selected, show message
  if (!selectedSportId) {
    const ctx = sportBreakdownChartCanvas.getContext("2d");
    ctx.clearRect(
      0,
      0,
      sportBreakdownChartCanvas.width,
      sportBreakdownChartCanvas.height,
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 18px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Please Select a Sport",
      sportBreakdownChartCanvas.width / 2,
      sportBreakdownChartCanvas.height / 2,
    );
    return;
  }

  // Find the selected sport from sports array
  const selectedSport = yearData.sports.find(
    (sport) => sport.id === selectedSportId,
  );

  if (!selectedSport) {
    console.error("Sport not found:", selectedSportId);
    return;
  }

  // Get scores for each house from the sports array
  const scores = houses.map((house) => {
    const houseScore = selectedSport.scores.find((s) => s.house === house);
    return houseScore ? houseScore.score : 0;
  });

  const hasScores = scores.some((s) => s > 0);
  const ctx = sportBreakdownChartCanvas.getContext("2d");

  if (!hasScores) {
    ctx.clearRect(
      0,
      0,
      sportBreakdownChartCanvas.width,
      sportBreakdownChartCanvas.height,
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 20px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "COMING SOON",
      sportBreakdownChartCanvas.width / 2,
      sportBreakdownChartCanvas.height / 2,
    );
    return;
  }

  sportBreakdownChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: houses,
      datasets: [
        {
          label: selectedSport.name,
          data: scores,
          backgroundColor: houses.map((house) => houseColors[house] + "80"),
          borderColor: houses.map((house) => houseColors[house]),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${selectedSport.name} - House Scores`,
          color: "#ffffff",
          font: { size: 16, weight: "bold" },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "House",
            color: "#ffffff",
            font: { size: 14, weight: "bold" },
          },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "#ffffff" },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Points",
            color: "#ffffff",
            font: { size: 14, weight: "bold" },
          },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "#ffffff" },
        },
      },
    },
  });
}

// Update Rankings Table
function updateRankingsTable(yearData) {
  if (!rankingsTableBody) return;

  const currentSports =
    yearData && yearData.sports ? yearData.sports : sportsData.sports;
  const rankings = calculateTotalPoints(); // Already sorted [{name, total, color}, ...]
  const totalPoints = rankings.reduce((sum, r) => sum + r.total, 0);

  if (totalPoints === 0) {
    rankingsTableBody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; padding: 3rem; opacity: 0.5; letter-spacing: 2px;">
                COMING SOON
              </td>
            </tr>
          `;
    return;
  }

  const tableHTML = rankings
    .map((houseData, index) => {
      let topSportName = "N/A";
      let maxScore = -1;

      if (currentSports && Array.isArray(currentSports)) {
        currentSports.forEach((sport) => {
          if (!sport.scores) return;
          const houseScoreObj = sport.scores.find(
            (s) => s.house === houseData.name,
          );
          const score = houseScoreObj ? houseScoreObj.score : 0;

          if (score > 0 && score > maxScore) {
            maxScore = score;
            topSportName = sport.name || sport.id || "N/A";
          }
        });
      }

      const colorClass = houseData.name.toLowerCase();
      return `
            <tr class="rank-row-${colorClass}">
              <td class="rank-cell"><span class="rank-badge">#${index + 1
        }</span></td>
              <td class="house-cell">
                <div class="table-house-info">
                  <span class="house-indicator ${colorClass}"></span>
                  <strong>${houseData.name}</strong>
                </div>
              </td>
              <td class="points-cell"><strong>${houseData.total.toLocaleString()}</strong></td>
              <td class="top-sport-cell">${topSportName}</td>
            </tr>
          `;
    })
    .join("");

  rankingsTableBody.innerHTML = tableHTML;
}

// Format Sport Name
function formatSportName(sport) {
  const sportNames = {
    bestHouseDesign: "Best House Design",
    karate: "Karate",
    tableTennis: "Table Tennis",
    hardball: "Hardball",
    wrestling: "Wrestling",
    boxing: "Boxing",
    football: "Football",
    athletics: "Athletics",
    swimming: "Swimming",
    tagRugby: "Tag Rugby",
    roadRace: "Road Race",
    badminton: "Badminton",
    chess: "Chess",
    volleyball: "Volleyball",
    elle: "Elle",
    hockey: "Hockey",
    softball: "Softball",
    basketball: "Basketball",
  };
  return sportNames[sport] || sport;
}

function getColoredHouseName(name) {
  if (!name) return "";
  const houses = ["Vijaya", "Gemunu", "Parakrama", "Tissa"];
  let coloredName = name;
  houses.forEach((house) => {
    const regex = new RegExp(house, "gi");
    coloredName = coloredName.replace(
      regex,
      `<span class="house-text-${house.toLowerCase()}">$&</span>`,
    );
  });
  return coloredName;
}

// Summary Data Logic
let summaryYears = [];
let summaryCache = {};

async function loadSummaryData() {
  try {
    const response = await fetch("data/historical.json");
    if (response.ok) {
      const histData = await response.json();
      summaryYears = histData.map((item) => item.year).sort((a, b) => b - a);
      renderSummaryFilters();
      if (summaryYears.length > 0) {
        renderSummary(summaryYears[0]);
      }
    }
  } catch (error) {
    console.error("Error loading summary data:", error);
  }
}

function renderSummaryFilters() {
  const container = document.getElementById("summary-year-options");
  if (!container) return;

  container.innerHTML = "";
  summaryYears.forEach((year, index) => {
    const btn = document.createElement("button");
    btn.className = `filter-pill ${index === 0 ? "active" : ""}`;
    btn.innerHTML = `<span>${year}</span>`;
    btn.onclick = () => {
      container
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderSummary(year);
    };
    container.appendChild(btn);
  });
}

async function renderSummary(year) {
  const container = document.getElementById("summary-content-body");
  const titleEl = document.getElementById("summary-section-title");
  if (!container) return;

  if (titleEl)
    titleEl.textContent = `${year} InterHouse Sportsmeet Champion List`;
  container.innerHTML = '<div class="loading-small">Processing Data...</div>';

  let yearData = null;

  if (year === currentYear && activeYearData) {
    yearData = activeYearData;
  } else if (summaryCache[year]) {
    yearData = summaryCache[year];
  } else {
    try {
      const response = await fetch(`data/${year}.json`);
      if (response.ok) {
        yearData = await response.json();
        summaryCache[year] = yearData;
      }
    } catch (e) {
      container.innerHTML = `<div class="no-data">Error loading ${year} data</div>`;
      return;
    }
  }

  if (!yearData) {
    container.innerHTML = `<div class="no-data">No data found for ${year}</div>`;
    return;
  }

  const calculatedSports = [];
  if (yearData.sports) {
    yearData.sports.forEach((sport) => {
      const activeScores = sport.scores.filter((s) => s.score > 0);
      if (activeScores.length > 0) {
        const sorted = [...sport.scores].sort((a, b) => b.score - a.score);
        const maxScore = sorted[0].score;
        const champions = sorted
          .filter((s) => s.score === maxScore)
          .map((s) => s.house)
          .join("/");

        const runnerUpScores = sorted.filter(
          (s) => s.score < maxScore && s.score > 0,
        );
        let runnersUp = "N/A";
        if (runnerUpScores.length > 0) {
          const secondMax = runnerUpScores[0].score;
          runnersUp = runnerUpScores
            .filter((s) => s.score === secondMax)
            .map((s) => s.house)
            .join("/");
        }

        calculatedSports.push({
          name: sport.name,
          champions: champions,
          runnersUp: runnersUp,
        });
      }
    });
  }

  let html = `<div class="summary-grid">`;

  if (calculatedSports.length === 0) {
    html += `<div class="no-data-small" style="grid-column: 1/-1;">No completed sports results recorded for this year.</div>`;
  } else {
    calculatedSports.forEach((sport) => {
      html += `
              <div class="summary-item-card">
                <div class="summary-item-title"><b>${sport.name}</b></div>
                <div class="summary-row">
                  <span class="summary-label">Champions</span>
                  <span class="summary-value">${getColoredHouseName(sport.champions)}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Runners-up</span>
                  <span class="summary-value">${getColoredHouseName(sport.runnersUp)}</span>
                </div>
              </div>
            `;
    });
  }
  html += `</div>`;

  if (yearData.bestAthletes && yearData.bestAthletes.length > 0) {
    html += `
            <div class="best-athletes-card-wrapper">
              <div class="best-athletes-card">
                <div class="best-athletes-title">
                  <i class="fas fa-trophy"></i>
                  <span>Best Athletes ${year}</span>
                </div>
                <div class="athlete-grid">
          `;

    yearData.bestAthletes.forEach((athlete) => {
      html += `
                <div class="athlete-pill">
                  <div class="athlete-cat">${getColoredHouseName(athlete.category)}</div>
                  <div class="athlete-name">${getColoredHouseName(athlete.name)}</div>
                </div>
              `;
    });

    html += `
                </div>
              </div>
            </div>
          `;
  }

  container.innerHTML = html;
}

// Initialize Current Year Analytics (2026 only)
async function initCurrentYearAnalytics() {
  await updateCurrentYearAnalytics();
}

// Global data variables (loaded from JSON)
let sportsData = { sports: [] };
let athleticsData = { categories: [] };
let historicalData = [];

// Load data from JSON file
async function loadSportsData() {
  try {
    // Load current year data from basic.json currentYear
    const response = await fetch(`data/${currentYear}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${currentYear}.json`);
    }
    const data = await response.json();
    sportsData = { sports: data.sports || [] };
    athleticsData = { categories: data.athletics?.categories || [] };

    // Trigger PWA Badge update
    window.dispatchEvent(
      new CustomEvent("data-updated", {
        detail: { count: sportsData.sports.length },
      }),
    );

    // Load historical data
    try {
      const histResponse = await fetch("data/historical.json");
      if (histResponse.ok) {
        historicalData = await histResponse.json();
      }
    } catch (histError) {
      console.log("No historical data available");
      historicalData = [];
    }

    return data;
  } catch (error) {
    console.error(`Error loading sports data for ${currentYear}:`, error);
    return null;
  }
}

// Initialize Application
async function initializeApp() {
  await loadBasicConfig();
  await loadSportsData();
  await loadMomentsData(); // This now loads momentsData, bcpasData, and bcmuData
  await loadLeadersData();
  setupScoresFilter();
  setupAthleticsFilter();

  // Stagger initialization to prevent single long task blocking the loader animation
  const tasks = [
    () => renderSports(),
    () => renderRankings(),
    () => {
      // Initialize moments with Mix category (default)
      setupMomentsFilter();
      setupMomentsCategoryFilter();
      renderMoments(currentYear.toString());

      // Hide copyright notices for Mix initially (both hidden)
      const bcpasCopyright = document.getElementById("bcpas-copyright");
      const bcmuCopyright = document.getElementById("bcmu-copyright");
      if (bcpasCopyright) bcpasCopyright.style.display = "none";
      if (bcmuCopyright) bcmuCopyright.style.display = "none";
    },
    () => renderMomentsFilters(),
    () => createSlideshow(currentYear.toString()),
    () => updateAnalyticsStats(),
    () => initCurrentYearAnalytics(),
    () => initChart(),
    () => loadSummaryData(),
    () => {
      showPage(leaderboardPage);
      setActiveTab(leaderboardTab);
    },
  ];

  for (const task of tasks) {
    await new Promise((resolve) =>
      setTimeout(() => {
        task();
        resolve();
      }, 0),
    );
  }

  // Final theme check after all data points are loaded
  updateDynamicTheme();
}

// Start the application when DOM is loaded
// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);

// Handle Footer Links Navigation
// Handle Footer Links Navigation (Robust Event Delegation)
document.addEventListener("click", (e) => {
  const link = e.target.closest(".footer-nav-link");
  if (link) {
    e.preventDefault();
    const targetId = link.dataset.target;
    const targetTab = document.getElementById(targetId);

    if (targetTab) {
      targetTab.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
});
// Quick Navigation Event Listeners
document.getElementById("quick-nav-scores")?.addEventListener("click", () => {
  showPage(scoresPage);
  setActiveTab(scoresTab);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("quick-nav-moments")?.addEventListener("click", () => {
  showPage(momentsPage);
  setActiveTab(momentsTab);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document
  .getElementById("quick-nav-analytics")
  ?.addEventListener("click", () => {
    showPage(analyticsPage);
    setActiveTab(analyticsTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

document.getElementById("quick-nav-leaders")?.addEventListener("click", () => {
  showPage(leadersPage);
  setActiveTab(leadersTab);
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderLeaders();
});

document
  .getElementById("quick-nav-historical")
  ?.addEventListener("click", () => {
    showPage(analyticsPage);
    setActiveTab(analyticsTab);

    // Scroll to historical section after a short delay
    setTimeout(() => {
      const historicalSection = document.querySelector(
        ".analytics-card.card-historical",
      );
      if (historicalSection) {
        historicalSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);
  });

document.getElementById("quick-nav-summary")?.addEventListener("click", () => {
  showPage(analyticsPage);
  setActiveTab(analyticsTab);

  // Scroll to summary section after a short delay
  setTimeout(() => {
    const summarySection = document.querySelector(
      ".analytics-card.card-summary",
    );
    if (summarySection) {
      summarySection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, 300);
});

// ============================================
// TYPING ANIMATION FUNCTIONALITY
// ============================================
function initTypingAnimation() {
  const typingElements = document.querySelectorAll(".typing-text");

  // Create an Intersection Observer to trigger animations when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;

          // Get the full text
          const fullText = element.textContent.trim();

          // Clear the element
          element.textContent = "";
          element.style.whiteSpace = "nowrap";
          element.style.overflow = "hidden";
          element.style.borderRight = "3px solid var(--bright-red)";

          // Calculate typing speed based on text length
          const baseSpeed = 30; // milliseconds per character
          const speed = Math.max(15, Math.min(50, baseSpeed));

          let charIndex = 0;

          // Typing effect
          const typingInterval = setInterval(() => {
            if (charIndex < fullText.length) {
              element.textContent += fullText.charAt(charIndex);
              charIndex++;
            } else {
              clearInterval(typingInterval);

              // Remove cursor and allow text wrapping after typing completes
              setTimeout(() => {
                element.style.whiteSpace = "normal";
                element.style.borderRight = "none";
                element.classList.add("typing-complete");
              }, 500);
            }
          }, speed);

          // Stop observing this element
          observer.unobserve(element);
        }
      });
    },
    {
      threshold: 0.2, // Trigger when 20% of element is visible
      rootMargin: "0px 0px -100px 0px", // Start animation slightly before element enters viewport
    },
  );

  // Observe all typing elements
  typingElements.forEach((element) => {
    observer.observe(element);
  });
}

// Initialize typing animation when leaderboard is shown
leaderboardTab.addEventListener("click", () => {
  setTimeout(() => {
    initTypingAnimation();
  }, 300); // Small delay to ensure page is rendered
});

// Also initialize on page load if leaderboard is the default page
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initTypingAnimation();
  }, 1000); // Wait for initial page load
});

// getHouseColor utility function for Leaders page styling
function getHouseColor(house) {
  const root = document.documentElement;
  const colorMap = {
    Vijaya:
      getComputedStyle(root).getPropertyValue("--vijaya-color").trim() ||
      "#ef4444",
    Gemunu:
      getComputedStyle(root).getPropertyValue("--gemunu-color").trim() ||
      "#3b82f6",
    Parakrama:
      getComputedStyle(root).getPropertyValue("--parakrama-color").trim() ||
      "#fbbf24",
    Tissa:
      getComputedStyle(root).getPropertyValue("--tissa-color").trim() ||
      "#10b981",
  };
  return colorMap[house] || "#999";
}
