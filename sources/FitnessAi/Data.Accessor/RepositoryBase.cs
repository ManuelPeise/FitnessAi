using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database;
using Data.Database.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;


namespace Data.Accessor
{
    public class RepositoryBase<TModel> : IRepositoryBase<TModel> where TModel : AEntityBase
    {
        private readonly DbSet<TModel> _dbSet;

        public RepositoryBase(AIDbContext context)
        {
            _dbSet = context.Set<TModel>();
        }

        public async Task<IReadOnlyList<TModel>> GetAsync(DbQueryOptions<TModel>? options = null, CancellationToken cancellationToken = default)
        {
            IQueryable<TModel> query = _dbSet;

            if (options?.AsNoTracking == true)
            {
                query = query.AsNoTracking();
            }

            if (options?.Includes is not null)
            {
                foreach (var includeExpression in options.Includes)
                {
                    query = query.Include(includeExpression);
                }
            }

            if (options?.WhereExpression is not null)
            {
                query = query.Where(options.WhereExpression);
            }

            if (options?.OrderByExpression is not null)
            {
                query = options.OrderByDescending
                    ? query.OrderByDescending(options.OrderByExpression)
                    : query.OrderBy(options.OrderByExpression);
            }

            return await query.ToListAsync(cancellationToken);
        }

        public async Task<TModel?> GetByIdAsync(long id, bool asNoTracking = false, List<Expression<Func<TModel, object>>>? includeExpressions = null, CancellationToken cancellationToken = default)
        {
            IQueryable<TModel> query = _dbSet;

            if (asNoTracking)
            {
                query = query.AsNoTracking();
            }

            if (includeExpressions != null)
            {
                foreach (var includeExpression in includeExpressions)
                {
                    query = query.Include(includeExpression);
                }
            }

            return await query.FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        }

        public async Task<TModel?> GetSingleAsync(DbQueryOptions<TModel> options, bool asNoTracking = false, CancellationToken cancellationToken = default)
        {
            IQueryable<TModel> query = _dbSet;

            if (options.WhereExpression == null)
            {
                throw new ArgumentNullException(nameof(options.WhereExpression), "WhereExpression must be provided for GetSingleAsync method.");
            }

            if (asNoTracking)
            {
                query = query.AsNoTracking();
            }

            if (options.Includes != null)
            {
                foreach (var includeExpression in options.Includes)
                {
                    query = query.Include(includeExpression);
                }
            }

            return await query.SingleOrDefaultAsync(options.WhereExpression, cancellationToken);
        }

        public async Task<TModel> AddAsync(TModel entity, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(entity);
            var entry = await _dbSet.AddAsync(entity, cancellationToken);
            return entry.Entity;
        }

        public async Task AddRangeAsync(List<TModel> entities, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(entities);

            await _dbSet.AddRangeAsync(entities, cancellationToken);
        }

        public async Task<TModel> AddOrUpdateAsync(TModel entity, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(entity);

            if (entity.Id <= 0)
            {
                var addedEntry = await _dbSet.AddAsync(entity, cancellationToken);
                return addedEntry.Entity;
            }

            var exists = await _dbSet.AnyAsync(current => current.Id == entity.Id, cancellationToken);

            if (!exists)
            {
                var addedEntry = await _dbSet.AddAsync(entity, cancellationToken);
                return addedEntry.Entity;
            }

            _dbSet.Update(entity);
            return entity;
        }

        public Task UpdateAsync(TModel entity, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(entity);
            _dbSet.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(TModel entity, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(entity);
            _dbSet.Remove(entity);
            return Task.CompletedTask;
        }

        public Task DeleteRange(IEnumerable<TModel>? entities, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(entities);
            _dbSet.RemoveRange(entities);
            return Task.CompletedTask;
        }
    }
}
