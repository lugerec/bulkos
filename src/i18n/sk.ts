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
};
