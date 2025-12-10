<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>Sizzle - Inloggen</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0" />
    <link rel="stylesheet" href="onboarding.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
</head>
<body>
    <div class="onboarding-container">
        <header>
            <div class="logo" onclick="window.location.href='index.php'" style="cursor: pointer;">Sizzle</div>
        </header>

        <div class="onboarding-step active" id="login-step">
            <div class="step-content">
                <h1>Welkom terug bij <span class="highlight">Sizzle</span></h1>
                <p class="subtitle">Log in om door te gaan</p>
                
                <form class="onboarding-form" id="login-form">
                    <div class="form-group">
                        <label for="username">Gebruikersnaam</label>
                        <div class="input-wrapper">
                            <input type="text" id="username" placeholder="Bijv. chefkok123" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="password">Wachtwoord</label>
                        <div class="input-wrapper">
                            <input type="password" id="password" placeholder="Voer je wachtwoord in" required>
                        </div>
                    </div>
                </form>
                
                <div class="login-options">
                    <button class="next-btn" id="login-btn">Inloggen</button>
                    <button class="secondary-btn" onclick="window.location.href='onboarding.php'">Ik heb geen account</button>
                </div>
            </div>
        </div>
    </div>

    <footer class="page-footer">
        <p>Made by Team Sizzle Devs 2025 ©</p>
    </footer>

    <script src="auth.js"></script>
    <script src="login.js"></script>
</body>
</html>