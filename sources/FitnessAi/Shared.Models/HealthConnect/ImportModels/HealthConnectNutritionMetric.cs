using Newtonsoft.Json;
using Shared.Models.HealthConnect.RawDataModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.Models.HealthConnect.ImportModels
{
    public class HealthConnectNutritionMetric : AHealthConnectMetricBase
    {
        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;
        [JsonProperty("mealType")]
        public int MealType { get; set; }

        [JsonProperty("energy")]
        public HealthConnectEnergy Energy { get; set; } = new();

        [JsonProperty("energyFromFat")]
        public HealthConnectEnergy EnergyFromFat { get; set; } = new();
        [JsonProperty("totalCarbohydrate")]
        public HealthConnectNutrionWeight TotalCarbohydrate { get; set; } = new();
        [JsonProperty("totalFat")]
        public HealthConnectNutrionWeight TotalFat { get; set; } = new();
        [JsonProperty("saturatedFat")]
        public HealthConnectNutrionWeight SaturatedFat { get; set; } = new();
        [JsonProperty("transFat")]
        public HealthConnectNutrionWeight TransFat { get; set; } = new();
        [JsonProperty("protein")]
        public HealthConnectNutrionWeight Protein { get; set; } = new();
        [JsonProperty("dietaryFiber")]
        public HealthConnectNutrionWeight DietaryFiber { get; set; } = new();
        [JsonProperty("sodium")]
        public HealthConnectNutrionWeight Sodium { get; set; } = new();
        [JsonProperty("sugar")]
        public HealthConnectNutrionWeight Sugar { get; set; } = new();
        [JsonProperty("potassium")]
        public HealthConnectNutrionWeight Potassium { get; set; } = new();
        [JsonProperty("cholesterol")]
        public HealthConnectNutrionWeight Cholesterol { get; set; } = new();
        [JsonProperty("calcium")]
        public HealthConnectNutrionWeight Calcium { get; set; } = new();
        [JsonProperty("iron")]
        public HealthConnectNutrionWeight Iron { get; set; } = new();
        [JsonProperty("magnesium")]
        public HealthConnectNutrionWeight Magnesium { get; set; } = new();
        [JsonProperty("zinc")]
        public HealthConnectNutrionWeight Zinc { get; set; } = new();
        [JsonProperty("vitaminA")]
        public HealthConnectNutrionWeight VitaminA { get; set; } = new();
        [JsonProperty("vitaminC")]
        public HealthConnectNutrionWeight VitaminC { get; set; } = new();
    }
}
