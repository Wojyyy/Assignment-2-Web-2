document.addEventListener("DOMContentLoaded", () => {
  // Dialogs
  const racesDialog = document.getElementById("races");

  // Divs
  const racesContainer = document.getElementById("races-container");

  // Buttons
  const viewRacesButton = document.getElementById("view-races-button");
  const closeRacesButton = document.getElementById("close-races-dialog");

  // Selects
  const seasonSelect = document.getElementById("season-select");

  // Populate each option with these four year options
  const years = [2020, 2021, 2022, 2023];
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    seasonSelect.appendChild(option);
  });

  // Event listener for opening the races dialog
  viewRacesButton.addEventListener("click", () => {
    const selectedSeason = seasonSelect.value;

    if (!selectedSeason) {
      alert("Please select a season.");
      return;
    }

    checkLocalStorageForSeasonData(selectedSeason);
  });

  // Event listener for closing the races dialog
  closeRacesButton.addEventListener("click", () => {
    racesDialog.close();
  });

  // Function to check localStorage and fetch season data if necessary
  function checkLocalStorageForSeasonData(season) {
    // Get from localStorage
    const raceData = localStorage.getItem(`races_${season}`);
    // Some of the other data required for later / will need to get more most likely
    const resultData = localStorage.getItem(`results_${season}`);
    const qualifyingData = localStorage.getItem(`qualifying_${season}`);

    if (!raceData || !resultData || !qualifyingData) {
      console.log("Fetching Data");
      getSeasonData(season);
    } else {
      console.log("Display Data from Local Storage");
      displayRaces(JSON.parse(raceData), season);
    }
  }

  // Async function to fetch all season data (lecture)
  async function getSeasonData(season) {
    try {
      const raceURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php?season=${season}`;
      // Some of the other data required for later / will need to get more most likely
      const resultsURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php?season=${season}`;
      const qualifyingURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/qualifying.php?season=${season}`;

      const [raceResponse, resultsResponse, qualifyingResponse] =
        await Promise.all([
          fetch(raceURL),
          fetch(resultsURL),
          fetch(qualifyingURL),
        ]);

      if (!raceResponse.ok || !resultsResponse.ok || !qualifyingResponse.ok) {
        throw new Error("Failed to fetch some data.");
      }

      const [raceData, resultData, qualifyingData] = await Promise.all([
        raceResponse.json(),
        resultsResponse.json(),
        qualifyingResponse.json(),
      ]);

      // Save the data in localStorage
      localStorage.setItem(`races_${season}`, JSON.stringify(raceData));
      localStorage.setItem(`results_${season}`, JSON.stringify(resultData));
      localStorage.setItem(`qualifying_${season}`, JSON.stringify(qualifyingData));

      // Display races (ONLY, FOR NOW)
      displayRaces(raceData, season);
    } catch (error) {
      console.error("Error fetching season data", error);
      
      // Error display for user
      alert("Failed to load season data. Please try again later.");
    }
  }

  // Function to display races data in the dialog
  function displayRaces(races, season) {

    // Update Heading with the correct year
    const seasonYearHeading = document.getElementById("season-year");
    seasonYearHeading.textContent = `${season} Races`;

    const racesContainer = document.getElementById("races-container");
    racesContainer.innerHTML = ""; // Clear previous rows

    const placeholder = document.getElementById("placeholder");
    const c2 = document.querySelector(".c2-races");
    const c3 = document.querySelector(".c3-races");

    // Sort races by round https://forum.freecodecamp.org/t/arr-sort-a-b-a-b-explanation/167677
    races.sort((a, b) => a.round - b.round);

    // create rows with data
    races.forEach((race) => {
        const row = document.createElement("tr");

        const round = document.createElement("td");
        round.textContent = race.round;

        const name = document.createElement("td");
        name.textContent = race.name;

        const action = document.createElement("td");
        const resultsButton = document.createElement("button");
        resultsButton.textContent = "Results";
        resultsButton.classList.add("race-results");
        resultsButton.addEventListener("click", () => { 
          
          // hide placeholder and display c2 and c3
            placeholder.style.display = "none"; 
            c2.style.display = "flex";
            c3.style.display = "flex";

          
          loadRaceDetails(race);
        });

        action.appendChild(resultsButton);

        // Append each cells to the each row
        row.appendChild(round);
        row.appendChild(name);
        row.appendChild(action);

        racesContainer.appendChild(row);
    });

    // Display the dialog
    const racesDialog = document.getElementById("races");
    racesDialog.showModal();
}
});
