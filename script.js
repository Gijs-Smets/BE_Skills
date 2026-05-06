const url = "http://127.0.0.1:8000/achievements";

function getAchievements() {
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      let cards = "";

      result.Achievements.forEach((achievement) => {
        cards += `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${achievement.title}</h5>
              <span class="badge">${achievement.category}</span>
              <p class="card-text">${achievement.requirement}</p>
              <small>ID: ${achievement.achievement_id}</small>
            </div>
          </div>
        `;
      });

      document.getElementById("achievements").innerHTML = cards;
    })
    .catch((error) => console.log("Error fetching achievements:", error));
}

getAchievements();