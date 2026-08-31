using Data.Database.Entities;
using System.Linq.Expressions;

namespace Data.Accessor.Models
{
    public sealed class DbQueryOptions<TModel> where TModel : AEntityBase
    {
        public bool AsNoTracking { get; set; }
        public bool OrderByDescending { get; set; }
        public Expression<Func<TModel, bool>>? WhereExpression { get; set; }
        public Expression<Func<TModel, object>>? OrderByExpression { get; set; }
        public List<Expression<Func<TModel, object>>> Includes { get; set; } = new();
    }
}
