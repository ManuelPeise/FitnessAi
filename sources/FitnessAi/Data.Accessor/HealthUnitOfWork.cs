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

        private IRepositoryBase<HealthConnectUnitEntity> _healthConnectUnitRepository;
        private IRepositoryBase<HealthConnectAvgEntity> _healthConnectAvgRepository;
        private IRepositoryBase<HealthConnectBloodPressureEntity> _healthConnectBloodPressureRepository;
        private IRepositoryBase<HealthConnectValuesEntity> _healthConnectValuesRepository;
        private IRepositoryBase<HealthConnectHealthDataEntity> _healthConnectHealthDataRepository;
        private IRepositoryBase<HealthConnectTimeZoneEntity> _healthConnectTimeZoneRepository;
        private IRepositoryBase<HealthConnectTrainingDataEntity> _healthConnectTrainingDataRepository;
        private IRepositoryBase<HealthConnectTrainingDataValuesEntity> _healthConnectTrainingDataValuesRepository;

        public IRepositoryBase<HealthConnectUnitEntity> HealthConnectUnitRepository =>
            _healthConnectUnitRepository ??= new RepositoryBase<HealthConnectUnitEntity>(_context);
        public IRepositoryBase<HealthConnectAvgEntity> HealthConnectAvgRepository =>
            _healthConnectAvgRepository ??= new RepositoryBase<HealthConnectAvgEntity>(_context);
        public IRepositoryBase<HealthConnectBloodPressureEntity> HealthConnectBloodPressureRepository =>
            _healthConnectBloodPressureRepository ??= new RepositoryBase<HealthConnectBloodPressureEntity>(_context);
        public IRepositoryBase<HealthConnectValuesEntity> HealthConnectValuesRepository =>
            _healthConnectValuesRepository ??= new RepositoryBase<HealthConnectValuesEntity>(_context);
        public IRepositoryBase<HealthConnectHealthDataEntity> HealthConnectHealthDataRepository =>
            _healthConnectHealthDataRepository ??= new RepositoryBase<HealthConnectHealthDataEntity>(_context);
        public IRepositoryBase<HealthConnectTimeZoneEntity> HealthConnectTimeZoneRepository =>
            _healthConnectTimeZoneRepository ??= new RepositoryBase<HealthConnectTimeZoneEntity>(_context);
        public IRepositoryBase<HealthConnectTrainingDataEntity> HealthConnectTrainingDataRepository =>
            _healthConnectTrainingDataRepository ??= new RepositoryBase<HealthConnectTrainingDataEntity>(_context);
        public IRepositoryBase<HealthConnectTrainingDataValuesEntity> HealthConnectTrainingDataValuesRepository =>
            _healthConnectTrainingDataValuesRepository ??= new RepositoryBase<HealthConnectTrainingDataValuesEntity>(_context);

        public HealthUnitOfWork(AIDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContext = httpContextAccessor.HttpContext;
            _healthConnectUnitRepository = new RepositoryBase<HealthConnectUnitEntity>(context);
            _healthConnectAvgRepository = new RepositoryBase<HealthConnectAvgEntity>(context);
            _healthConnectBloodPressureRepository = new RepositoryBase<HealthConnectBloodPressureEntity>(context);
            _healthConnectValuesRepository = new RepositoryBase<HealthConnectValuesEntity>(context);
            _healthConnectHealthDataRepository = new RepositoryBase<HealthConnectHealthDataEntity>(context);
            _healthConnectTimeZoneRepository = new RepositoryBase<HealthConnectTimeZoneEntity>(context);
            _healthConnectTrainingDataRepository = new RepositoryBase<HealthConnectTrainingDataEntity>(context);
            _healthConnectTrainingDataValuesRepository = new RepositoryBase<HealthConnectTrainingDataValuesEntity>(context);
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
