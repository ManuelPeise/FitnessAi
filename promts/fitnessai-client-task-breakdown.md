# FitnessAiClient – Task Breakdown

Abgeleitet aus dem Architektur-Konzept. Reihenfolge der Epics entspricht
weitgehend den Abhängigkeiten (Epic 0–3 sind Fundament, Epic 4–7 bauen
direkt darauf auf, Epic 8–10 können teilweise parallel laufen).

---

## Epic 0 – Projekt-Setup

- **T0.1** RN-Projekt `FitnessAiClient` initialisieren, Grundstruktur
  (Ordner für `services/`, `db/`, `screens/`, `i18n/`), Navigation-Skeleton
  ohne Inhalt
- **T0.2** SQLite-DB-Setup: Library wählen (`expo-sqlite` /
  `@op-engineering/op-sqlite` / `react-native-sqlite-storage`),
  Connection-Wrapper, `PRAGMA foreign_keys = ON` bei jeder Connection
- **T0.3** i18n-Grundgerüst: `i18n.ts`, `Resources/en/common.en.json`,
  `Resources/de/common.de.json` mit Platzhalter-Keys

**Abhängigkeiten:** keine (Startpunkt)

---

## Epic 1 – Datenbank-Schema

- **T1.1** `UserDataTable`-Tabelle + Init-Script (inkl. `createdAt`/
  `updatedAt`)
- **T1.2** `UserAuthenticationTable` (Felder `id`, `userId` UNIQUE, `jwt`,
  `refreshToken`, `expiresAt`) + FK `ON DELETE CASCADE`
- **T1.3** `SettingsTable` (`id`, `userId` UNIQUE, `lang` mit CHECK)
- **T1.4** `ScheduleTable` (`id`, `userId`, `type`, `intervalType` als
  INTEGER-Enum `0=Hourly/1=Daily/2=Weekly`, `day`, `hour`, `minute`,
  `isActive`, `lastRunAt`, `lastSuccessAt`) inkl. CHECK-Constraints auf
  Wertebereiche
- **T1.5** `DailyHealthDataTable` inkl. `UNIQUE (userId, recordId)`
- **T1.6** `ExerciseTable` inkl. `UNIQUE (userId, exerciseId)` –
  `exerciseId` als TEXT (Health-Connect-`metadata.id`, String/UUID)
- **T1.7** `ExerciseValuesTable` (`id`, `exerciseId` FK →
  `ExerciseTable.id` `ON DELETE CASCADE`, `valueType`, `value`, `unit`)
- **T1.8** `InitialLoadStateTable` (`id`, `userId`, `type`, `status`,
  `startedAt`, `completedAt`, `lastSuccessfulChunkEndDate`)
- **T1.9** Audit-Spalten (`createdAt`/`updatedAt`) auf allen Tabellen aus
  T1.1–T1.8 sicherstellen (Standard-Konvention, siehe Konzept)
- **T1.10** Indizes anlegen: `idx_authentication_userId`,
  `idx_schedule_userId`, `idx_health_userId_date`,
  `idx_exercise_userId_startTime`, `idx_exercise_values_exerciseId`

**Abhängigkeit:** T0.2

---

## Epic 2 – Authentifizierung

- **T2.1** AES-256-GCM-Helper: Key-Generierung, Keychain-Ablage
  (`react-native-keychain`), Encrypt/Decrypt-Funktionen für
  `jwt`/`refreshToken`
- **T2.2** Login-API-Call integrieren (Referenz-Logik aus Bestandscode
  übernehmen), Ergebnis verschlüsselt in `UserAuthenticationTable` schreiben
- **T2.3** Axios-Instanz + Request-Interceptor (liest & entschlüsselt `jwt`,
  hängt es an)
- **T2.4** Response-Interceptor: 401 → Refresh-Flow + Mutex/Queue gegen
  parallele Refresh-Calls
- **T2.5** Login-Flow Teil 1: `UserDataTable` nach erfolgreichem Login laden und
  speichern
- **T2.6** Logout-Funktion: `UserAuthenticationTable`-Eintrag löschen,
  Navigation zu `LoginPage`
- **T2.7** Key-Verlust-Handling: Decrypt-Fehler abfangen, wie abgelaufenes
  Refresh-Token behandeln

**Abhängigkeit:** T1.1, T1.2

---

## Epic 3 – HealthConnectService

- **T3.1** Verfügbarkeits-Check (Health Connect installiert?) +
  Play-Store-Weiterleitung bei Nichtverfügbarkeit
- **T3.2** Permission-Request für Datentypen (Steps, HeartRate,
  ExerciseSession, ...), angestoßen direkt nach Login (Login-Flow Teil 2)
- **T3.3** Background-Permission-Request
  (`READ_HEALTH_DATA_IN_BACKGROUND`), separat auslösbar
- **T3.4** `readRecords`-Wrapper: Parameter `recordType` + Zeitraum,
  vollständige Pagination via `pageToken`
- **T3.5** Permission-Revocation-Handling: try/catch um jeden Read,
  Fehlerstatus nach außen exponieren (für Scheduler-Tab-UI)

**Abhängigkeit:** T2.5 (Permission-Request läuft im Login-Flow)

---

## Epic 4 – Local Refresh (Health-Connect-Daten lokal cachen)

- **T4.1** Local-Refresh-Funktion `HealthDataExport`: liest
  `(heute-1, heute)` via `readRecords`, upserted in `DailyHealthDataTable`
  (Match `userId` + `recordId`)
- **T4.2** Local-Refresh-Funktion `ExerciseDataExport`: analog für
  `ExerciseSession` → `ExerciseTable` (Match `userId` + `exerciseId`)
