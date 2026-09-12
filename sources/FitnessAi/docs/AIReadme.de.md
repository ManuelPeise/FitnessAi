# Workout-Intensitäts-Vorhersage

> Englische Version: [`AIReadme.en.md`](./AIReadme.en.md)

## Was es macht

Für jedes importierte Training sagt das Backend voraus, wie intensiv es war — **Easy**, **Medium** oder
**Hard** (`WorkoutIntensityEnum`, `Shared.Enums/Ai/WorkoutIntensityEnum.cs`) — mithilfe eines echten
ML.NET-Multiclass-Klassifikators. Die Vorhersage wird an zwei Stellen gespeichert:

- `HealthConnectAiTrainingDataTable.WorkoutIntensity` (nicht nullable, Default `Unknown` bis zur Auswertung)
- `HealthConnectTrainingDataTable.WorkoutIntensity` (nullable, spiegelt denselben Wert auf den Rohimport-Datensatz zurück)

`WorkoutIntensityPredictedAt` (auf `HealthConnectAiTrainingDataTable`) ist ein separates `DateTime?`-Flag,
das nur markiert, ob eine Zeile bereits bewertet wurde. Es existiert, weil `WorkoutIntensity` allein nicht
unterscheiden kann zwischen "noch nicht verarbeitet" und "das Modell hat tatsächlich Unknown vorhergesagt"
— beides sähe sonst identisch aus.

## Warum nicht einfach eine feste Regel?

Eine einfache, feste Herzfrequenz-Schwelle wird tatsächlich verwendet — aber nur, um historische
**Trainings-Labels** zu erzeugen, nicht um neue Vorhersagen zu beantworten. Der trainierte Klassifikator
lernt ein allgemeineres Muster aus mehreren Eingabemerkmalen (Höhenmeter, Pace, Herzfrequenz, welcher
Nutzer, welche Sportart), sodass er über "war die Herzfrequenz hoch" hinaus verallgemeinern kann und mit
wachsender Datenmenge neu trainiert werden kann.

## Zweistufige Pipeline

Die Arbeit läuft in zwei verketteten, unabhängig auslösbaren Stufen ab — nicht in einem großen Schritt —
damit "Rohimporte in AI-Trainingsdaten umwandeln" und "AI-Trainingsdaten in Intensitäts-Vorhersagen
umwandeln" entkoppelt bleiben und jede Stufe für sich neu ausgeführt, überwacht oder wiederholt werden kann.

```
HealthConnect-Import (AllowedForAiTraining)
        │
        ▼
Stufe 1 — AiTrainingDataGeneration/GenerateAiTrainingData
  AiTrainingDataBuilder.BuildAiExerciseTrainingData()
  → erstellt/aktualisiert Zeilen in HealthConnectAiTrainingDataTable
    (WorkoutIntensity = Unknown, WorkoutIntensityPredictedAt = null)
  → bei Erfolg wird Stufe 2 als neuer ScheduledJobEntity-Eintrag eingereiht
        │
        ▼
Stufe 2 — WorkoutIntensityPrediction/PredictWorkoutIntensity
  WorkoutIntensityTrainingOrchestrator.RunAsync()
    1. WorkoutIntensityLabelGenerator.BackfillLabelsAsync()
    2. WorkoutIntensityModelTrainer.TrainAndActivateModelAsync()
    3. Vorhersage für jede Zeile mit WorkoutIntensityPredictedAt == null
       → schreibt WorkoutIntensity + WorkoutIntensityPredictedAt in beide Tabellen
```

Beide Stufen werden genauso eingereiht wie der Rest der bestehenden Hintergrundjob-Logik der App: Ein
Eintrag wird über `IScheduledJobService.AddJobAsync` in `ScheduledJobEntity` angelegt, und der vorhandene
generische Quartz-Job (`WebJob` / `ProcessScheduledTasks`) postet später (oder im `DEBUG`-Modus sofort) an
die gespeicherte URL. Stufe 2 hängt **ausschließlich** von `HealthConnectAiTrainingDataTable` ab — sie
greift nie direkt in die Rohimport-Pipeline ein.

### Manuelle Trigger / Entwicklungsmodus

Beide Stufen sind zusätzlich ganz normale API-Endpunkte, die während der Entwicklung direkt aufgerufen
werden können (z. B. über Swagger), ohne auf die Job-Kette zu warten:

- `POST AiTrainingDataGeneration/GenerateAiTrainingData` — nur Stufe 1
- `POST WorkoutIntensityPrediction/PredictWorkoutIntensity` — nur Stufe 2

## Stufe 2 im Detail

### 1. Label-Erzeugung (`WorkoutIntensityLabelGenerator`)

Die Ground-Truth-Labels fürs **Training** stammen aus einer Heuristik, nicht vom Modell selbst:

