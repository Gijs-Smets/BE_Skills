const url = "http://127.0.0.1:8000/achievements";

function getAchievements() {
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      let table = `
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Requirement</th>
            </tr>
          </thead>
          <tbody>
      `;

      result.Achievements.forEach((achievement) => {
        table += `
          <tr>
            <td>${achievement.achievement_id}</td>
            <td>${achievement.title}</td>
            <td>${achievement.category}</td>
            <td>${achievement.requirement}</td>
          </tr>
        `;
      });

      table += `
          </tbody>
        </table>
      `;

      document.getElementById("achievements").innerHTML = table;
    })
    .catch((error) => console.log("Error fetching achievements:", error));
}

getAchievements();