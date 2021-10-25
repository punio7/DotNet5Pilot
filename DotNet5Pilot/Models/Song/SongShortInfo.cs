namespace DotNet5Pilot.Models.Song
{
    public class SongShortInfo
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Artist { get; set; }
        public string Album { get; set; }
        public int Length { get; set; }
        public string Path { get; internal set; }
    }
}
