using DotNet5Pilot.Models.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DotNet5Pilot.Logic._Infrastructure
{
    public static class AddConfigurationExtension
    {
        public static void AddConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<PilotConfiguration>(configuration.GetSection(PilotConfiguration.SectionName));
        }
    }
}
