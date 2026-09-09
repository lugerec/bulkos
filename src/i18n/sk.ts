/**
 * Slovak dictionary, keyed by the English source string.
 *
 * Deliberately NOT translated: exercise names, muscle group names and most
 * gym terminology (Bench Press, Lat Pulldown, RPE, 1RM). Slovak lifters use
 * the English terms; "tlak na lavičke" reads as a textbook, not a gym app.
 * Slovak search aliases live with the exercise data instead.
 */
export const sk: Record<string, string> = {
  // ── Navigation ────────────────────────────────────────────────────────────
  "Home": "Domov",
  "Nutrition": "Výživa",
  "Train": "Tréning",
  "Progress": "Progres",
  "Settings": "Nastavenia",

  // ── Common actions ────────────────────────────────────────────────────────
  "Save": "Uložiť",
  "Cancel": "Zrušiť",
  "Delete": "Zmazať",
  "Edit": "Upraviť",
  "Add": "Pridať",
  "Done": "Hotovo",
  "Back": "Späť",
  "Close": "Zavrieť",
  "Continue": "Pokračovať",
  "Retry": "Skúsiť znova",
  "View all": "Zobraziť všetko",
  "Saving...": "Ukladá sa...",
  "Loading...": "Načítava sa...",
  "Resume": "Pokračovať",

  // ── Settings screen ───────────────────────────────────────────────────────
  "Preferences": "Predvoľby",
  "Integrations": "Prepojenia",
  "Tools": "Nástroje",
  "Remind me at": "Pripomenúť o",
  "Dark Mode": "Tmavý režim",
  "Accent colour": "Farba akcentu",
  "Units": "Jednotky",
  "Metric": "Metrické",
  "Imperial": "Imperiálne",
  "Appearance": "Vzhľad",
  "Theme": "Motív",
  "Dark": "Tmavý",
  "Light": "Svetlý",
  "Language": "Jazyk",
  "Accent": "Akcent",
  "Notifications": "Notifikácie",
  "Streak reminder": "Pripomienka série",
  "Account": "Účet",
  "Log out": "Odhlásiť sa",
  "Export data": "Exportovať dáta",
  "Export as CSV": "Exportovať ako CSV",
  "Experience level": "Úroveň skúseností",
  "Beginner": "Začiatočník",
  "Intermediate": "Pokročilý",
  "Advanced": "Expert",
  "Custom": "Vlastné",
  "Apple Health": "Apple Health",
  "Apple Watch": "Apple Watch",

  // ── Reminder status messages ──────────────────────────────────────────────
  "Reminders only work in the app, not in a browser.":
    "Pripomienky fungujú len v aplikácii, nie v prehliadači.",
  "Notifications are turned off for BulkOS. Enable them in iPhone Settings → BulkOS → Notifications.":
    "Notifikácie sú pre BulkOS vypnuté. Zapni ich v Nastavenia iPhonu → BulkOS → Notifikácie.",
  "Couldn't turn on reminders: {detail}":
    "Pripomienky sa nepodarilo zapnúť: {detail}",
  "Couldn't schedule the reminder: {detail}":
    "Pripomienku sa nepodarilo naplánovať: {detail}",
  "Notifications failed: {detail}": "Notifikácie zlyhali: {detail}",
  "Send a test notification": "Poslať testovaciu notifikáciu",
  "Sending...": "Odosiela sa...",
  "Scheduled — it should arrive in about 5 seconds.":
    "Naplánované — mala by prísť do 5 sekúnd.",
  "Failed: {detail}": "Zlyhalo: {detail}",
  "BulkOS reminders work": "Pripomienky BulkOS fungujú",
  "This is a test notification.": "Toto je testovacia notifikácia.",
  "Keep your streak alive": "Udrž si sériu",
  "Log a workout or hit your protein target today.":
    "Zapíš si dnes tréning alebo splň cieľ bielkovín.",
  "Rest over": "Koniec pauzy",
  "Time for your next set.": "Čas na ďalšiu sériu.",

  // ── Check-in / progress photos ────────────────────────────────────────────
  "Weekly Check-in": "Týždenný check-in",
  "Track your body changes over time.":
    "Sleduj zmeny svojho tela v čase.",
  "Save Check-in": "Uložiť check-in",
  "Check-in History": "História check-inov",
  "No check-ins logged yet.": "Zatiaľ žiadne check-iny.",
  "Progress Photos": "Fotky progresu",
  "Photo Comparison": "Porovnanie fotiek",
  "Weight": "Váha",
  "Body Fat": "Telesný tuk",
  "Waist": "Pás",
  "Chest": "Hrudník",
  "Arms": "Ruky",
  "Legs": "Nohy",
  "Front": "Spredu",
  "Side": "Zboku",
  "Back photo": "Zozadu",
  "Before": "Pred",
  "After": "Po",
  "Upload": "Nahrať",
  "Remove {label} photo": "Odstrániť fotku {label}",
  "{label} progress photo": "Fotka progresu — {label}",
  "No {label}": "Žiadna fotka ({label})",
  "No {type} photo": "Žiadna fotka ({type})",
  "{delta} kg between photos": "{delta} kg medzi fotkami",
  "Saved, but one or more photos couldn't upload. Check your connection and try again.":
    "Uložené, ale jednu alebo viac fotiek sa nepodarilo nahrať. Skontroluj pripojenie a skús to znova.",
  "Couldn't save your check-in — please try again.":
    "Check-in sa nepodarilo uložiť — skús to znova.",

  // ── Personal records ──────────────────────────────────────────────────────
  "Personal Records": "Osobné rekordy",
  "All Personal Records": "Všetky osobné rekordy",
  "No personal records yet.": "Zatiaľ žiadne osobné rekordy.",

  // ── Batch 3: analytics, social, food detail, rewards, paywall, workout ──
  "Advanced Analytics": "Pokročilá analytika",
  "This is a Pro feature": "Toto je Pro funkcia",
  "See Pro": "Zobraziť Pro",
  "Volume — last 12 weeks": "Objem — posledných 12 týždňov",
  "No logged training in this window yet.":
    "V tomto období zatiaľ žiadny tréning.",
  "Est. 1RM trend": "Trend odh. 1RM",
  "Log a few sessions to see strength trends here.":
    "Zapíš pár tréningov a uvidíš tu trendy sily.",
  "Need at least two sessions of this exercise to chart a trend.":
    "Na graf trendu treba aspoň dva tréningy s týmto cvikom.",
  "Muscle balance — this week vs last":
    "Svalová rovnováha — tento týždeň oproti minulému",
  "No sets logged in the last two weeks.":
    "Za posledné dva týždne žiadne série.",
  "Full Body": "Celé telo",
  "Full body": "Celé telo",
  "YOUR FRIEND CODE": "TVOJ KÓD PRIATEĽA",
  "Share this so friends can add you.":
    "Zdieľaj ho, nech ťa priatelia môžu pridať.",
  "DISPLAY NAME": "ZOBRAZOVANÉ MENO",
  "Add a friend by their code to see how you stack up.":
    "Pridaj priateľa cez jeho kód a porovnaj sa s ním.",
  "Recent activity": "Nedávna aktivita",
  "Workouts and level-ups from you and your friends show up here.":
    "Tréningy a postupy tvoje aj tvojich priateľov sa zobrazia tu.",
  "How friends see you": "Ako ťa vidia priatelia",
  "Enter friend code": "Zadaj kód priateľa",
  "Serving size": "Veľkosť porcie",
  "Calculated macros": "Prepočítané makrá",
  "Edit food": "Upraviť potravinu",
  "In your foods": "V tvojich potravinách",
  "Go back": "Späť",
  "Decrease serving": "Zmenšiť porciu",
  "Increase serving": "Zväčšiť porciu",
  "Morning Snack": "Desiata",
  "Pre Workout": "Pred tréningom",
  "Post Workout": "Po tréningu",
  "Failed to save food": "Potravinu sa nepodarilo uložiť",
  "Failed to delete food": "Potravinu sa nepodarilo zmazať",
  "Failed to add food": "Potravinu sa nepodarilo pridať",
  "Remove from favorites": "Odobrať z obľúbených",
  "Add to favorites": "Pridať do obľúbených",
  "Save changes": "Uložiť zmeny",
  "Save to my foods": "Uložiť do mojich potravín",
  "Day streak": "Séria dní",
  "Longest streak": "Najdlhšia séria",
  "This week": "Tento týždeň",
  "Weekly goal complete — nice work!": "Týždenný cieľ splnený — dobrá práca!",
  "Advanced analytics": "Pokročilá analytika",
  "Friends & leaderboard": "Priatelia a rebríček",
  "Compare streaks and XP": "Porovnaj série a XP",
  "Covers a missed day. You bank one per 7-day streak, up to 3.":
    "Pokryje vynechaný deň. Získaš jeden za každú 7-dňovú sériu, max 3.",
  "Covers a missed day. Pro banks up to 3 instead of 1.":
    "Pokryje vynechaný deň. S Pro si odložíš až 3 namiesto 1.",
  "Strength trends & muscle balance": "Trendy sily a svalová rovnováha",
  "Pro — strength trends & muscle balance":
    "Pro — trendy sily a svalová rovnováha",
  "You're on Pro — thanks for supporting BulkOS.":
    "Máš Pro — ďakujeme za podporu BulkOS.",
  "Tracking your lifts and food stays free, always. Pro adds the extras.":
    "Zapisovanie tréningov a jedla zostane vždy zadarmo. Pro pridáva navyše.",
  "Restore purchase": "Obnoviť nákup",
  "Bank up to three instead of one, so a bad week doesn't wipe your streak.":
    "Odlož si až tri namiesto jednej, nech ti zlý týždeň nezmaže sériu.",
  "Full history & analytics": "Celá história a analytika",
  "Every session you've ever logged, with the deeper progress charts.":
    "Každý tréning, čo si kedy zapísal, aj s podrobnejšími grafmi.",
  "Smarter generated sessions": "Múdrejšie generované tréningy",
  "Fatigue-aware programming that adapts to how your last weeks actually went.":
    "Programovanie zohľadňujúce únavu, prispôsobené tomu, ako ti reálne šli posledné týždne.",
  "Couldn't complete the purchase. Please try again.":
    "Nákup sa nepodarilo dokončiť. Skús to znova.",
  "Purchases aren't set up yet — coming soon.":
    "Nákupy zatiaľ nie sú spustené — už čoskoro.",
  "Purchase restored.": "Nákup obnovený.",
  "Nothing to restore.": "Niet čo obnoviť.",
  "1RM Calculator": "Kalkulačka 1RM",
  "Estimated 1RM": "Odhadované 1RM",
  "Enter a weight and rep count to estimate your 1RM.":
    "Zadaj váhu a počet opakovaní na odhad 1RM.",
  "Estimates are most accurate at 10 reps or fewer.":
    "Odhad je najpresnejší pri 10 a menej opakovaniach.",
  "Exercise progress": "Progres cviku",
  "No history for this exercise yet.":
    "Pre tento cvik zatiaľ žiadna história.",
  "Max weight": "Maximálna váha",
  "Progress over time": "Progres v čase",
  "Add Exercise": "Pridať cvik",
  "Search exercise...": "Hľadať cvik...",
  "No exercises yet.": "Zatiaľ žiadne cviky.",
  "No template selected.": "Nie je vybraná šablóna.",
  "Save Template": "Uložiť šablónu",
  "Untitled Template": "Šablóna bez názvu",
  "Workout Template": "Šablóna tréningu",
  "Workout History": "História tréningov",
  "Your completed workouts": "Tvoje dokončené tréningy",
  "No workouts yet": "Zatiaľ žiadne tréningy",
  "Start a workout": "Začať tréning",
  "Nothing was deleted — Pro unlocks your full history.":
    "Nič sa nezmazalo — Pro odomkne celú históriu.",
  "Profile & Goals": "Profil a ciele",
  "Activity level": "Úroveň aktivity",
  "Goal weight (kg)": "Cieľová váha (kg)",
  "Training days / week": "Tréningových dní / týždeň",
  "Could not save changes. Try again.":
    "Zmeny sa nepodarilo uložiť. Skús to znova.",
  "Saved — macro targets updated.": "Uložené — ciele makier aktualizované.",
  "Muscle Load": "Svalová záťaž",
  "No muscle load data yet": "Zatiaľ žiadne dáta o svalovej záťaži",
  "Training volume from the last 7 days":
    "Objem tréningu za posledných 7 dní",
  "Complete a weighted workout to populate this section.":
    "Dokonči tréning so záťažou a naplní sa táto sekcia.",
  "Weekly Volume": "Týždenný objem",
  "Estimated weighted volume this week":
    "Odhadovaný objem so záťažou tento týždeň",
  "No training data yet": "Zatiaľ žiadne tréningové dáta",
  "Complete a workout to start the chart.":
    "Dokonči tréning a graf sa rozbehne.",
  // ── Onboarding ──
  "Let's build your operating system.":
    "Poďme postaviť tvoj operačný systém.",
  "Plan ready": "Plán je hotový",
  "Your starting targets are ready.": "Tvoje počiatočné ciele sú pripravené.",
  "Training days per week": "Tréningových dní týždenne",
  "Daily targets": "Denné ciele",
  "Start here. Adjust after 7–14 days.": "Začni takto. Uprav po 7–14 dňoch.",
  "Saving your profile...": "Ukladá sa profil...",
  "What are we building?": "Čo staviame?",
  "Pick the phase. This decides your calorie direction.":
    "Vyber fázu. Určí smer tvojich kalórií.",
  "How old are you?": "Koľko máš rokov?",
  "Used for baseline calorie calculation.":
    "Použije sa na základný výpočet kalórií.",
  "How tall are you?": "Koľko meriaš?",
  "Height helps estimate your daily expenditure.":
    "Výška pomáha odhadnúť tvoj denný výdaj.",
  "Where are we starting?": "Odkiaľ štartujeme?",
  "This is your baseline for targets and progress tracking.":
    "Toto je základ pre ciele a sledovanie progresu.",
  "Where are we going?": "Kam smerujeme?",
  "Be realistic. Aggressive targets usually create worse adherence.":
    "Buď realistický. Prehnané ciele sa väčšinou horšie dodržiavajú.",
  "How active are you?": "Aký si aktívny?",
  "Include work, steps, sport and general movement.":
    "Zarátaj prácu, kroky, šport a bežný pohyb.",
  "How experienced are you?": "Aké máš skúsenosti?",
  "Lean bulk": "Čistá naberačka",
  "Cut": "Chudnutie",
  "Maintain": "Udržiavanie",
  "Gain muscle with controlled fat gain.":
    "Naberaj svaly s kontrolovaným prírastkom tuku.",
  "Drop fat while preserving performance.": "Zhoď tuk a udrž si výkon.",
  "Stay around the same weight and improve habits.":
    "Drž si váhu a zlepšuj návyky.",
  "Current weight": "Aktuálna váha",
  "Target weight": "Cieľová váha",
  "Low": "Nízka",
  "Moderate": "Stredná",
  "High": "Vysoká",
  "Desk job, low steps, mostly gym only.":
    "Sedavá práca, málo krokov, hýbeš sa hlavne v posilňovni.",
  "Regular movement, 7–10k steps, training.":
    "Pravidelný pohyb, 7–10 tis. krokov, tréning.",
  "Very active lifestyle, sport, high output.":
    "Veľmi aktívny život, šport, vysoký výdaj.",
  "Just tell me what to train and how hard — no charts yet.":
    "Len mi povedz, čo mám cvičiť a ako ťažko — grafy zatiaľ netreba.",
  "Show my progress and volume, hide the deep analytics.":
    "Ukáž progres a objem, hlbokú analytiku skry.",
  "Everything — effort strain, muscle balance, 1RM, the lot.":
    "Všetko — záťaž, svalová rovnováha, 1RM, celé.",
  "I'll pick which sections to show myself.": "Sekcie si vyberiem sám.",
  "Start using BulkOS": "Začať používať BulkOS",
  "Male": "Muž",
  "Female": "Žena",

  // ── Workout ──
  "Select Workout": "Vyber tréning",
  "Choose a template to start your session.":
    "Vyber šablónu a začni tréning.",
  "AI workout": "AI tréning",
  "My templates": "Moje šablóny",
  "Workout Complete": "Tréning dokončený",
  "How was your workout?": "Aký bol tréning?",
  "This helps tune your next session": "Pomôže to naladiť ďalší tréning",
  "Compared to last time": "V porovnaní s minule",
  "Start Again": "Začať znova",
  "Apply All": "Použiť všetko",
  "Start Workout": "Začať tréning",
  "No templates yet": "Zatiaľ žiadne šablóny",
  "Best set": "Najlepšia séria",
  "Est. 1RM": "Odh. 1RM",
  "Swap exercise": "Vymeniť cvik",
  "Exercise note": "Poznámka k cviku",
  "Remove exercise": "Odstrániť cvik",
  "Note for this exercise (e.g. grip, form cue, how it felt)…":
    "Poznámka k cviku (úchop, technika, ako to šlo)…",
  "Skip rest": "Preskočiť pauzu",
  "Perfect Workout": "Perfektný tréning",
  "Great Session": "Skvelý tréning",
  "Solid Work": "Solídna práca",
  "Keep Going": "Len tak ďalej",
  "Failed to save workout": "Tréning sa nepodarilo uložiť",
  "Too easy": "Príliš ľahké",
  "Just right": "Akurát",
  "Active Workout": "Prebiehajúci tréning",
  "Saving Workout...": "Ukladá sa tréning...",
  "Finish Workout": "Ukončiť tréning",

  // ── Exercise detail, food, progress, dashboard ──
  "Goal": "Cieľ",
  "Age": "Vek",
  "Height": "Výška",
  "Activity": "Aktivita",
  "Experience": "Skúsenosti",
  "Exercise Detail": "Detail cviku",
  "Secondary muscles": "Vedľajšie svaly",
  "No activation data yet.": "Zatiaľ žiadne dáta o zapojení.",
  "No tips added yet.": "Zatiaľ žiadne tipy.",
  "No mistakes added yet.": "Zatiaľ žiadne chyby.",
  "Last best": "Posledné najlepšie",
  "No recommendation yet.": "Zatiaľ žiadne odporúčanie.",
  "Not enough data for a chart yet.": "Zatiaľ málo dát na graf.",
  "No history yet.": "Zatiaľ žiadna história.",
  "Muscle Activation": "Zapojenie svalov",
  "Common Mistakes": "Časté chyby",
  "Your Stats": "Tvoje štatistiky",
  "Best Set": "Najlepšia séria",
  "Last Set": "Posledná séria",
  "Total Volume": "Celkový objem",
  "Next Suggested Target": "Odporúčaný ďalší cieľ",
  "Recent Performance": "Posledné výkony",
  "Increase weight": "Zvýš váhu",
  "Increase reps first": "Najprv pridaj opakovania",
  "Instructions": "Postup",
  "Tips": "Tipy",
  "Food Database": "Databáza potravín",
  "Search your foods and Open Food Facts":
    "Hľadaj vo svojich potravinách a v Open Food Facts",
  "Per 100 g": "Na 100 g",
  "Save & log": "Uložiť a zapísať",
  "No foods found": "Žiadne potraviny",
  "Try a different search.": "Skús iné hľadanie.",
  "Search food...": "Hľadať potravinu...",
  "Scan barcode": "Naskenovať čiarový kód",
  "Enter barcode number…": "Zadaj číslo čiarového kódu…",
  "Product name": "Názov produktu",
  "Failed to load recent foods": "Nepodarilo sa načítať posledné potraviny",
  "Point the camera at a barcode": "Namier kameru na čiarový kód",
  "No previous data": "Žiadne skoršie dáta",
  "Est. Body Fat": "Odh. telesný tuk",
  "Based on latest check-in": "Podľa posledného check-inu",
  "Upload progress photos": "Nahraj fotky progresu",
  "Compare your transformation week by week":
    "Porovnávaj svoju premenu týždeň po týždni",
  "This Week": "Tento týždeň",
  "Training time": "Čas tréningu",
  "Average session": "Priemerný tréning",
  "New Check-in": "Nový check-in",
  "Daily Goal Progress": "Postup k dennému cieľu",
  "Best workout": "Najlepší tréning",
  "Reset Water": "Vynulovať vodu",
  "Start Today's Workout": "Začať dnešný tréning",
  "Remaining Today": "Zostáva dnes",
  "Workouts this week": "Tréningy tento týždeň",
  "Total workouts": "Tréningy spolu",
  "Total volume": "Objem spolu",
  "Protein target completed.": "Cieľ bielkovín splnený.",
  "Almost there.": "Už to skoro máš.",
  "Great progress.": "Skvelý progres.",
  "Let's get more protein today.": "Dnes pridaj bielkoviny.",
  "No workout yet": "Zatiaľ žiadny tréning",
  "Complete a workout to unlock stats":
    "Dokonči tréning a odomkneš štatistiky",
  "Log food": "Zapísať jedlo",
  "Weekly Avg Calories": "Priemerné kalórie za týždeň",
  "Average of the last 7 days with logged food vs your targets.":
    "Priemer za posledných 7 dní so zapísaným jedlom oproti tvojim cieľom.",
  "Coach Insight": "Postreh trénera",
  "Based on the last 14 days of check-ins":
    "Podľa posledných 14 dní check-inov",
  "Applied — your calorie and carb targets were updated.":
    "Použité — ciele kalórií a sacharidov boli aktualizované.",
  "Shopping progress": "Postup nákupu",
  "From your recent meals": "Z tvojich posledných jedál",
  "Your list is empty": "Zoznam je prázdny",
  "Search real products above or tap a suggestion from your meals.":
    "Vyhľadaj produkt vyššie alebo ťukni na návrh z tvojich jedál.",
  "Macro Adherence": "Dodržiavanie makier",
  "Grocery List": "Nákupný zoznam",
  "Search products or add your own…": "Hľadaj produkty alebo pridaj vlastný…",
  "Resume workout": "Pokračovať v tréningu",
  "Meal Prep Tip": "Tip na prípravu",
  "Allergen Info": "Alergény",
};
