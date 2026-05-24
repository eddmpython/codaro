from __future__ import annotations

from collections.abc import Callable
from datetime import date, timedelta
from typing import Any


def loadLocalDataset(name: str):
    """Return a deterministic local teaching dataset as a pandas DataFrame."""
    normalizedName = name.strip().lower().replace("-", "_")
    factories: dict[str, Callable[[], Any]] = {
        "abalone": _abaloneData,
        "advertising": _advertisingData,
        "anscombe": _anscombeData,
        "airline_passengers": _airlinePassengersData,
        "airquality": _airqualityData,
        "apple_stock": _appleStockData,
        "bike_demand": _bikeDemandData,
        "boston_housing": _bostonHousingData,
        "car_crashes": _carCrashesData,
        "churn": _churnData,
        "daily_births": _dailyBirthsData,
        "diamonds": _diamondsData,
        "diabetes": _diabetesData,
        "earthquakes": _earthquakesData,
        "exercise": _exerciseData,
        "fifa_players": _fifaPlayersData,
        "flights": _flightsData,
        "gapminder": _gapminderData,
        "global_temp": _globalTempData,
        "heart": _heartData,
        "hr_attrition": _hrAttritionData,
        "happiness": _happinessData,
        "imdb_movies": _imdbMoviesData,
        "insurance": _insuranceData,
        "iris": _irisData,
        "mpg": _mpgData,
        "penguins": _penguinsData,
        "pokemon": _pokemonData,
        "sonar": _sonarData,
        "spotify_songs": _spotifySongsData,
        "titanic": _titanicData,
        "titanic_passengers": _titanicPassengersData,
        "tips": _tipsData,
        "video_games": _videoGamesData,
        "weight_height": _weightHeightData,
    }
    if normalizedName not in factories:
        available = ", ".join(sorted(factories))
        raise ValueError(f"Unknown local dataset: {name}. Available datasets: {available}")
    return factories[normalizedName]().copy()


def _dataFrame(rows: list[dict[str, Any]]):
    try:
        import pandas as pd
    except ImportError as exc:
        raise RuntimeError("local curriculum datasets require pandas") from exc
    return pd.DataFrame(rows)


def _advertisingData():
    rows: list[dict[str, Any]] = []
    for idx in range(200):
        tv = round(8 + (idx * 17) % 290 + (idx % 5) * 0.35, 1)
        radio = round(4 + (idx * 11) % 48 + (idx % 3) * 0.25, 1)
        newspaper = round(2 + (idx * 19) % 88 + (idx % 7) * 0.4, 1)
        marketLift = ((idx % 9) - 4) * 0.18
        sales = round(4.2 + 0.046 * tv + 0.176 * radio + 0.012 * newspaper + marketLift, 2)
        rows.append({"TV": tv, "Radio": radio, "Newspaper": newspaper, "Sales": sales})
    return _dataFrame(rows)


def _gapminderData():
    rows: list[dict[str, Any]] = []
    countries = [
        ("Korea, Rep.", "Asia", 49044790, 78.6, 23348),
        ("Japan", "Asia", 127467972, 82.6, 31656),
        ("China", "Asia", 1318683096, 73.0, 4959),
        ("India", "Asia", 1110396331, 64.7, 2452),
        ("Germany", "Europe", 82400996, 79.4, 32170),
        ("France", "Europe", 61083916, 80.7, 30470),
        ("United Kingdom", "Europe", 60776238, 79.4, 33203),
        ("United States", "Americas", 301139947, 78.2, 42952),
        ("Brazil", "Americas", 190010647, 72.4, 9066),
        ("Mexico", "Americas", 108700891, 76.2, 11977),
        ("Nigeria", "Africa", 135031164, 46.9, 2014),
        ("South Africa", "Africa", 43997828, 49.3, 9269),
        ("Egypt", "Africa", 80264543, 71.3, 5581),
        ("Australia", "Oceania", 20434176, 81.2, 34435),
        ("New Zealand", "Oceania", 4115771, 80.2, 25185),
    ]
    yearFactors = {
        1952: (0.55, 0.24, -22.0),
        1962: (0.66, 0.34, -17.0),
        1972: (0.76, 0.47, -12.0),
        1982: (0.84, 0.61, -8.0),
        1992: (0.91, 0.76, -4.5),
        2002: (0.97, 0.91, -1.5),
        2007: (1.00, 1.00, 0.0),
    }
    for country, continent, pop2007, life2007, gdp2007 in countries:
        for year, (popFactor, gdpFactor, lifeDelta) in yearFactors.items():
            rows.append({
                "country": country,
                "continent": continent,
                "year": year,
                "pop": int(pop2007 * popFactor),
                "lifeExp": round(life2007 + lifeDelta, 1),
                "gdpPercap": round(gdp2007 * gdpFactor, 1),
            })
    return _dataFrame(rows)


