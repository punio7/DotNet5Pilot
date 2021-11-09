using DotNet5Pilot.Logic.Factories;
using DotNet5Pilot.Logic.Managers;
using Microsoft.Extensions.DependencyInjection;

namespace DotNet5Pilot.Logic._Infrastructure
{
    public static class RegisterDependenciesExtension
    {
        public static void RegisterDependencies(this IServiceCollection services)
        {
            services.AddSingleton(typeof(PlaylistManager));
            services.AddSingleton(typeof(SongInfoFactory));
            services.AddSingleton(typeof(LyricsManager));
        }
    }
}
