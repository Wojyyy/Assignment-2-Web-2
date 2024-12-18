document.addEventListener("DOMContentLoaded", () => {
  // Dialogs
  const racesDialog = document.querySelector("#races");
  const homePage = document.querySelector("#home");

  // Buttons
  const viewRacesButton = document.querySelector("#view-races-button");
  const logo = document.querySelector("#logo");

  // Selects
  const seasonSelect = document.querySelector("#season-select");

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
    const driversData = localStorage.getItem(`drivers_${season}`);

    if (
      !raceData ||
      !resultData ||
      !qualifyingData ||
      !constructorsData ||
      !driversData
    ) {
      console.log("Fetching Data");
      getSeasonData(season);
    } else {
      console.log("Display Data from Local Storage");
      displayRaces(JSON.parse(raceData), season);
    }
  }

  // Async function to fetch all season data (lecture)
  async function getSeasonData(season) {
    const spinner = document.querySelector(".lds-dual-ring"); // loading wheel

    try {
      // Show loading wheel
      spinner.style.display = "block";

      const raceURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php?season=${season}`;
      const resultsURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php?season=${season}`;
      const qualifyingURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/qualifying.php?season=${season}`;
      const constructorsURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php`;
      const driversURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php`;

      const [
        raceResponse,
        resultsResponse,
        qualifyingResponse,
        constructorsResponse,
        driversResponse,
      ] = await Promise.all([
        fetch(raceURL),
        fetch(resultsURL),
        fetch(qualifyingURL),
        fetch(constructorsURL),
        fetch(driversURL),
      ]);

      if (
        !raceResponse.ok ||
        !resultsResponse.ok ||
        !qualifyingResponse.ok ||
        !constructorsResponse.ok ||
        !driversResponse.ok
      ) {
        throw new Error("Failed to fetch some data.");
      }

      const [
        raceData,
        resultData,
        qualifyingData,
        constructorsData,
        driversData,
      ] = await Promise.all([
        raceResponse.json(),
        resultsResponse.json(),
        qualifyingResponse.json(),
        constructorsResponse.json(),
        driversResponse.json(),
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
      localStorage.setItem(`drivers_${season}`, JSON.stringify(driversData));

      displayRaces(raceData, season);
    } catch (error) {
      console.error("Error fetching season data", error);

      // Error display for user
      alert("Failed to load season data. Please try again later.");
    }
    spinner.style.display = "none"; // Hide loading wheel
  }

  // Function to display races data in the dialog
  function displayRaces(races, season) {
    // Update Heading with the correct year
    const seasonYearHeading = document.querySelector("#season-year");
    seasonYearHeading.textContent = `${season} Races`;

    const racesContainer = document.querySelector("#races-container");
    racesContainer.innerHTML = ""; // Clear previous rows

    const placeholder = document.querySelector("#placeholder");
    const c2 = document.querySelector(".c2-races");
    const c3 = document.querySelector(".c3-races");

    // below makes sure that opening race page the placeholder is visible and not the races
    placeholder.style.display = "block";
    c2.style.display = "none";
    c3.style.display = "none";

    // Sort races by round https://forum.freecodecamp.org/t/arr-sort-a-b-a-b-explanation/167677
    races.sort((a, b) => a.round - b.round);

    // Create rows with data
    races.forEach((race) => {
      const row = document.createElement("tr");

      const round = document.createElement("td");
      round.textContent = race.round;
      const name = document.createElement("td");
      const raceLink = document.createElement("a");

      if (isFavourite("favouriteCircuits", race.circuit.id)) {
        raceLink.textContent = `⭐ ${race.name}`;
      } else {
        raceLink.textContent = race.name; // Display race name
      }

      raceLink.href = "#";
      raceLink.addEventListener("click", () => {
        openCircuitDialog(race.circuit.id);
      });
      name.appendChild(raceLink);

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
    const racesDialog = document.querySelector("#races");
    const homePage = document.querySelector("#home");
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
    document.querySelector("#race-name").textContent = race.name;
    document.querySelector("#race-round").textContent = race.round;
    document.querySelector("#circuit-name").textContent = race.circuit.name;
    document.querySelector("#race-location").textContent =
      race.circuit.location;
    document.querySelector("#race-country").textContent = race.circuit.country;
    document.querySelector("#race-date").textContent = race.date;
    document.querySelector("#race-url").href = race.url;

    // Populate qualifying results in c2
    const qualifyingResultsTable =
      document.querySelector("#qualifying-results");
    qualifyingResultsTable.innerHTML = ""; // Clear previous results

    raceQualifyingResults.forEach((result) => {
      const row = document.createElement("tr");

      const pos = document.createElement("td");
      pos.textContent = result.position;

      // Populate driver and constructor results
      const driver = document.createElement("td");
      const driverLink = document.createElement("a");
      // Check if the driver is favourite and conditionally add a star
      if (isFavourite("favouriteDrivers", result.driver.id)) {
        driverLink.textContent = `⭐ ${result.driver.forename} ${result.driver.surname}`;
      } else {
        driverLink.textContent = `${result.driver.forename} ${result.driver.surname}`;
      }
      // Setup as a button that opens driver dialog for this specific driver
      driverLink.href = "#";
      driverLink.addEventListener("click", () => {
        openDriverDialog(result.driver); // Pass the driver object so we can display it in the drivers dialog
      });
      driver.appendChild(driverLink);

      const constructor = document.createElement("td");
      const constructorLink = document.createElement("a");
      if (isFavourite("favouriteConstructors", result.constructor.id)) {
        constructorLink.textContent = `⭐ ${result.constructor.name}`;
      } else {
        constructorLink.textContent = result.constructor.name;
      }
      // Setup as a button that opens constructor dialog for this specific constructor
      constructorLink.href = "#";
      constructorLink.addEventListener("click", () => {
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
    const podiumDiv = document.querySelector("#podium");
    const raceResultsTable = document.querySelector("#race-results");

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
      const title = document.createElement("strong");
      const driverLink = document.createElement("a");

      if (index === 0) {
        podiumPosition.classList.add("p1");
        title.textContent = "Winner:";
      } else if (index === 1) {
        podiumPosition.classList.add("p2");
        title.textContent = "Second:";
      } else if (index === 2) {
        podiumPosition.classList.add("p3");
        title.textContent = "Third:";
      }

      // Check if the driver is favourite and conditionally add a star
      if (isFavourite("favouriteDrivers", result.driver.id)) {
        driverLink.textContent = `⭐ ${result.driver.forename} ${result.driver.surname}`;
      } else {
        driverLink.textContent = `${result.driver.forename} ${result.driver.surname}`;
      }
      driverLink.href = "#";
      driverLink.addEventListener("click", () => {
        openDriverDialog(result.driver);
      });

      podiumPosition.appendChild(title);
      podiumPosition.appendChild(document.createElement("br"));
      podiumPosition.appendChild(driverLink);

      podiumDiv.appendChild(podiumPosition);
    });

    // Populate race results table
    raceResults.forEach((result, index) => {
      const row = document.createElement("tr");

      const pos = document.createElement("td");
      pos.textContent = result.position;

      const driver = document.createElement("td");
      const driverLink = document.createElement("a");
      // Check if the driver is favourite and conditionally add a star
      if (isFavourite("favouriteDrivers", result.driver.id)) {
        driverLink.textContent = `⭐ ${result.driver.forename} ${result.driver.surname}`;
      } else {
        driverLink.textContent = `${result.driver.forename} ${result.driver.surname}`;
      }
      // Setup as a button that opens driver dialog for this specific driver
      driverLink.href = "#";
      driverLink.addEventListener("click", () => {
        openDriverDialog(result.driver); // Pass the driver object so we can diplay it in the drivers dialog
      });
      driver.appendChild(driverLink);

      const constructor = document.createElement("td");
      const constructorLink = document.createElement("a");
      if (isFavourite("favouriteConstructors", result.constructor.id)) {
        constructorLink.textContent = `⭐ ${result.constructor.name}`;
      } else {
        constructorLink.textContent = result.constructor.name;
      }
      // Setup as a button that opens constructor dialog for this specific constructor
      constructorLink.href = "#";
      constructorLink.addEventListener("click", () => {
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

  // Sorting c2 and c3 content
  function tableSorting(theadId, tbodyId) {
    const thead = document.querySelector(theadId);
    const tbody = document.querySelector(tbodyId);

    // make sure that the head and body are there
    if (!thead || !tbody) {
      console.error(`Table head or body not found: ${theadId}, ${tbodyId}`);
      return;
    }

    const headers = thead.querySelectorAll("th");

    // https://www.w3schools.com/howto/howto_js_sort_table.asp
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
    // https://www.codewithfaraz.com/content/22/how-to-sort-html-table-by-header-click-sorting-data-tables
    headers.forEach((header, index) => {
      if (!header.querySelector(".sort-indicator")) {
        const sortIndicator = document.createElement("span");
        sortIndicator.classList.add("sort-indicator");
        sortIndicator.style.marginLeft = "5px";
        header.appendChild(sortIndicator);
      }

      header.addEventListener("click", () => {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const sortIndicator = header.querySelector(".sort-indicator");

        thead.querySelectorAll(".sort-indicator").forEach((span) => {
          span.textContent = "";
        });

        const ascending = header.dataset.sortOrder !== "asc";
        header.dataset.sortOrder = ascending ? "asc" : "desc";

        rows.sort((rowA, rowB) => {
          const cellA = rowA.children[index].textContent.trim();
          const cellB = rowB.children[index].textContent.trim();

          // check if theyre numbers first
          if (!isNaN(cellA) && !isNaN(cellB)) {
            return ascending ? cellA - cellB : cellB - cellA;
          } else {
            return ascending
              ? cellA.localeCompare(cellB)
              : cellB.localeCompare(cellA);
          }
        });

        // https://www.w3schools.com/charsets/ref_utf_arrows.asp
        sortIndicator.textContent = ascending ? "▲" : "▼";

        rows.forEach((row) => tbody.appendChild(row));
      });
    });
  }

  // Call function to sort c2 or c3
  tableSorting("#qualifying-body", "#qualifying-results");
  tableSorting("#race-body", "#race-results");

  // ********* Circuit Dialog Code **********//
  async function openCircuitDialog(circuitId) {
    try {
      // Fetch circuit data using the ID passed in
      const circuitURL = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/circuits.php?id=${circuitId}`;
      const circuitData = await fetchCircuitData(circuitURL);

      // Call helper function to populate dialog
      populateCircuitDetails(circuitData);

      const circuitDialog = document.querySelector("#circuit");
      circuitDialog.showModal();

      // favourite
      const favouriteButton = document.querySelector("#favourite-circuit");

      if (isFavourite("favouriteCircuits", circuitId)) {
        favouriteButton.textContent = "Unfavourite";
      } else {
        favouriteButton.textContent = "Favourite";
      }

      favouriteButton.onclick = () => {
        toggleFavourite("favouriteCircuits", circuitId, favouriteButton);
      };

      document
        .querySelector("#close-circuit-dialog")
        .addEventListener("click", () => {
          circuitDialog.close();
        });
    } catch (error) {
      console.error("Error with dialog:", error);
      alert("There was an issue with the dialog, please try later.");
    }
  }

  // Fetch circuit data
  async function fetchCircuitData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  }

  // Function to populate circuit details into the dialog
  function populateCircuitDetails(circuit) {
    document.querySelector("#circuit-name-big").textContent = circuit.name;
    document.querySelector("#circuit-country").textContent = circuit.country;
    document.querySelector("#circuit-location").textContent = circuit.location;
    document.querySelector("#circuit-url").href = circuit.url;
    document.querySelector("#circuit-url").textContent = "View Circuit Details";

    document.querySelector(
      "#circuit-image"
    ).src = `https://placehold.co/300x200?text=${circuit.name}`;

    // Setup image later
  }

  //********** Constructor Dialog Code **********//

  // Function for displaying constructor dialog from pressing on constructor button
  async function openConstructorDialog(constructor) {
    try {
      // Get the current season and the constructor reference
      const season = seasonSelect.value;
      const constructorRef = constructor.ref;

      // Fetch constructor results (this is not stored in local storage)
      const constructorResultsUrl = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructorResults.php?constructor=${constructorRef}&season=${season}`;
      const constructorResults = await fetchConstructorResults(
        constructorResultsUrl
      );

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
      const totalPoints = filteredResults.reduce(
        (sum, result) => sum + (result.points || 0),
        0
      );

      populateConstructorDetails(constructor, totalPoints);
      populateRaceResultsTable(constructorResults, seasonResults);

      const constructorDialog = document.querySelector("#constructor");
      constructorDialog.showModal();

      // Favourite
      const favouriteButton = document.querySelector("#favourite-constructor");

      if (isFavourite("favouriteConstructors", constructor.id)) {
        favouriteButton.textContent = "Unfavourite";
      } else {
        favouriteButton.textContent = "Favourite";
      }

      favouriteButton.onclick = () => {
        toggleFavourite(
          "favouriteConstructors",
          constructor.id,
          favouriteButton
        );
      };

      // Constructors dialog close button
      document
        .querySelector("#close-constructor-dialog")
        .addEventListener("click", () => {
          constructorDialog.close();
        });
    } catch (error) {
      console.error("Error with dialog:", error);
      alert("There was an issue with the dialog, please try later.");
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
    document.querySelector("#constructor-name").textContent = constructor.name;
    document.querySelector("#constructor-nationality").textContent =
      constructor.nationality;
    document.querySelector(
      "#constructor-url"
    ).href = `https://en.wikipedia.org/wiki/${constructor.name}`;
    document.querySelector("#constructor-url").textContent = constructor.name;
    document.querySelector("#constructor-total-points").textContent =
      totalPoints;
  }

  // Populate race results table in the dialog
  function populateRaceResultsTable(constructorResults, seasonResults) {
    const raceResultsTable = document.querySelector(
      "#constructor-race-results"
    );
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
      const matchingSeasonResult = seasonResults.find(
        (seasonResult) => seasonResult.id === result.resultId
      );

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

  //********** Driver Dialog Code **********//

  // function for displaying driver dialog
  async function openDriverDialog(driver) {
    try {
      const season = seasonSelect.value;

      const driverResultsUrl = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/driverResults.php?driver=${driver.ref}&season=${season}`;
      const driverResults = await fetchDriverResults(driverResultsUrl);

      const seasonResults = JSON.parse(
        localStorage.getItem(`results_${season}`)
      );
      if (!seasonResults) {
        throw new Error(
          "Season results not found in local storage. Please select a season again."
        );
      }

      populateDriverDetails(driver);
      populateDriverRaceResultsTable(driverResults, seasonResults);

      const driverDialog = document.querySelector("#driver");
      driverDialog.showModal();

      // Favourite
      const favouriteButton = document.querySelector("#favourite-driver");

      if (isFavourite("favouriteDrivers", driver.id)) {
        favouriteButton.textContent = "Unfavourite";
      } else {
        favouriteButton.textContent = "Favourite";
      }

      favouriteButton.onclick = () => {
        toggleFavourite("favouriteDrivers", driver.id, favouriteButton);
      };

      document
        .querySelector("#close-driver-dialog")
        .addEventListener("click", () => {
          driverDialog.close();
        });
    } catch (error) {
      console.error("Error with dialog:", error);
      alert("There was an issue with the dialog, please try later.");
    }
  }

  // Fetch driver results
  async function fetchDriverResults(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  }

  // Function to populate driver details in the dialog
  function populateDriverDetails(driver) {
    const season = seasonSelect.value;
    const driversData = JSON.parse(localStorage.getItem(`drivers_${season}`)); // get all drivers from this season

    const matchingDriver = driversData.find((d) => d.driverRef === driver.ref); // matchi our 'driver' reference with this season all drivers to get necessary data

    // Populate driver details in the dialog
    document.querySelector(
      "#driver-name"
    ).textContent = `${matchingDriver.forename} ${matchingDriver.surname}`;
    document.querySelector("#driver-number").textContent =
      matchingDriver.number;
    document.querySelector("#driver-code").textContent = matchingDriver.code;
    document.querySelector("#driver-nationality").textContent =
      matchingDriver.nationality;
    document.querySelector("#driver-dob").textContent = matchingDriver.dob;
    document.querySelector("#driver-url").href = matchingDriver.url;
    document.querySelector(
      "#driver-image"
    ).src = `https://placehold.co/300x200?text=${matchingDriver.forename}+${matchingDriver.surname}`;
  }

  // Function to populate driver race results from this season in table in the dialog
  function populateDriverRaceResultsTable(driverResults, seasonResults) {
    const season = seasonSelect.value;
    const racesData = JSON.parse(localStorage.getItem(`races_${season}`));

    const raceResultsTable = document.querySelector("#driver-race-results");
    raceResultsTable.innerHTML = "";

    // compare results to get position and points data
    driverResults.forEach((result) => {
      const race = racesData.find((race) => race.round === result.round);

      const matchingSeasonResult = seasonResults.find(
        (seasonResult) =>
          seasonResult.race.round === result.round &&
          seasonResult.driver.ref === result.driverRef
      );

      const row = document.createElement("tr");

      const roundCell = document.createElement("td");
      roundCell.textContent = result.round;

      const circuitCell = document.createElement("td");
      circuitCell.textContent = race.name;

      const positionCell = document.createElement("td");
      positionCell.textContent = matchingSeasonResult.position;

      const pointsCell = document.createElement("td");
      pointsCell.textContent = matchingSeasonResult.points;

      row.appendChild(roundCell);
      row.appendChild(circuitCell);
      row.appendChild(positionCell);
      row.appendChild(pointsCell);

      raceResultsTable.appendChild(row);
    });
  }

  /**** Favourites Functions ****/

  // Function to get favourites from localStorage
  function getFavourites(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  // Function to save favourites on localStorage
  function saveFavourites(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  // Function to check if an item is already in favourites
  function isFavourite(key, id) {
    const favourites = getFavourites(key).map(String);
    return favourites.includes(String(id));
  }

  // Function to toggle favourite status and change button text
  function toggleFavourite(key, itemId, button) {
    let favourites = getFavourites(key).map(String);
    itemId = String(itemId);

    // remove or add to favourites
    if (favourites.includes(itemId)) {
      favourites = favourites.filter((id) => id !== itemId);
      button.textContent = "Favourite";
    } else {
      favourites.push(itemId);
      button.textContent = "Unfavourite";
    }

    saveFavourites(key, favourites);
  }
});
