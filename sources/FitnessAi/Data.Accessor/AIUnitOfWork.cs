using Data.Accessor.Interfaces;
using Data.Database;
using Data.Database.Entities;
using Data.Database.Entities.Ai;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Data.Accessor
{
    public class AIUnitOfWork : IAiUnitOfWork
    {
        private readonly AIDbContext _context;
        private readonly HttpContext _httpContext;

        private IRepositoryBase<AiTrainingDataFileEntity> _aiTrainingDataFileRepository;
        private IRepositoryBase<AiTrainedModelEntity> _aiTrainedModelRepository;

        public IRepositoryBase<AiTrainingDataFileEntity> AiTrainingDataFileRepository
            => _aiTrainingDataFileRepository ??= new RepositoryBase<AiTrainingDataFileEntity>(_context);

        public IRepositoryBase<AiTrainedModelEntity> AiTrainedModelRepository
            => _aiTrainedModelRepository ??= new RepositoryBase<AiTrainedModelEntity>(_context);

        public AIUnitOfWork(AIDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContext = httpContextAccessor.HttpContext;
            _aiTrainingDataFileRepository = new RepositoryBase<AiTrainingDataFileEntity>(context);
            _aiTrainedModelRepository = new RepositoryBase<AiTrainedModelEntity>(context);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            if (_context == null) throw new ObjectDisposedException(nameof(ApplicationUnitOfWork));

            var now = DateTime.UtcNow;
            var userName = _httpContext?.User?.Identity?.Name ?? "System";
            var entries = _context.ChangeTracker.Entries<AEntityBase>();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = userName;

                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Property(nameof(AEntityBase.CreatedAt)).IsModified = false;
                    entry.Property(nameof(AEntityBase.CreatedBy)).IsModified = false;

                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = userName;
                }
            }

            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