- **T4.3** `ExerciseValuesTable` beim selben Local-Refresh-Lauf mitbefüllen
  (FK auf `ExerciseTable.id`) – ersetzt die ursprünglich geplante
  Zeit-Overlap-Query, da die Werte jetzt direkt der Session zugeordnet
  gespeichert werden

**Abhängigkeit:** T3.4, T1.5, T1.6, T1.7

---

## Epic 5 – API-Endpunkte (Client-Seite)

- **T5.1** `PostHealthData`-Service-Funktion: Payload aus
  `DailyHealthDataTable` für gegebenes Zeitfenster bauen und senden
- **T5.2** `PostTrainingData`-Service-Funktion: Payload aus `ExerciseTable`
  + verknüpften Metriken bauen und senden (Feldmodell als austauschbarer
  Platzhalter, da noch nicht final definiert)

**Abhängigkeit:** T4.1–T4.3, T2.3 (Axios-Instanz)

---

## Epic 6 – Scheduler

- **T6.1** Prototyp Option A: natives WorkManager (`CoroutineWorker` +
  `enqueueUniquePeriodicWork`)
- **T6.2** Prototyp Option B: Headless JS + `react-native-background-fetch`
  (oder vergleichbar)
- **T6.3** Evaluation beider Prototypen anhand der Kriterien
  (Zuverlässigkeit bei beendeter App über mehrere Tage, Heartbeat-Genauigkeit,
  Implementierungsaufwand, Wartbarkeit) → Entscheidung dokumentieren
- **T6.4** Heartbeat-Job final implementieren (gewählte Option), Intervall
  15–30 Min.
- **T6.5** Fälligkeits-Logik: Heartbeat prüft `ScheduleTable`
  (`intervalType`/`day`/`hour`/`minute` vs. `lastRunAt`)
- **T6.6** Send-Schritt: bei fälligem Schedule `PostHealthData`/
  `PostTrainingData` aufrufen, `lastRunAt`/`lastSuccessAt` aktualisieren
- **T6.7** Scheduler-Tab-UI: Schedule-Liste (Toggle, Konfiguration,
  Status/Fehleranzeige), Re-Request-Permission-Button

**Abhängigkeit:** T3.3 (Background-Permission), T4.1/T4.2 (Local Refresh),
T5.1/T5.2 (Send-Funktionen), T1.4 (ScheduleTable)

---

## Epic 7 – Initial Load

- **T7.1** Initial-Load-UI: Zeitraum-Auswahl, Start-Button (im
  Scheduler-Tab)
- **T7.2** Initial-Load-Ausführung: `readRecords` `(heute-365, heute)` +
  Pagination, pro `recordType`
- **T7.3** Gechunkter Versand (z. B. monatsweise) an `PostHealthData`/
  `PostTrainingData`
- **T7.4** Fortschritts-Tracking in `InitialLoadStateTable`
  (`status`, `lastSuccessfulChunkEndDate`)
- **T7.5** Resume-Logik: bei Fehlschlag ab `lastSuccessfulChunkEndDate`
  fortsetzen statt neu zu starten

**Abhängigkeit:** T3.4, T5.1, T5.2, T1.8

---

## Epic 8 – Navigation & Screens

- **T8.1** `LoginPage`-UI (Formular, Fehleranzeige bei Login-Fehlschlag)
- **T8.2** `TabNavigation`: `Dashboard`, `Scheduler`
- **T8.3** Dashboard-Tab-Inhalt (Umfang abhängig von Backend-Response nach
  Aggregation – ggf. erst als Platzhalter, später anbinden)
- **T8.4** Logout-Button im Dashboard-Tab

**Abhängigkeit:** T2.2–T2.6 (Auth-Flow), T6.7 (Scheduler-Tab)

---

## Epic 9 – Localization

- **T9.1** `useLocalization`-Hook: `getResource(key)`, `toggleLanguage(lang)`
- **T9.2** `toggleLanguage` persistiert in `SettingsTable.lang`; App-Start
  liest gespeicherte Sprache und initialisiert i18next entsprechend
- **T9.3** Alle UI-Texte (LoginPage, TabNavigation, Scheduler-Tab,
  Dashboard) auf `getResource(...)` umstellen

**Abhängigkeit:** T0.3, T1.3 (SettingsTable), T8.1–T8.4 (Screens vorhanden)

---

## Epic 10 – Tests & Absicherung

- **T10.1** FK-Constraints testen: `ON DELETE CASCADE` bei Löschung eines
  `UserDataTable`-Eintrags über alle Tabellen hinweg (inkl. kaskadierendem
  Löschen von `ExerciseValuesTable` über `ExerciseTable`)
- **T10.2** Multi-User-Szenario testen: User A und User B nacheinander auf
  demselben Gerät, `UNIQUE (userId, recordId)` bzw.
  `UNIQUE (userId, exerciseId)` verhindert Datenkollision
- **T10.3** Snapshot-Upsert-Szenario testen: nachträglich korrigierter
  Health-Connect-Record wird beim nächsten Local Refresh korrekt
  aktualisiert
- **T10.4** Encrypt/Decrypt-Roundtrip für `jwt`/`refreshToken` testen,
  inkl. Fehlerfall (Key fehlt)
- **T10.5** CHECK-Constraints testen: ungültige Werte (z. B. `intervalType`
  außerhalb `0-2`, `day` außerhalb `1-7`) werden von der DB abgelehnt

**Abhängigkeit:** läuft begleitend zu Epic 1, 2, 4

---

## Offene Entscheidungen, die während der Umsetzung fallen

- Epic 6: Option A vs. B (T6.3)
- Epic 5: `PostTrainingData`-Feldmodell (T5.2 bleibt austauschbar, bis
  Backend-Modell final steht)
