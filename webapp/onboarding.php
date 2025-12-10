<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>Sizzle - Welkom</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0" />
    <link rel="stylesheet" href="onboarding.css">
</head>
<body>
    <div class="onboarding-container">
        <header>
            <div class="logo" onclick="window.location.href='index.php'" style="cursor: pointer;">Sizzle</div>
        </header>

        <!-- Step 1: Account Info -->
        <div class="onboarding-step active" id="step-1">
            <div class="step-content">
                <h1>Welkom bij <span class="highlight">Sizzle</span></h1>
                <p class="subtitle">Maak een account aan om te beginnen</p>
                
                <form class="onboarding-form" id="account-form">
                    <div class="form-group">
                        <label for="username">Gebruikersnaam</label>
                        <div class="input-wrapper">
                            <input type="text" id="username" placeholder="Bijv. chefkok123" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="password">Wachtwoord</label>
                        <div class="input-wrapper">
                            <input type="password" id="password" placeholder="Minimaal 8 karakters" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="name">Naam</label>
                        <div class="input-wrapper">
                            <input type="text" id="name" placeholder="Hoe mogen we je noemen?" required>
                        </div>
                    </div>
                </form>
                
                <div class="login-options">
                    <button class="next-btn" id="to-step-2">Volgende</button>
                </div>
            </div>
            
            <div class="step-footer">
                <div class="step-indicators">
                    <span class="indicator active"></span>
                    <span class="indicator"></span>
                </div>
            </div>
        </div>

        <!-- Step 2: Pick Your Tags -->
        <div class="onboarding-step" id="step-2">
            <div class="step-content">
                <h1>Kies je <span class="highlight">interesses</span></h1>
                <p class="subtitle">Selecteer tags die bij jou passen</p>
                
                <div class="tags-container" id="tags-container">
                    <!-- Tags will be injected by JS -->
                </div>
            </div>
            
            <div class="step-footer">
                <div class="step-indicators">
                    <span class="indicator"></span>
                    <span class="indicator active"></span>
                </div>
                <button class="next-btn" id="finish-btn">
                    <span>Aan de slag</span>
                </button>
            </div>
        </div>
    </div>

    <footer class="page-footer">
        <p>Made by Team Sizzle Devs 2025 ©</p>
    </footer>

    <script src="auth.js"></script>
    <script src="onboarding.js"></script>
</body>
</html>
