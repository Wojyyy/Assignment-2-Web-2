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
    const racesDialog = document.getElementById("races");
    const homePage = document.getElementById("home");
    racesDialog.style.display = "none";
    homePage.style.display = "block";
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
      localStorage.setItem(
        `qualifying_${season}`,
        JSON.stringify(qualifyingData)
      );

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

    // Create rows with data
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
        // Hide placeholder and display c2 and c3
        placeholder.style.display = "none";
        c2.style.display = "flex";
        c3.style.display = "flex";

        loadRaceDetails(race); // Populate data in c2 and c3
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
    const homePage = document.getElementById("home");
    racesDialog.style.display = "block";
    homePage.style.display = "none";
  }

  function loadRaceDetails(race) {
    // Grab it from localStorage instead of fetching again
    const qualifyingData = JSON.parse(
      localStorage.getItem(`qualifying_${race.year}`)
    );
    const resultsData = JSON.parse(
      localStorage.getItem(`results_${race.year}`)
    );

    if (!qualifyingData) {
      console.error(`No qualifying data found for season ${race.year}`);
      alert("Qualifying results are unavailable for this race.");
      return;
    }

    if (!resultsData) {
      console.error(`No race results data found for season ${race.year}`);
      alert("Race results are unavailable for this race.");
      return;
    }

    // Filter qualifying results and race results for this specific race
    // Lab 10
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    const raceQualifyingResults = qualifyingData.filter(
      (result) => result.race.id === race.id
    );

    const raceResults = resultsData.filter(
      (result) => result.race.id === race.id
    );

    // Populate race details sections in c2
    document.getElementById("race-name").textContent = race.name;
    document.getElementById("race-round").textContent = race.round;
    document.getElementById("circuit-name").textContent = race.circuit.name;
    document.getElementById("race-location").textContent =
      race.circuit.location;
    document.getElementById("race-country").textContent = race.circuit.country;
    document.getElementById("race-date").textContent = race.date;
    document.getElementById("race-url").href = race.url;

    // Populate qualifying results in c2
    const qualifyingResultsTable =
      document.getElementById("qualifying-results");
    qualifyingResultsTable.innerHTML = ""; // Clear previous results

    raceQualifyingResults.forEach((result) => {
      const row = document.createElement("tr");

      const pos = document.createElement("td");
      pos.textContent = result.position;

      // needs to be able to open driver page
      const driver = document.createElement("td");
      driver.textContent = `${result.driver.forename} ${result.driver.surname}`;

      // needs to be able to open constructor page
      const constructor = document.createElement("td");
      constructor.textContent = result.constructor.name;

      const q1 = document.createElement("td");
      q1.textContent = result.q1 || "N/A";

      const q2 = document.createElement("td");
      q2.textContent = result.q2 || "N/A";

      const q3 = document.createElement("td");
      q3.textContent = result.q3 || "N/A";

      row.appendChild(pos);
      row.appendChild(driver);
      row.appendChild(constructor);
      row.appendChild(q1);
      row.appendChild(q2);
      row.appendChild(q3);

      qualifyingResultsTable.appendChild(row);
    });
    // Call function that will populate c3 with race results
    populateRaceResults(raceResults);
  }

  function populateRaceResults(raceResults) {
    const podiumDiv = document.getElementById("podium");
    const raceResultsTable = document.getElementById("race-results");

    // Clear previous results
    podiumDiv.innerHTML = "";
    raceResultsTable.innerHTML = "";

    if (!raceResults || raceResults.length === 0) {
      console.error("No race results available");
      alert("Race results are unavailable for this race.");
      return;
    }

    // Populate the podium
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
    raceResults.slice(0, 3).forEach((result, index) => {
      const podiumPosition = document.createElement("div");

      // Same styling as in A1 for the podium
      if (index === 0) {
        podiumPosition.classList.add("p1"); // 1st place
        podiumPosition.innerHTML = `
        <strong>Winner:</strong><br>
        ${result.driver.forename} ${result.driver.surname} (${result.constructor.name})
      `;
      } else if (index === 1) {
        podiumPosition.classList.add("p2"); // 2nd place
        podiumPosition.innerHTML = `
        <strong>Second:</strong><br>
        ${result.driver.forename} ${result.driver.surname} (${result.constructor.name})
      `;
      } else if (index === 2) {
        podiumPosition.classList.add("p3"); // 3rd place
        podiumPosition.innerHTML = `
        <strong>Third:</strong><br>
        ${result.driver.forename} ${result.driver.surname} (${result.constructor.name})
      `;
      }

      podiumDiv.appendChild(podiumPosition);
    });

    // Populate race results table
    raceResults.forEach((result, index) => {
      const row = document.createElement("tr");

      const pos = document.createElement("td");
      pos.textContent = result.position;

      const driver = document.createElement("td");
      driver.textContent = `${result.driver.forename} ${result.driver.surname}`;

      const constructor = document.createElement("td");
      constructor.textContent = result.constructor.name;

      const laps = document.createElement("td");
      laps.textContent = result.laps || "N/A";

      const points = document.createElement("td");
      points.textContent = result.points || "N/A";

      row.appendChild(pos);
      row.appendChild(driver);
      row.appendChild(constructor);
      row.appendChild(laps);
      row.appendChild(points);

      raceResultsTable.appendChild(row);
    });
  }
});
