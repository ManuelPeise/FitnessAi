using System;
using System.Collections.Generic;
using System.Text;

namespace Logic.Shared
{
    public class EncryptionHelper
    {
        public static string HashPassword(string password)
        {
            ArgumentNullException.ThrowIfNull(password);

            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public static bool VerifyPassword(
            string password,
            string passwordHash)
        {
            ArgumentNullException.ThrowIfNull(password);
            ArgumentNullException.ThrowIfNull(passwordHash);

            return BCrypt.Net.BCrypt.Verify(
                password,
                passwordHash);
        }
    }
}
