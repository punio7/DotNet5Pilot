namespace DotNet5Pilot.Models.Configuration
{
    public class PilotConfiguration
    {
        public const string SectionName = "Pilot";

        public string DefaultFolder { get; set; }
        public string LyricsFolder { get; set; }
        public string LyricsExtensions { get; set; }
        public string[] LyricsExstensionsArray => LyricsExtensions.Split(';');
    }
}
