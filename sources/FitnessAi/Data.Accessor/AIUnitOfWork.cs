using Data.Accessor.Interfaces;
using Data.Database;
using Data.Database.Entities;
using Data.Database.Entities.Ai;
using Data.Database.Entities.User;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Data.Accessor
{
    public class AIUnitOfWork : IAiUnitOfWork
    {
        private readonly AIDbContext _context;
        private readonly HttpContext _httpContext;
      
        private IRepositoryBase<HealthConnectAiTrainingDataEntity> _healthConnectAiTrainingDataRepository;
        private IRepositoryBase<HealthConnectAiTrainingLap> _healthConnectAiTrainingLapRepository;
        private IRepositoryBase<HealthConnectAiTrainingSegmentEntity> _healthConnectAiTrainingSegmentRepository;

        private IRepositoryBase<UserBodyDataEntity> _userBodyDataRepository;
        public IRepositoryBase<HealthConnectAiTrainingDataEntity> HealthConnectAiTrainingDataRepository
            => _healthConnectAiTrainingDataRepository ??= new RepositoryBase<HealthConnectAiTrainingDataEntity>(_context);
        
        public IRepositoryBase<HealthConnectAiTrainingLap> HealthConnectAiTrainingLapRepository
            => _healthConnectAiTrainingLapRepository ??= new RepositoryBase<HealthConnectAiTrainingLap>(_context);

        public IRepositoryBase<HealthConnectAiTrainingSegmentEntity> HealthConnectAiTrainingSegmentRepository
            => _healthConnectAiTrainingSegmentRepository ??= new RepositoryBase<HealthConnectAiTrainingSegmentEntity>(_context);

        public IRepositoryBase<UserBodyDataEntity> UserBodyDataRepository
            => _userBodyDataRepository ??= new RepositoryBase<UserBodyDataEntity>(_context);
        public AIUnitOfWork(AIDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContext = httpContextAccessor.HttpContext;
            _healthConnectAiTrainingDataRepository = new RepositoryBase<HealthConnectAiTrainingDataEntity>(context);
            _healthConnectAiTrainingLapRepository = new RepositoryBase<HealthConnectAiTrainingLap>(context);
            _healthConnectAiTrainingSegmentRepository = new RepositoryBase<HealthConnectAiTrainingSegmentEntity>(context);
            _userBodyDataRepository = new RepositoryBase<UserBodyDataEntity>(context);
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
