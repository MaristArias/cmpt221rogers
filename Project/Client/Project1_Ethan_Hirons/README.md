# Skycheck

Skycheck is a small weather dashboard that compares current conditions across multiple cities. It is built with semantic HTML, CSS and JS using a local sample data. Project 2 will replace the sample data with a real APi through a server

## Problem Statement

People who plan outdoor activities such as practice, runs or commutes often have to open a separate weather page for every city they care about. Skycheck puts current temperature, wind, humidity and rain chance for many cities on one screen. A user can search, filter, sort and switch units, then save the cities they check most often and keep a short note on each.

## Intended User and Primary Task

The intended user is a student or commuter who follows the weather in a handful of cities. The main task is to answer the question "Where are conditions good for being outside right now?"

## Selected API

Open-Meteo Forecast API, which needs no API key and allows non commercial use.

Documentation: https://open-meteo.com/en/docs

Endpoint for Project 2: `https://api.open-meteo.com/v1/forecast` with the `current` parameters for temperature, apparent temperature, weather code, wind speed, relative humidity and precipitation probability. The key is not needed, so nothing secret will sit in browser code, and the server in Project 2 will still make the request.

## How to Run

1. Download or clone the `project-01` folder.
2. Open `index.html` in a browser.

## Local Data Structure

The file `data/sample-data.js` defines `window.WEATHER_SNAPSHOTS`, an array of three snapshots. Each snapshot has an `updatedAt` timestamp, a `stale` flag and a `locations` array. Each location object has these fields:

Field Meaning

id Short unique key for the city  
name City name  
region State or country  
temperatureC Current temperature in Celsius  
feelsLikeC Apparent temperature in Celsius  
condition One of clear, cloudy, rain, storm, snow
windKph Wind speed in km/h  
humidity Relative humidity percent  
precipChance Chance of rain percent

The Refresh button moves to the next snapshot, so the values and the last updated time change. The first snapshot is marked stale to show the stale state.

## Data Flow

`fetchSnapshot` returns a promise after a short delay, like a network request would. `filterLocations` and `sortLocations` select the data. `createCard` and the other create functions build the DOM using `textContent`. Event handlers update `state` and call the render functions. In Project 2 only `fetchSnapshot` needs to change to call the server.

## Interface States

Loading appears while data is fetched. Success shows the city cards. Empty appears when search and filter match nothing. Error is shown with the Simulate error button and offers a Try again button. Stale is shown as a text note next to the last updated time.

## Exploration Interactions

Search by city or region, filter by condition, sort by name, temperature, rain chance or wind, and switch between Celsius and Fahrenheit.

## Persistence Ready Feature: Saved Cities

Users can save a city, add a note to it, and remove it. For now the list lives in a JavaScript array and resets when the page reloads.

What will be stored: the cities a user saves and the note on each one.
Which actions change it: Save, Remove and editing a note.
Why persistence helps: the user would see the same cities and notes every visit without setting them up again.

Proposed record fields:

Field Type

id integer, primary key  
userId integer, added in a later project
locationId text  
note text  
savedAt timestamp

## Testing Completed

- Opened the page with no Console errors on load.
- Used Tab and Shift+Tab to reach every control, and Enter or Space to activate buttons.
- Confirmed a visible focus outline on every control.
- Checked search, condition filter, sort and unit switch for correct results.
- Triggered the loading, empty and error states and checked that the status message is read by the live region.
- Saved, edited a note on and removed a city from both the card and the saved list.
- Resized the window down to about 320 px wide and checked that there is no horizontal scrolling.

## Known Limitations

- Data is sample data and does not come from a live source.
- Saved cities and notes reset on reload.
- The refresh only cycles through three prepared snapshots.
- Weather values are not a forecast and should not be used for safety decisions.

## AI Assistance

- I used Claude code for parts of the CSS design to to get the perfect look I wanted, I did it myself first then gave it to Claude to make the design a bit better. I also had a few errors regarding the Render Data in JS lines 150-167, so after sometime of trying to fix it myself I used Claude to help fix the error after I couldn't figure it out myself.
