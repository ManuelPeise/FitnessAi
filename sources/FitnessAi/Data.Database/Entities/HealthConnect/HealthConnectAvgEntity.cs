using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectAvgEntity : AEntityBase
    {
        public decimal? Avg { get; set; }
        public decimal? Min { get; set; }  
        public decimal? Max { get; set; }
        
        public long HealthConnectValuesId { get; set; }
        [ForeignKey(nameof(HealthConnectValuesId))]
        public HealthConnectValuesEntity Values { get; set; } = null!;
        
        public long UnitId { get; set; }
        [ForeignKey(nameof(UnitId))]
        public HealthConnectUnitEntity Unit { get; set; } = null!;
    }
}
