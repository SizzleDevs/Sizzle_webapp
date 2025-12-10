<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>Sizzle - Wat wordt het vanavond?</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0" />
</head>
<body>
    <div class="container">
        <header>
            <div class="logo" onclick="window.location.href='index.php'" style="cursor: pointer;">Sizzle</div>
            <div class="header-icons">
                <span class="material-symbols-rounded" onclick="window.location.href='favorites.php'" style="cursor: pointer;">favorite</span>
                <span class="material-symbols-rounded" onclick="redirectToProfileIfLoggedIn()" style="cursor: pointer;">person</span>
            </div>
        </header>

        <section class="hero">
            <h1>Wat wordt het<br>vanavond, <span id="user-display-name" class="highlight">Gebruiker</span>?</h1>

            
            <div class="search-bar">
                <div class="search-input-wrapper">
                    <input type="text" placeholder="Zoek recepten...">
                    <button class="search-button"><span class="material-symbols-rounded">search</span> Zoek</button>
                </div>
            </div>

            <div class="filters">
                <button class="filter-tag">Avondeten</button>
                <button class="filter-tag">Italiaans</button>
                <button class="filter-tag">Snel</button>
                <a href="alle-recepten.php" style="align-self: center; font-size: 0.8rem; font-weight: bold; text-decoration: none; color: inherit;">Meer filters...</a>
            </div>
        </section>

        <div id="content-area">
            <!-- Sections will be injected here by JS -->
        </div>

        <div class="discover-more">
            <h2>Nog meer gerechten<br>ontdekken?</h2>
            <button class="discover-btn" onclick="window.location.href='alle-recepten.php'"><span class="material-symbols-rounded">list</span> Alle gerechten</button>
        </div>

        <footer class="page-footer">
            <p>Made by Team Sizzle Devs 2025 ©</p>
        </footer>
    </div>

    <script src="auth.js"></script>
    <script type="module" src="home.js"></script>
</body>
</html>