def _pokemonData():
    names = [
        "Bulbasaur",
        "Ivysaur",
        "Venusaur",
        "Charmander",
        "Charmeleon",
        "Charizard",
        "Squirtle",
        "Wartortle",
        "Blastoise",
        "Pikachu",
        "Raichu",
        "Onix",
        "Gengar",
        "Snorlax",
        "Chikorita",
        "Typhlosion",
        "Treecko",
        "Grovyle",
        "Mudkip",
        "Swampert",
    ]
    rows: list[dict[str, Any]] = []
    for idx in range(1020):
        baseName = names[idx % len(names)]
        generation = 1 + idx % 5
        hp = 35 + (idx * 7) % 125
        attack = 42 + (idx * 11) % 115
        defense = 38 + (idx * 13) % 120
        specialAttack = 45 + (idx * 17) % 125
        specialDefense = 40 + (idx * 19) % 110
        speed = 30 + (idx * 23) % 120
        rows.append({
            "Name": f"{baseName}-{generation}-{idx + 1}",
            "Generation": generation,
            "HP": hp,
            "Attack": attack,
            "Defense": defense,
            "Sp. Atk": specialAttack,
            "Sp. Def": specialDefense,
            "Speed": speed,
        })
    return _dataFrame(rows)


def _globalTempData():
    rows: list[dict[str, Any]] = []
    for idx in range(180):
        year = 1880 + idx // 12
        month = idx % 12 + 1
        season = [-0.08, -0.05, -0.02, 0.02, 0.05, 0.08, 0.09, 0.07, 0.03, 0.00, -0.03, -0.06][month - 1]
        trend = (year - 1880) * 0.017
        mean = round(-0.24 + trend + season + ((idx % 7) - 3) * 0.006, 3)
        rows.append({"Source": "GCAG" if idx % 3 else "GISTEMP", "Date": f"{year}-{month:02d}-01", "Mean": mean})
    return _dataFrame(rows)


def _earthquakesData():
    rows: list[dict[str, Any]] = []
    regions = [
        (35.2, 139.1),
        (-6.1, 106.8),
        (38.4, -122.3),
        (-12.7, -77.0),
        (52.1, -168.4),
        (19.4, -155.2),
        (-3.2, 142.1),
        (41.7, 29.0),
    ]
    for idx in range(160):
        latBase, lonBase = regions[idx % len(regions)]
        magnitude = round(3.0 + (idx % 42) * 0.09 + (0.7 if idx % 19 == 0 else 0), 1)
        rows.append({
            "Date": f"2026-{idx % 12 + 1:02d}-{idx % 28 + 1:02d}",
            "Latitude": round(latBase + ((idx % 9) - 4) * 0.35, 3),
            "Longitude": round(lonBase + ((idx % 11) - 5) * 0.42, 3),
            "Magnitude": magnitude,
            "Depth": 6 + (idx * 7) % 92,
        })
    return _dataFrame(rows)


