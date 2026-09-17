using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities;

namespace AiUnitTests.Fakes
{
    internal class FakeRepository<TModel> : IRepositoryBase<TModel> where TModel : AEntityBase
    {
        public List<TModel> Items { get; }
        public List<TModel> UpdatedItems { get; } = [];
        public List<TModel> AddedItems { get; } = [];
        public List<TModel> DeletedItems { get; } = [];

        public FakeRepository(List<TModel>? items = null)
        {
            Items = items ?? [];
        }

        public Task<IReadOnlyList<TModel>> GetAsync(DbQueryOptions<TModel>? options = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<TModel> query = Items;

            if (options?.WhereExpression != null)
            {
                query = query.Where(options.WhereExpression.Compile());
            }

            if (options?.Skip != null)
            {
                query = query.Skip(options.Skip.Value);
            }

            if (options?.Take != null)
            {
                query = query.Take(options.Take.Value);
            }

            return Task.FromResult<IReadOnlyList<TModel>>(query.ToList());
        }

        public Task<int> CountAsync(System.Linq.Expressions.Expression<Func<TModel, bool>>? whereExpression = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<TModel> query = Items;

            if (whereExpression != null)
            {
                query = query.Where(whereExpression.Compile());
            }

            return Task.FromResult(query.Count());
        }

        public Task<TModel?> GetByIdAsync(long id, bool asNoTracking = false, List<System.Linq.Expressions.Expression<Func<TModel, object>>>? includeExpressions = null, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.FirstOrDefault(item => item.Id == id));
        }

        public Task<TModel?> GetSingleAsync(DbQueryOptions<TModel> options, bool asNoTracking = false, CancellationToken cancellationToken = default)
        {
            var query = Items.AsEnumerable();

            if (options.WhereExpression != null)
            {
                query = query.Where(options.WhereExpression.Compile());
            }

            return Task.FromResult(query.FirstOrDefault());
        }

        public Task<TModel> AddAsync(TModel entity, CancellationToken cancellationToken = default)
        {
            Items.Add(entity);
            AddedItems.Add(entity);
            return Task.FromResult(entity);
        }
        public Task AddRangeAsync(List<TModel> entities, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<TModel> AddOrUpdateAsync(TModel entity, CancellationToken cancellationToken = default) => throw new NotImplementedException();

        public Task UpdateAsync(TModel entity, CancellationToken cancellationToken = default)
        {
            UpdatedItems.Add(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(TModel entity, CancellationToken cancellationToken = default)
        {
            Items.Remove(entity);
            DeletedItems.Add(entity);
            return Task.CompletedTask;
        }

        public Task DeleteRange(IEnumerable<TModel>? entities, CancellationToken cancellationToken = default)
        {
            foreach (var entity in entities ?? [])
            {
                Items.Remove(entity);
                DeletedItems.Add(entity);
            }

            return Task.CompletedTask;
        }
    }
}
