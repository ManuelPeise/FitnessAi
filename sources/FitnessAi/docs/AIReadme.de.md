# Workout-Intensitäts-Trainingsdaten (CSV-Export/-Import)

> Englische Version: [`AIReadme.en.md`](./AIReadme.en.md)

## Was es macht

Es gibt aktuell **kein prozessinternes ML-Modell** für die Workout-Intensität. Stattdessen exportiert das
Backend ungelabelte Trainingsdaten als CSV, ein externer Prozess/Mensch trägt pro Zeile ein `Label`
(`Easy`/`Medium`/`Hard`, `WorkoutIntensityEnum`) ein, und die gelabelte CSV wird zurück hochgeladen und in
eine einzige gespeicherte Trainingsdatei (`AiTrainingDataFileTable`) gemergt. Dies ersetzt eine frühere,
vollständig entfernte prozessinterne ML.NET-Trainings-/Vorhersage-Pipeline (siehe [Historie](#historie)).

## Endpunkte (`Core.Api/ApiControllers/Ai/AiTrainingWorkOutIntensityCsvController.cs`)

| Methode | Route | Zweck |
|---|---|---|
| `GET` | `api/AiTrainingWorkOutIntensityCsv/LoadInitialWorkOutIntensityTrainingCsv?itemsCount=N` | Liefert eine CSV mit bis zu `N` noch nicht gelabelten Trainingszeilen, gemergt mit dem bereits Gespeicherten |
| `GET` | `api/AiTrainingWorkOutIntensityCsv/GetExistingWorkOutIntensityCsv` | Liefert die aktuell gespeicherte CSV unverändert; `404`, falls noch nichts erzeugt/hochgeladen wurde |
| `POST` | `api/AiTrainingWorkOutIntensityCsv/UpdateWorkOutIntensityTrainingCsvData` | Nimmt eine gelabelte CSV (Multipart-Datei-Upload) entgegen und mergt die gelabelten Zeilen in die gespeicherte Datei |

Alle drei werden von `IAiWorkOutIntensityTrainingFileService` / `AiWorkOutIntensityTrainingFileService`
(`Logic.Ai/Csv/Services/`) bedient.

## CSV-Format

9 Spalten, `;`-getrennt, UTF-8, Header-Zeile erforderlich, keine gequoteten Felder
(`Logic.Ai/Csv/AiTrainingColumnDefinitions.cs`):

```
DataKey;Elevation;Pace;AverageHeartRate;MinHeartRate;MaxHeartRate;Power;PredictedAt;Label
```

- `DataKey` — verknüpft eine Zeile mit einer `HealthConnectTrainingDataTable`-Zeile
- `Elevation`, `Pace` (`MM:SS` pro km), `AverageHeartRate`/`MinHeartRate`/`MaxHeartRate`, `Power` —
  Trainingsmerkmale, gebildet aus `HealthConnectTrainingDataValuesEntity`
  (`Logic.Ai/Csv/ModelMapper/WorkoutIntensityCsvRowMapper.cs`)
- `Label` — wird extern eingetragen; leer bis gelabelt
- `PredictedAt` — Zeitstempel, den das Backend (nicht der Labeler) genau in dem Moment setzt, in dem eine
  gelabelte Zeile beim Upload akzeptiert wird; dient nur intern als Markierung "diese Zeile wurde bereits
  gelabelt"

## Ablauf: Laden → Labeln → Hochladen

```
GET LoadInitialWorkOutIntensityTrainingCsv?itemsCount=N
        │
        ▼
  bereits gespeicherte CSV (falls vorhanden)  ──┐
                                                 ├─▶ Merge nach DataKey, gelabelte Zeile gewinnt immer ──▶ CSV wird zurückgegeben
  bis zu N Zeilen aus HealthConnectTrainingDataTable
  mit WorkoutIntensity == null
                                                 │
                                    (externes Labeling)
                                                 │
                                                 ▼
POST UpdateWorkOutIntensityTrainingCsvData (gelabelte CSV)
        │
        ▼
  Zeilen mit nicht-leerem Label, deren DataKey weiterhin
  in HealthConnectTrainingDataTable existiert, erhalten PredictedAt
        │
        ▼
  Merge in die bestehende gespeicherte CSV (aktualisierte Zeilen gewinnen immer) ──▶ AiTrainingDataFileTable.Csv aktualisiert
```

Beide Merge-Schritte sind nach `DataKey` geschlüsselt, sodass weder die gespeicherte Datei noch eine der
beiden `GET`-Antworten jemals doppelte `DataKey`s enthalten kann.

**Wichtig**: Dieser Ablauf liest `HealthConnectTrainingDataTable` ausschließlich (um frische Zeilen
aufzubauen und um beim Upload zu prüfen, ob der `DataKey` einer Zeile noch existiert) — er schreibt dort
nie hinein. Das Label lebt ausschließlich in der CSV/`AiTrainingDataFileTable`; aktuell kopiert nichts es
zurück auf `HealthConnectTrainingDataTable.WorkoutIntensity`. Falls ein zukünftiges Feature das Label
wieder auf der Rohtrainingszeile benötigt, muss dieses Schreiben an der fachlich passenden Stelle ergänzt
werden — es ist hier bewusst außerhalb des Umfangs (siehe Commit-Historie rund um die Entfernung von
`ApplyPrediction`).

## Generische CSV-Infrastruktur (`Logic.Ai/Csv/`)

Die WorkoutIntensity-Pipeline ist ein Nutzer einer kleinen generischen CSV-Lese-/Schreib-Schicht, die über
das bereits bestehende `AiModelTypeEnum` (wiederverwendet als CSV-"AiType"-Selektor — kein neues Enum)
geschlüsselt ist:

- `IColumnDefinitionFactory` / `ColumnDefinitionFactory` — bildet ein `AiModelTypeEnum` auf seine
  `ColumnDefinition` ab (`IReadOnlyDictionary<string,int>`, Spaltenname → Index); die einzige
  Quelle der Wahrheit für Header-Reihenfolge/-Validierung
- `CsvHeaderValidator` — strikte Header-Validierung (exakte Spaltenanzahl/-namen/-reihenfolge, keine
  automatische Korrektur)
- `ICsvModelLoader<TModel>` / `CsvModelLoader<TModel>` — Bytes → `HashSet<TModel>`
- `ICsvModelCreator<TModel>` / `CsvModelCreator<TModel>` — `IReadOnlyCollection<TModel>` → Bytes
- `ICsvRowMapper<TModel>` — der Erweiterungspunkt, den jedes konkrete Modell implementiert
  (`MapFromRow`/`MapToRow`); `WorkoutIntensityCsvRowMapper` ist aktuell die einzige Implementierung
- `IAiTrainingDataFileService` / `AiTrainingDataFileService` — generische Persistenz für
  `AiTrainingDataFileTable` (eine Zeile pro `AiModelTypeEnum`, mit den aktuellen `Csv`-Bytes plus einem
  `IsUpdated`-Flag)

Als offene Generics in `Logic.Ai/DI/AiServiceRegistration.cs` registriert — ein zukünftiger CSV-basierter
`AiType` benötigt nur eine eigene `ICsvRowMapper<TModel>`-Implementierung plus einen Eintrag in der
`ColumnDefinition`, keine Änderungen an Loader/Creator/Validator.

## Historie

Eine frühere Iteration trainierte und bediente einen echten ML.NET-Multiclass-Klassifikator prozessintern
(Label-Heuristik → Training → aktivierbares Modell → Vorhersage-Job) und speicherte abgeleitete Daten in
`HealthConnectAiTrainingDataTable` sowie Modell-Binärdaten in `AiModelTable`/`AiModelBinaryTable`. Diese
gesamte Pipeline (samt ihrer Tabellen) wurde entfernt — `HealthConnectTrainingDataTable` (die rohen
Importdaten) wird stattdessen direkt verwendet, und ein tatsächliches Modelltraining/Vorhersagen findet nun
außerhalb dieses Backends statt.
