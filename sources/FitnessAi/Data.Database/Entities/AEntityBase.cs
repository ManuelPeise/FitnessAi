using System.ComponentModel.DataAnnotations;

namespace Data.Database.Entities
{
    public abstract class AEntityBase
    {
        [Key]
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = null!;
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
