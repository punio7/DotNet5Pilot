using System.Text.Json.Serialization;

namespace DotNet5Pilot.Models.Song
{
    public class SongInfo : SongShortInfo
    {
        [JsonIgnore]
        public byte[] Image { get; set; }
        public string ImageUrl { get; set; }
        public string ImageMimeType { get; set; }
        public uint? Year { get; internal set; }
        public string Genere { get; internal set; }
        public Lyric[] Lyrics { get; set; }
    }
}
