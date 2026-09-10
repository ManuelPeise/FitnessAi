using Data.Accessor.Interfaces;
using Data.Database;
using Data.Database.Entities;
using Data.Database.Entities.HealthConnect;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Data.Accessor
{
    internal class HealthUnitOfWork: IHealthUnitOfWork
    {
        private readonly AIDbContext _context;
        private readonly HttpContext _httpContext;

        private IRepositoryBase<HealthConnectRecordEntity> _healthConnectRecordRepository;
        private IRepositoryBase<HealthConnectValueEntity> _healthConnectValueRepository;
        private IRepositoryBase<HealthConnectSegmentEntity> _healthConnectSegmentRepository;

        public IRepositoryBase<HealthConnectRecordEntity> HealthConnectRecordRepository =>
            _healthConnectRecordRepository ??= new RepositoryBase<HealthConnectRecordEntity>(_context);
        public IRepositoryBase<HealthConnectValueEntity> HealthConnectValueRepository =>
            _healthConnectValueRepository ??= new RepositoryBase<HealthConnectValueEntity>(_context);
        public IRepositoryBase<HealthConnectSegmentEntity> HealthConnectSegmentRepository =>
            _healthConnectSegmentRepository ??= new RepositoryBase<HealthConnectSegmentEntity>(_context);

        public HealthUnitOfWork(AIDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContext = httpContextAccessor.HttpContext;
            _healthConnectRecordRepository = new RepositoryBase<HealthConnectRecordEntity>(context);
            _healthConnectValueRepository = new RepositoryBase<HealthConnectValueEntity>(context);
            _healthConnectSegmentRepository = new RepositoryBase<HealthConnectSegmentEntity>(context);
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
