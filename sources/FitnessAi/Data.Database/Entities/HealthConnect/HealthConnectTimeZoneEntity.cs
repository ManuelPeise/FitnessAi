using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectTimeZoneEntity : AEntityBase
    {
        public int Offset { get; set; }
    }
}
