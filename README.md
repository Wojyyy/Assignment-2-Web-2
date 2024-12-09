# **COMP 3512 - F1 Dashboard Project**

## **Overview**
This repository contains the code for **COMP 3512 Assignment 2** at Mount Royal University. The goal of this project is to develop a data driven Formula 1 dashboard using **HTML**, **CSS**, and **JavaScript**. The project retrieves and displays data from Formula 1 races, including results, driver information, constructors, and circuits.

The website dynamically fetches data via APIs, integrates a **localStorage** caching mechanism for performance, and features interactive dialogs to explore detailed race, driver, and constructor data.


## **Features**
- **Season Browser:** Explore race results for the selected season (2020–2023), including qualifying and podium details.
- **Driver Information:** View drivers' details, statistics, and race results for the chosen season.
- **Constructor Information:** Access constructors' race results, performance data, and standings.
- **Circuit Map:** View detailed information about race circuits, including their location and country.
- **Favourites:** Add drivers, constructors, and circuits to your favourites.
- **Responsive UI:** The interface is functional and visually appealing with responsive layouts for user convenience.


## **Technologies Used**
- **HTML, CSS, JavaScript**
- **Fetch API** for data retrieval
- **LocalStorage** for caching data
- **Dialog API** for interactive modals
- **Placeholder Images** for circuit and driver visuals


## **Main Project Files**
- **index.html**: Entry point to the F1 Dashboard, including the home view.
- **stylesheet.css**: CSS file for styling the layout and components.
- **script.js**: Main JavaScript file that handles API fetching, localStorage caching, event handling, and UI updates.
- **images/**: Folder containing images (e.g., F1 logo and wallpapers).


## **API Routes**
The project retrieves data dynamically from external APIs. Below are the key endpoints used:

- **Races Data:**
  - `/api/races.php?season=<year>`: Fetches all races for a specified season.
- **Race Results:**
  - `/api/results.php?season=<year>`: Retrieves race results for the specified season.
- **Qualifying Results:**
  - `/api/qualifying.php?season=<year>`: Returns qualifying session results.
- **Drivers:**
  - `/api/drivers.php`: Fetches driver information for all seasons.
- **Constructors:**
  - `/api/constructors.php`: Retrieves constructor details.
- **Specific Circuit:**
  - `/api/circuits.php?id=<circuitId>`: Fetches detailed information about a specific circuit.


## **How It Works**
1. **Season Selection**: Users select a season from a dropdown menu to fetch data.
2. **Data Caching**: API responses are stored in **localStorage** for faster subsequent loads.
3. **Interactive UI**: Users can view detailed race, driver, and constructor information through dynamically populated modals and tables.
4. **Favorites**: Drivers, constructors, and circuits can be marked as favourites for easier reference.


## **Setup Instructions**
To run the project locally:
1. Clone this repository:
   ```
   git clone https://github.com/Wojyyy/Assignment-2-Web-2.git
   ```
2. Open `index.html` in a web browser.
3. Ensure you have an active internet connection to fetch API data.


## **Project Contributors**
- **Michal Wojciechowski**
