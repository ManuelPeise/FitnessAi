using Data.Accessor.Interfaces;
using Data.Database;
using Data.Database.Entities;
using Data.Database.Entities.User;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Data.Accessor
{
    public class ApplicationUnitOfWork: IApplicationUnitOfWork
    {
        private readonly AIDbContext _context;
        private readonly HttpContext _httpContext;
        private IRepositoryBase<UserEntity>? _userRepository;
        private IRepositoryBase<UserCredentialsEntity> _userCredentialsRepository;

        public IRepositoryBase<UserEntity> UserRepository => _userRepository ?? new RepositoryBase<UserEntity>(_context);
        public IRepositoryBase<UserCredentialsEntity> UserCredentialsRepository => _userCredentialsRepository ?? new RepositoryBase<UserCredentialsEntity>(_context);
        

        public ApplicationUnitOfWork(AIDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContext = httpContextAccessor.HttpContext;
            _userRepository = new RepositoryBase<UserEntity>(_context);
            _userCredentialsRepository = new RepositoryBase<UserCredentialsEntity>(_context);
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
