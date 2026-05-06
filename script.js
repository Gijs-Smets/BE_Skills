const baseUrl = "http://127.0.0.1:8000";

function getAchievements() {
  fetch(`${baseUrl}/achievements`)
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

function getAchievementStats() {
  const studentId = document.getElementById("student-id-input").value;

  const studentCountFetch = fetch(`${baseUrl}/students/achievements/count?student_id=${studentId}`)
    .then((response) => response.json());

  const totalCountFetch = fetch(`${baseUrl}/achievements/count`)
    .then((response) => response.json());

  const studentAchievementsFetch = fetch(`${baseUrl}/students/achievements?student_id=${studentId}`)
    .then((response) => response.json());

  Promise.all([studentCountFetch, totalCountFetch, studentAchievementsFetch])
    .then(([studentData, totalData, achievementsData]) => {
      const completed = studentData.achievement_count;
      const total = totalData.total_achievements;
      const percentage = Math.round((completed / total) * 100);

      // build achievement rows
      let rows = "";
      achievementsData.achievements.forEach((achievement) => {
        rows += `
          <tr>
            <td>${achievement.title}</td>
            <td>${achievement.category}</td>
            <td>${achievement.awarded_by}</td>
            <td>${achievement.date_awarded ?? "N/A"}</td>
          </tr>
        `;
      });

      document.getElementById("achievement-stats").innerHTML = `
        <p>Student ID: <strong>${studentData.student_id}</strong></p>
        <p>Achievements: <strong>${completed} / ${total}</strong> (${percentage}%)</p>

        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Awarded By</th>
              <th>Date Awarded</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    })
    .catch((error) => console.log("Error fetching achievement stats:", error));
}

getAchievements();
getAchievementStats();