def _spotifySongsData():
    rows: list[dict[str, Any]] = []
    genres = ["pop", "rock", "edm", "acoustic", "ambient", "hiphop"]
    artists = ["Nova", "Mira", "Pulse", "Rift", "Eon", "Kite", "Orbit", "Sol"]
    for idx in range(144):
        genre = genres[idx % len(genres)]
        energyBase = {"pop": 0.72, "rock": 0.78, "edm": 0.88, "acoustic": 0.38, "ambient": 0.28, "hiphop": 0.66}[genre]
        danceBase = {"pop": 0.74, "rock": 0.58, "edm": 0.84, "acoustic": 0.42, "ambient": 0.30, "hiphop": 0.77}[genre]
        acousticBase = {"pop": 0.20, "rock": 0.18, "edm": 0.08, "acoustic": 0.72, "ambient": 0.86, "hiphop": 0.16}[genre]
        rows.append({
            "track_name": f"{genre.title()} Track {idx + 1}",
            "track_artist": artists[(idx // 2) % len(artists)],
            "playlist_genre": genre,
            "track_popularity": 35 + (idx * 7) % 63,
            "danceability": round(min(0.98, danceBase + ((idx % 5) - 2) * 0.025), 3),
            "energy": round(min(0.99, energyBase + ((idx % 7) - 3) * 0.022), 3),
            "loudness": round(-16 + energyBase * 12 + (idx % 6) * 0.35, 2),
            "speechiness": round(0.03 + (idx % 8) * 0.011, 3),
            "acousticness": round(max(0.02, min(0.95, acousticBase + ((idx % 6) - 3) * 0.035)), 3),
            "instrumentalness": round(0.01 + (0.45 if genre == "ambient" else 0.04) + (idx % 5) * 0.015, 3),
            "liveness": round(0.07 + (idx % 10) * 0.018, 3),
            "valence": round(0.24 + (idx % 11) * 0.055, 3),
            "tempo": 68 + (idx * 7) % 78,
        })
    return _dataFrame(rows)


def _weightHeightData():
    rows: list[dict[str, Any]] = []
    for idx in range(160):
        gender = "Male" if idx % 2 else "Female"
        baseHeight = 69.5 if gender == "Male" else 64.2
        height = round(baseHeight + ((idx % 17) - 8) * 0.42, 2)
        weight = round((102 if gender == "Male" else 86) + height * 1.18 + ((idx % 9) - 4) * 2.4, 2)
        rows.append({"Gender": gender, "Height": height, "Weight": weight})
    return _dataFrame(rows)


def _heartData():
    rows: list[dict[str, Any]] = []
    for idx in range(303):
        age = 35 + (idx * 3) % 38
        trestbps = 112 + (idx * 5) % 48
        chol = 165 + (idx * 7) % 155
        target = int(sum([chol > 225, trestbps > 135, age > 56, idx % 5 == 0]) >= 2)
        rows.append({
            "age": age,
            "sex": idx % 2,
            "cp": idx % 4,
            "trestbps": trestbps,
            "chol": chol,
            "fbs": int(idx % 9 == 0),
            "restecg": idx % 2,
            "thalach": 178 - (idx * 4) % 58,
            "exang": int(idx % 5 == 0),
            "oldpeak": round((idx % 18) / 5, 1),
            "slope": idx % 3,
            "ca": idx % 4,
            "thal": 2 + idx % 2,
            "target": target,
        })
    return _dataFrame(rows)


def _airqualityData():
    rows: list[dict[str, Any]] = []
    for idx in range(153):
        month = 5 + idx // 31
        day = idx % 31 + 1
        ozone = None if idx % 17 == 0 else 18 + (idx * 5) % 72
        solar = None if idx % 23 == 0 else 90 + (idx * 11) % 230
        rows.append({
            "Ozone": ozone,
            "Solar.R": solar,
            "Wind": round(5.2 + (idx % 18) * 0.8, 1),
            "Temp": 58 + (idx * 3) % 39,
            "Month": month,
            "Day": day,
        })
    return _dataFrame(rows)


def _happinessData():
    rows: list[dict[str, Any]] = []
    anchors = {1: "Finland", 7: "Netherlands", 19: "United States", 54: "Korea", 72: "Japan", 99: "Brazil"}
    for rank in range(1, 157):
        country = anchors.get(rank, f"Country {rank:03d}")
        rows.append({
            "Country or region": country,
            "Score": round(7.85 - rank * 0.023, 3),
            "GDP per capita": round(1.48 - rank * 0.0056, 3),
            "Social support": round(1.64 - rank * 0.0041, 3),
            "Healthy life expectancy": round(1.08 - rank * 0.0032, 3),
            "Freedom to make life choices": round(0.63 - rank * 0.0016, 3),
        })
    return _dataFrame(rows)


def _abaloneData():
    rows: list[dict[str, Any]] = []
    sexes = ["M", "F", "I"]
    for idx in range(180):
        length = round(0.34 + (idx % 32) * 0.011, 3)
        diameter = round(length * 0.78 + (idx % 5) * 0.003, 3)
        height = round(length * 0.25 + (idx % 4) * 0.004, 3)
        whole = round(length * 1.85 + (idx % 9) * 0.025, 3)
        rings = 5 + (idx % 17) + int(length > 0.55)
        rows.append({
            "Sex": sexes[idx % 3],
            "Length": length,
            "Diameter": diameter,
            "Height": height,
            "WholeWeight": whole,
            "ShuckedWeight": round(whole * 0.42, 3),
            "VisceraWeight": round(whole * 0.21, 3),
            "ShellWeight": round(whole * 0.29, 3),
            "Rings": rings,
        })
    return _dataFrame(rows)


def _diabetesData():
    rows: list[dict[str, Any]] = []
    for idx in range(220):
        pregnancies = idx % 12
        glucose = 78 + (idx * 7) % 122
        bloodPressure = 52 + (idx * 5) % 50
        skin = 12 + (idx * 3) % 42
        insulin = 35 + (idx * 17) % 260
        bmi = round(21.0 + (idx * 1.7) % 24, 1)
        pedigree = round(0.08 + (idx % 60) * 0.026, 3)
        age = 21 + (idx * 2) % 48
        outcome = int(sum([glucose > 135, bmi > 32, age > 45, pregnancies > 6]) >= 2)
        rows.append({
            "Pregnancies": pregnancies,
            "Glucose": glucose,
            "BloodPressure": bloodPressure,
            "SkinThickness": skin,
            "Insulin": insulin,
            "BMI": bmi,
            "DiabetesPedigree": pedigree,
            "Age": age,
            "Outcome": outcome,
        })
    return _dataFrame(rows)


def _imdbMoviesData():
    rows: list[dict[str, Any]] = []
    genres = [
        "Action,Adventure",
        "Drama",
        "Comedy,Drama",
        "Horror,Mystery",
        "Animation,Adventure",
        "Drama,Sci-Fi",
    ]
    directors = ["Ava Stone", "Noah Kim", "Mina Park", "Leo Grant", "Iris Chen", "Owen Vale"]
    for idx in range(1000):
        genre = genres[idx % len(genres)]
        year = 2006 + idx % 11
        rating = round(6.2 + (idx % 19) * 0.12 + (0.45 if "Drama" in genre else 0.0), 1)
        rows.append({
            "Title": f"Film {idx + 1:03d}",
            "Genre": genre,
            "Director": directors[(idx // 3) % len(directors)],
            "Year": year,
            "Rating": min(9.2, rating),
            "Revenue (Millions)": round(18 + (idx * 13) % 280 + rating * 4, 1),
        })
    return _dataFrame(rows)


def _videoGamesData():
    rows: list[dict[str, Any]] = []
    platforms = ["Switch", "PS5", "PC", "Xbox", "Mobile", "Wii"]
    genres = ["Sports", "Racing", "Action", "Role-Playing", "Simulation", "Shooter"]
    publishers = ["Nintendo", "EA Sports", "Studio Atlas", "North Star", "Pixel Forge", "Ubisoft"]
    for idx in range(144):
        na = round(0.3 + (idx * 7) % 42 / 5, 2)
        eu = round(0.2 + (idx * 5) % 35 / 5, 2)
        jp = round(0.05 + (idx * 3) % 18 / 8, 2)
        other = round(0.1 + (idx * 2) % 15 / 6, 2)
        rows.append({
            "Name": f"Game {idx + 1:03d}",
            "Platform": platforms[idx % len(platforms)],
            "Year": 2000 + idx % 24,
            "Genre": genres[(idx // 2) % len(genres)],
            "Publisher": publishers[(idx // 3) % len(publishers)],
            "NA_Sales": na,
            "EU_Sales": eu,
            "JP_Sales": jp,
            "Other_Sales": other,
            "Global_Sales": round(na + eu + jp + other, 2),
        })
    return _dataFrame(rows)


def _appleStockData():
    rows: list[dict[str, Any]] = []
    close = 108.0
    for idx in range(180):
        day = idx % 28 + 1
        month = idx // 28 + 1
        drift = ((idx % 9) - 3) * 0.42 + 0.08
        openPrice = close + ((idx % 5) - 2) * 0.35
        close = max(80.0, openPrice + drift)
        high = max(openPrice, close) + 1.2 + (idx % 4) * 0.18
        low = min(openPrice, close) - 1.1 - (idx % 3) * 0.16
        rows.append({
            "Date": f"2015-{month:02d}-{day:02d}",
            "AAPL.Open": round(openPrice, 2),
            "AAPL.High": round(high, 2),
            "AAPL.Low": round(low, 2),
            "AAPL.Close": round(close, 2),
            "AAPL.Volume": 42_000_000 + (idx * 1_370_000) % 28_000_000,
        })
    return _dataFrame(rows)


def _fifaPlayersData():
    rows: list[dict[str, Any]] = []
    positions = ["GK", "CB", "CM", "LW", "RW", "ST"]
    for idx in range(144):
        position = positions[idx % len(positions)]
        attackBoost = 15 if position in {"LW", "RW", "ST"} else -8 if position == "GK" else 0
        defendBoost = 20 if position in {"GK", "CB"} else 6 if position == "CM" else -10
        rows.append({
            "Name": f"Player {idx + 1:03d}",
            "Position": position,
            "Overall": 62 + (idx * 5) % 32,
            "Pace": 58 + (idx * 7) % 39,
            "Shooting": max(25, 50 + (idx * 4) % 40 + attackBoost),
            "Passing": 55 + (idx * 6) % 38,
            "Dribbling": 54 + (idx * 5) % 42,
            "Defending": max(15, 42 + (idx * 3) % 42 + defendBoost),
            "Physical": 56 + (idx * 8) % 38,
        })
    return _dataFrame(rows)


def _bostonHousingData():
    rows: list[dict[str, Any]] = []
    for idx in range(160):
        rm = round(5.2 + (idx % 34) * 0.065, 2)
        lstat = round(5 + (idx * 7) % 25 + (0.8 if idx % 13 == 0 else 0), 2)
        tax = 180 + (idx * 17) % 300
        ptratio = round(14.5 + (idx % 15) * 0.38, 1)
        chas = int(idx % 19 == 0)
        medv = round(8 + 5.1 * rm - 0.42 * lstat - 0.006 * tax + chas * 2.4, 2)
        rows.append({
            "crim": round(0.05 + (idx * 0.037) % 3.7, 3),
            "zn": [0, 12, 0, 25, 0, 30, 0, 20][idx % 8],
            "indus": round(2.1 + (idx * 0.43) % 12, 2),
            "chas": chas,
            "rm": rm,
            "tax": tax,
            "ptratio": ptratio,
            "lstat": lstat,
            "medv": medv,
        })
    return _dataFrame(rows)


def _insuranceData():
    rows: list[dict[str, Any]] = []
    regions = ["northeast", "northwest", "southeast", "southwest"]
    for idx in range(160):
        age = 19 + (idx * 3) % 45
        bmi = round(21 + (idx * 1.7) % 18, 1)
        children = idx % 5
        smoker = "yes" if idx % 5 in {0, 1} else "no"
        sex = "male" if idx % 2 else "female"
        region = regions[idx % len(regions)]
        charges = 1800 + age * 115 + bmi * 180 + children * 450 + (12000 if smoker == "yes" else 0)
        rows.append({
            "age": age,
            "sex": sex,
            "bmi": bmi,
            "children": children,
            "smoker": smoker,
            "region": region,
            "charges": round(charges, 2),
        })
    return _dataFrame(rows)


def _airlinePassengersData():
    rows: list[dict[str, Any]] = []
    season = [0, 6, 18, 15, 10, 24, 38, 39, 27, 12, -3, 8]
    for idx in range(144):
        year = 1949 + idx // 12
        month = idx % 12 + 1
        passengers = 112 + idx * 3 + season[month - 1] + (idx // 24) * 8
        rows.append({"Month": f"{year}-{month:02d}", "Passengers": passengers})
    return _dataFrame(rows)


def _churnData():
    rows: list[dict[str, Any]] = []
    contracts = ["Month-to-month", "One year", "Two year"]
    for idx in range(180):
        tenure = 1 + (idx * 7) % 72
        monthly = round(35 + (idx * 4.7) % 85, 2)
        contract = contracts[idx % len(contracts)]
        techSupport = "Yes" if idx % 4 in {0, 1} else "No"
        churn = "Yes" if (contract == "Month-to-month" and monthly > 70) or (tenure < 8 and techSupport == "No") else "No"
        rows.append({
            "tenure": tenure,
            "MonthlyCharges": monthly,
            "TotalCharges": f"{tenure * monthly:.2f}",
            "Contract": contract,
            "TechSupport": techSupport,
            "Churn": churn,
        })
    return _dataFrame(rows)


def _hrAttritionData():
    rows: list[dict[str, Any]] = []
    departments = ["Sales", "Research & Development", "Human Resources"]
    for idx in range(180):
        age = 23 + (idx * 2) % 38
        income = 2800 + (idx * 390) % 9500
        years = (idx * 3) % 18
        overtime = "Yes" if idx % 4 in {0, 1} else "No"
        workLife = 1 + idx % 4
        satisfaction = 1 + (idx * 2) % 4
        attrition = "Yes" if (overtime == "Yes" and workLife <= 2) or (income < 4200 and years < 4) else "No"
        rows.append({
            "Age": age,
            "MonthlyIncome": income,
            "YearsAtCompany": years,
            "TotalWorkingYears": years + 2 + idx % 9,
            "DistanceFromHome": 1 + (idx * 5) % 28,
            "NumCompaniesWorked": idx % 7,
            "OverTime": overtime,
            "WorkLifeBalance": workLife,
            "JobSatisfaction": satisfaction,
            "Department": departments[idx % len(departments)],
            "Attrition": attrition,
        })
    return _dataFrame(rows)


def _dailyBirthsData():
    rows: list[dict[str, Any]] = []
    start = date(1959, 1, 1)
    for idx in range(365):
        current = start + timedelta(days=idx)
        weekly = [0, 2, 4, 3, 1, -2, -3][idx % 7]
        births = 36 + (idx % 30) // 6 + weekly + (idx // 90)
        rows.append({"Date": current.isoformat(), "Births": births})
    return _dataFrame(rows)


def _bikeDemandData():
    rows: list[dict[str, Any]] = []
    start = date(2025, 1, 1)
    for idx in range(365):
        current = start + timedelta(days=idx)
        weekday = current.weekday()
        weekendPenalty = -22 if weekday >= 5 else 0
        seasonBoost = [0, 5, 14, 25, 38, 46, 52, 49, 34, 20, 8, -3][current.month - 1]
        trend = idx // 28
        weatherNoise = [4, -3, 6, -8, 2, 0, -5][idx % 7]
        demand = max(35, 120 + seasonBoost + weekendPenalty + trend + weatherNoise)
        rows.append({"Date": current.isoformat(), "Demand": demand})
    return _dataFrame(rows)


def _sonarData():
    rows: list[dict[str, Any]] = []
    for idx in range(96):
        label = "R" if idx < 48 else "M"
        base = 0.24 if label == "R" else 0.62
        row = {
            f"f{feature}": round(base + ((idx + feature * 3) % 17 - 8) * 0.006 + feature * 0.0015, 4)
            for feature in range(60)
        }
        row["label"] = label
        rows.append(row)
    return _dataFrame(rows)


def _titanicPassengersData():
    rows: list[dict[str, Any]] = []
    embarkedValues = ["S", "C", "Q", "S"]
    for idx in range(180):
        passengerId = idx + 1
        pclass = idx % 3 + 1
        sex = "female" if idx % 4 < 2 else "male"
        age: float | None = float(18 + idx % 50)
        if idx % 13 == 0:
            age = None
        survived = int(sex == "female" or (pclass == 1 and idx % 2 == 0))
        embarked = embarkedValues[idx % len(embarkedValues)]
        if idx % 17 == 0:
            embarked = None
        rows.append({
            "PassengerId": passengerId,
            "Survived": survived,
            "Pclass": pclass,
            "Name": f"Local Passenger {passengerId}",
            "Sex": sex,
            "Age": age,
            "SibSp": idx % 3,
            "Parch": (idx + 1) % 3,
            "Ticket": f"LOCAL-{idx + 1000}",
            "Fare": round(9.5 + (4 - pclass) * 18 + (idx % 7) * 2.5, 2),
            "Cabin": "C85" if pclass == 1 else None,
            "Embarked": embarked,
        })
    return _dataFrame(rows)


def _tipsData():
    rows: list[dict[str, Any]] = []
    days = ["Thur", "Fri", "Sat", "Sun"]
    for idx in range(120):
        day = days[idx % len(days)]
        time = "Lunch" if day == "Thur" or (day == "Fri" and idx % 3 == 0) else "Dinner"
        size = [2, 2, 3, 4, 2, 5][idx % 6]
        smoker = "Yes" if idx % 5 in {0, 3} else "No"
        sex = "Female" if idx % 4 in {0, 1} else "Male"
        weekendBoost = 7 if day in {"Sat", "Sun"} else 0
        totalBill = round(12 + weekendBoost + size * 3.1 + (idx % 11) * 1.35, 2)
        tipRate = 0.13 + (0.02 if time == "Dinner" else 0) + (0.01 if smoker == "No" else -0.005)
        tip = round(max(1.0, totalBill * tipRate + (idx % 4) * 0.25), 2)
        rows.append({
            "total_bill": totalBill,
            "tip": tip,
            "sex": sex,
            "smoker": smoker,
            "day": day,
            "time": time,
            "size": size,
        })
    return _dataFrame(rows)


def _irisData():
    rows: list[dict[str, Any]] = []
    specs = [
        ("setosa", 5.0, 3.4, 1.45, 0.25),
        ("versicolor", 5.9, 2.8, 4.25, 1.35),
        ("virginica", 6.5, 3.0, 5.55, 2.05),
    ]
    for species, sepalLength, sepalWidth, petalLength, petalWidth in specs:
        for idx in range(50):
            offset = (idx % 10 - 4.5) / 10
            rows.append({
                "sepal_length": round(sepalLength + offset * 0.45 + (idx // 10) * 0.03, 2),
                "sepal_width": round(sepalWidth - offset * 0.20 + (idx % 5) * 0.02, 2),
                "petal_length": round(petalLength + offset * 0.35 + (idx // 10) * 0.04, 2),
                "petal_width": round(petalWidth + offset * 0.12 + (idx % 4) * 0.03, 2),
                "species": species,
            })
    return _dataFrame(rows)


def _penguinsData():
    rows: list[dict[str, Any]] = []
    specs = [
        ("Adelie", "Torgersen", 38.8, 18.3, 188, 3700),
        ("Chinstrap", "Dream", 48.8, 18.4, 196, 3730),
        ("Gentoo", "Biscoe", 47.5, 15.0, 217, 5075),
    ]
    for species, island, billLength, billDepth, flipperLength, bodyMass in specs:
        for idx in range(40):
            sex = "Female" if idx % 2 == 0 else "Male"
            sexMass = -180 if sex == "Female" else 220
            rows.append({
                "species": species,
                "island": island,
                "bill_length_mm": round(billLength + (idx % 8 - 3.5) * 0.55, 1),
                "bill_depth_mm": round(billDepth + (idx % 6 - 2.5) * 0.28, 1),
                "flipper_length_mm": int(flipperLength + (idx % 10 - 4) * 2),
                "body_mass_g": int(bodyMass + sexMass + (idx % 9 - 4) * 55),
                "sex": sex,
            })
    return _dataFrame(rows)


def _titanicData():
    rows: list[dict[str, Any]] = []
    embarkedCities = [("S", "Southampton"), ("C", "Cherbourg"), ("Q", "Queenstown")]
    for idx in range(180):
        pclass = [1, 2, 3, 3, 2, 1][idx % 6]
        sex = "female" if idx % 5 in {0, 1} else "male"
        age = 6 + (idx * 7) % 62
        fare = round((86 if pclass == 1 else 34 if pclass == 2 else 13) + (idx % 13) * 2.15, 2)
        embarked, town = embarkedCities[idx % len(embarkedCities)]
        survived = int(sex == "female" or (pclass == 1 and idx % 3 != 0) or age < 12)
        rows.append({
            "survived": survived,
            "pclass": pclass,
            "sex": sex,
            "age": age,
            "sibsp": idx % 3,
            "parch": (idx + 1) % 3,
            "fare": fare,
            "embarked": embarked,
            "class": {1: "First", 2: "Second", 3: "Third"}[pclass],
            "who": "child" if age < 16 else "woman" if sex == "female" else "man",
            "adult_male": sex == "male" and age >= 16,
            "deck": ["A", "B", "C", "D", "E", None][idx % 6],
            "embark_town": town,
            "alive": "yes" if survived else "no",
            "alone": idx % 4 == 0,
        })
    return _dataFrame(rows)


def _flightsData():
    rows: list[dict[str, Any]] = []
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    season = [0, -4, 8, 12, 20, 35, 52, 48, 24, 10, -2, 6]
    for year in range(1949, 1961):
        trend = (year - 1949) * 23
        for monthIndex, month in enumerate(months):
            rows.append({
                "year": year,
                "month": month,
                "passengers": 112 + trend + season[monthIndex] + (monthIndex % 3) * 3,
            })
    return _dataFrame(rows)


def _diamondsData():
    rows: list[dict[str, Any]] = []
    cuts = ["Fair", "Good", "Very Good", "Premium", "Ideal"]
    colors = ["D", "E", "F", "G", "H", "I", "J"]
    clarities = ["I1", "SI2", "SI1", "VS2", "VS1", "VVS2", "VVS1", "IF"]
    for idx in range(5400):
        cut = cuts[idx % len(cuts)]
        color = colors[(idx // 5) % len(colors)]
        clarity = clarities[(idx // 11) % len(clarities)]
        carat = round(0.23 + (idx % 160) / 70 + (idx // 900) * 0.08, 2)
        cutPremium = cuts.index(cut) * 260
        colorPremium = (len(colors) - colors.index(color)) * 55
        clarityPremium = clarities.index(clarity) * 75
        price = int(520 + carat * 3900 + cutPremium + colorPremium + clarityPremium + (idx % 29) * 18)
        rows.append({
            "carat": carat,
            "cut": cut,
            "color": color,
            "clarity": clarity,
            "depth": round(59.5 + (idx % 17) * 0.22, 1),
            "table": round(54 + (idx % 12) * 0.6, 1),
            "price": price,
            "x": round(3.8 + carat * 1.35, 2),
            "y": round(3.75 + carat * 1.31, 2),
            "z": round(2.2 + carat * 0.82, 2),
        })
    return _dataFrame(rows)


def _mpgData():
    rows: list[dict[str, Any]] = []
    origins = ["usa", "europe", "japan"]
    for idx in range(144):
        origin = origins[idx % len(origins)]
        cylinders = [4, 4, 6, 8, 4, 6][idx % 6]
        displacement = 85 + cylinders * 22 + (idx % 12) * 7
        horsepower = 52 + cylinders * 13 + (idx % 10) * 6
        weight = 1800 + cylinders * 260 + (idx % 15) * 85
        acceleration = round(22 - cylinders * 0.9 + (idx % 8) * 0.35, 1)
        modelYear = 70 + idx % 13
        originBoost = {"usa": -2.0, "europe": 2.0, "japan": 3.0}[origin]
        mpg = round(46 - weight / 210 - horsepower / 28 + originBoost + (modelYear - 70) * 0.35, 1)
        rows.append({
            "mpg": max(9.5, mpg),
            "cylinders": cylinders,
            "displacement": displacement,
            "horsepower": horsepower,
            "weight": weight,
            "acceleration": acceleration,
            "model_year": modelYear,
            "origin": origin,
            "name": f"{origin}-model-{idx + 1}",
        })
    return _dataFrame(rows)


def _carCrashesData():
    rows: list[dict[str, Any]] = []
    abbreviations = [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "DC",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
    ]
    for idx, abbrev in enumerate(abbreviations):
        total = round(8.5 + (idx % 13) * 0.85 + (idx // 13) * 1.15, 1)
        speeding = round(total * (0.18 + (idx % 5) * 0.025), 1)
        alcohol = round(total * (0.23 + (idx % 7) * 0.018), 1)
        notDistracted = round(total * (0.78 + (idx % 4) * 0.035), 1)
        noPrevious = round(total * (0.70 + (idx % 6) * 0.028), 1)
        rows.append({
            "total": total,
            "speeding": speeding,
            "alcohol": alcohol,
            "not_distracted": notDistracted,
            "no_previous": noPrevious,
            "ins_premium": round(680 + (idx % 17) * 28.5 + (idx // 10) * 42, 2),
            "ins_losses": round(78 + (idx % 19) * 4.7 + (idx // 12) * 6.4, 2),
            "abbrev": abbrev,
        })
    return _dataFrame(rows)


def _exerciseData():
    rows: list[dict[str, Any]] = []
    times = ["1 min", "15 min", "30 min"]
    for subject in range(1, 31):
        diet = "low fat" if subject % 2 else "no fat"
        kind = ["rest", "walking", "running"][subject % 3]
        base = 82 if kind == "rest" else 96 if kind == "walking" else 118
        for timeIndex, time in enumerate(times):
            rows.append({
                "id": subject,
                "diet": diet,
                "pulse": base + timeIndex * (3 if kind == "rest" else 9 if kind == "walking" else 15) + subject % 5,
                "time": time,
                "kind": kind,
            })
    return _dataFrame(rows)


def _anscombeData():
    rows: list[dict[str, Any]] = []
    for dataset in ["I", "II", "III", "IV"]:
        for idx, xValue in enumerate([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]):
            curve = {"I": 0.50, "II": 0.08 * (xValue - 9) ** 2, "III": 0.45, "IV": 0.50}[dataset]
            yValue = round(3 + curve * xValue + (idx % 3 - 1) * 0.35, 2)
            rows.append({"dataset": dataset, "x": xValue if dataset != "IV" else 8 + idx % 3, "y": yValue})
    return _dataFrame(rows)
