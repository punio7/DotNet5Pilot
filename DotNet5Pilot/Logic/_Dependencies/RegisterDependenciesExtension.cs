﻿using DotNet5Pilot.Logic.Factories;
using Microsoft.Extensions.DependencyInjection;

namespace DotNet5Pilot.Logic._Dependencies
{
    public static class RegisterDependenciesExtension
    {
        public static void RegisterDependencies(this IServiceCollection services)
        {
            services.AddSingleton(typeof(PlaylistManager));
            services.AddSingleton(typeof(SongInfoFactory));
        }
    }
}
