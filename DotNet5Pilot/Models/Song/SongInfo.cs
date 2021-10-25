using DotNet5Pilot.Models.Song;
using Pilot.Models.Song;

namespace DotNet5Pilot.Models
{
    public class SongInfo : SongShortInfo
    {
        public byte[] Image { get; set; }
        public string ImageMimeType { get; set; }
        public uint? Track { get; internal set; }
        public uint? Year { get; internal set; }
        public string Genere { get; internal set; }
        public Lyric[] Lyrics { get; set; }
    }
}
