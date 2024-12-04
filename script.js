document.addEventListener("DOMContentLoaded", () => {
  // Dialogs
  const racesDialog = document.getElementById("races");
  const homePage = document.getElementById("home");

  // Divs
  const racesContainer = document.getElementById("races-container");

  // Buttons
  const viewRacesButton = document.getElementById("view-races-button");
  const closeRacesButton = document.getElementById("close-races-dialog");
  const logo = document.getElementById("logo");

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

  // Event listener for logo image
  logo.addEventListener("click", () => {
    racesDialog.style.display = "none";
    homePage.style.display = "block";
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

  // Function to check localStorage and fetch season data if necessary
  function checkLocalStorageForSeasonData(season) {
    // Get from localStorage
    const raceData = localStorage.getItem(`races_${season}`);
    const resultData = localStorage.getItem(`results_${season}`);
    const qualifyingData = localStorage.getItem(`qualifying_${season}`);
    const constructorsData = localStorage.getItem(`constructors_${season}`);

    if (!raceData || !resultData || !qualifyingData || !constructorsData) {
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
      const resultsURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php?season=${season}`;
      const qualifyingURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/qualifying.php?season=${season}`;
      const constructorsURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php`;

      const [
        raceResponse,
        resultsResponse,
        qualifyingResponse,
        constructorsResponse,
      ] = await Promise.all([
        fetch(raceURL),
        fetch(resultsURL),
        fetch(qualifyingURL),
        fetch(constructorsURL),
      ]);

      if (
        !raceResponse.ok ||
        !resultsResponse.ok ||
        !qualifyingResponse.ok ||
        !constructorsResponse.ok
      ) {
        throw new Error("Failed to fetch some data.");
      }

      const [raceData, resultData, qualifyingData, constructorsData] =
        await Promise.all([
          raceResponse.json(),
          resultsResponse.json(),
          qualifyingResponse.json(),
          constructorsResponse.json(),
        ]);

      // Save the data in localStorage
      localStorage.setItem(`races_${season}`, JSON.stringify(raceData));
      localStorage.setItem(`results_${season}`, JSON.stringify(resultData));
      localStorage.setItem(
        `qualifying_${season}`,
        JSON.stringify(qualifyingData)
      );
      localStorage.setItem(
        `constructors_${season}`,
        JSON.stringify(constructorsData)
      );

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

      // Populate driver and constructor results
      const driver = document.createElement("td");
      const driverLink = document.createElement("a");
      driverLink.textContent = `${result.driver.forename} ${result.driver.surname}`;
      // Setup as a button that opens driver dialog for this specific driver
      driverLink.href = "#";
      driverLink.addEventListener("click", (event) => {
        openDriverDialog(result.driver); // Pass the driver object so we can display it in the drivers dialog
      });
      driver.appendChild(driverLink);

      const constructor = document.createElement("td");
      const constructorLink = document.createElement("a");
      constructorLink.textContent = result.constructor.name;
      // Setup as a button that opens constructor dialog for this specific constructor
      constructorLink.href = "#";
      constructorLink.addEventListener("click", (event) => {
        openConstructorDialog(result.constructor); // Pass the constructor object so we can diplay it in the constructors dialog
      });
      constructor.appendChild(constructorLink);

      // Populate Q results
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

  // C3 function
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
      const driverLink = document.createElement("a");
      driverLink.textContent = `${result.driver.forename} ${result.driver.surname}`;
      // Setup as a button that opens driver dialog for this specific driver
      driverLink.href = "#";
      driverLink.addEventListener("click", (event) => {
        openDriverDialog(result.driver); // Pass the driver object so we can diplay it in the drivers dialog
      });
      driver.appendChild(driverLink);

      const constructor = document.createElement("td");
      const constructorLink = document.createElement("a");
      constructorLink.textContent = result.constructor.name;
      // Setup as a button that opens constructor dialog for this specific constructor
      constructorLink.href = "#";
      constructorLink.addEventListener("click", (event) => {
        openConstructorDialog(result.constructor); // Pass the driver object so we can diplay it in the drivers dialog
      });
      constructor.appendChild(constructorLink);

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

  // Function for displaying constructor dialog from pressing on constructor button
  async function openConstructorDialog(constructor) {
    try {
      // Get the current season and the constructor reference
      const season = seasonSelect.value;
      const constructorRef = constructor.ref;

      // Fetch constructor results (this is not stored in local storage)
      const constructorResultsUrl = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructorResults.php?constructor=${constructorRef}&season=${season}`;
      const constructorResults = await fetchConstructorResults(constructorResultsUrl);

      // Get season results from local storage
      const seasonResults = JSON.parse(
        localStorage.getItem(`results_${season}`)
      );
      if (!seasonResults) {
        throw new Error(
          "Season results not found in local storage, select season again."
        );
      }

      // Filter results for the specific constructor passed in
      const filteredResults = seasonResults.filter(
        (result) => result.constructor.ref === constructorRef
      );

      // Calculate total points for the constructor from this season
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce?utm_source=chatgpt.com
      const totalPoints = filteredResults.reduce((sum, result) => sum + (result.points || 0),0);

      populateConstructorDetails(constructor, totalPoints);
      populateRaceResultsTable(constructorResults, seasonResults);

      const constructorDialog = document.getElementById("constructor");
      constructorDialog.showModal();

      // Constructors dialog close button 
      document
        .getElementById("close-constructor-dialog")
        .addEventListener("click", () => {
          constructorDialog.close();
        });
    } catch (error) {
      console.error("Error opening constructor dialog:", error);
    }
  }

  // Fetch constructor results
  async function fetchConstructorResults(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Populate constructor details in the dialog
  function populateConstructorDetails(constructor, totalPoints) {
    document.getElementById("constructor-name").textContent = constructor.name;
    document.getElementById("constructor-nationality").textContent = constructor.nationality;
    document.getElementById("constructor-url").href = `https://en.wikipedia.org/wiki/${constructor.name}`;
    document.getElementById("constructor-url").textContent = constructor.name;
    document.getElementById("constructor-total-points").textContent = totalPoints;
  }

  // Populate race results table in the dialog
  function populateRaceResultsTable(constructorResults, seasonResults) {
    const raceResultsTable = document.getElementById("constructor-race-results");
    raceResultsTable.innerHTML = "";

    constructorResults.forEach((result) => {
      const row = document.createElement("tr");

      const roundCell = document.createElement("td");
      roundCell.textContent = result.round;

      const circuitCell = document.createElement("td");
      circuitCell.textContent = result.name;

      const driverCell = document.createElement("td");
      driverCell.textContent = `${result.forename} ${result.surname}`;

      const positionCell = document.createElement("td");
      positionCell.textContent = result.positionOrder || "N/A";

      // Find matching points from seasonResults
      const matchingSeasonResult = seasonResults.find((seasonResult) => seasonResult.id === result.resultId);

      const pointsCell = document.createElement("td");
      if (matchingSeasonResult) {
        pointsCell.textContent = matchingSeasonResult.points;
      } else {
        pointsCell.textContent = "N/A";
      }
      
      row.appendChild(roundCell);
      row.appendChild(circuitCell);
      row.appendChild(driverCell);
      row.appendChild(positionCell);
      row.appendChild(pointsCell);

      raceResultsTable.appendChild(row);
    });
  }

  // function for displaying driver dialog
  function openDriverDialog(driver) {}
});