Für jede `(UserId, ExerciseType)`-Gruppe wird der Durchschnitt der historischen `HeartRate.Max`-Werte des
Nutzers für diese Sportart über alle `HealthConnectAiTrainingDataTable`-Zeilen gebildet:

| Durchschnittliche maximale Herzfrequenz | Label |
|---|---|
| < 141 bpm | `Easy` |
| 141–159 bpm (einschließlich) | `Medium` |
| > 159 bpm | `Hard` |
| weniger als 5 verwertbare Datenpunkte | `Unknown` (wird vom Training ausgeschlossen — keine verlässliche Ground Truth) |

Dieses Label wird **ausschließlich** zum Aufbau des Trainingsdatensatzes verwendet. Es wird zur
Vorhersagezeit nie erneut angewendet — der trainierte Klassifikator beantwortet neue Vorhersagen
eigenständig.

### 2. Training (`WorkoutIntensityModelTrainer` + `WorkoutIntensityMlModelBuilder`)

- Lädt jede `HealthConnectAiTrainingDataTable`-Zeile mit einem echten Label (`WorkoutIntensity != Unknown`).
- Benötigt insgesamt mindestens 20 gelabelte Zeilen; andernfalls wird das Training für diesen Durchlauf
  übersprungen (ein legitimer No-Op, solange sich noch Daten ansammeln — ein vorhandenes aktives Modell
  bleibt dabei unverändert bestehen).
- Wandelt jede Zeile in ein `WorkoutIntensityMlInput` um: `Elevation`, `Pace`, `AverageHeartRate` (Achtung:
  der *Durchschnitt*, nicht das für die Label-Erzeugung verwendete `Max`), `UserId`, `ExerciseType`, `Label`.
- Baut eine ML.NET-Pipeline: One-Hot-Encoding für `UserId`/`ExerciseType`, Zusammenführung aller Merkmale,
  Normalisierung und Training eines Multiclass-`SdcaMaximumEntropy`-Klassifikators.
- Serialisiert das trainierte Modell zu Bytes (`MLContext.Model.Save`) und aktiviert es über den
  bestehenden `AiModelLifecycleService` (`AiModelTypeEnum.WorkoutIntensity`), der das vorherige Modell
  genauso versioniert/deaktiviert wie der Rest des bestehenden AI-Modell-Lebenszyklus.

### 3. Das Modell ist global, nicht pro Nutzer

`UserId` ist eines der **Eingabemerkmale** des Modells, nicht die Grundlage für ein separates Modell pro
Nutzer. Es gibt zu jedem Zeitpunkt genau ein aktives `WorkoutIntensity`-Modell, trainiert über die Daten
aller Nutzer (`AiModelEntity.UserId = null` für diesen Modelltyp). So kann das Modell nutzerübergreifende
Muster lernen und trotzdem über das `UserId`-Merkmal auf die Eigenheiten eines bestimmten Nutzers eingehen.

### 4. Vorhersage (`WorkoutIntensityPredictor`)

- Lädt das aktuell aktive `WorkoutIntensity`-Modell (falls vorhanden) und dessen Binärdaten aus
  `AiModelBinaryTable`.
- Cached die `PredictionEngine` für die Lebensdauer des Requests/Jobs (der Aufbau ist teuer, die
  Wiederverwendung günstig; ein Job verarbeitet pro Durchlauf viele Zeilen, daher wäre ein Neuaufbau pro
  Zeile verschwenderisch).
- Baut dieselbe Merkmalsstruktur wie beim Training auf (ohne `Label`) und führt die Vorhersage aus.
- Fällt auf `Unknown` zurück, wenn noch kein aktives Modell existiert (Bootstrap-Zustand) oder die
  Ausgabe-Zeichenkette des Modells nicht in `WorkoutIntensityEnum` geparst werden kann.

## Dateien

| Bereich | Datei |
|---|---|
| Enum | `Shared.Enums/Ai/WorkoutIntensityEnum.cs` |
| Label-Heuristik | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityLabelGenerator.cs` |
| ML.NET-Pipeline | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityMlModelBuilder.cs` |
| Trainings-Orchestrierung | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityModelTrainer.cs` |
| Vorhersage | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityPredictor.cs` |
| Orchestrierung Stufe 2 | `Logic.Ai/Training/WorkoutIntensity/WorkoutIntensityTrainingOrchestrator.cs` |
| Verkettung Stufe 1 → Stufe 2 | `Logic.Ai/Training/AiTrainingDataBuilder.cs` |
| Endpunkte | `Core.Api/ApiControllers/Ai/AiTrainingDataGenerationController.cs`, `Core.Api/ApiControllers/Ai/WorkoutIntensityPredictionController.cs` |
