using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DotNet5Pilot.Models.Configuration;
using DotNet5Pilot.Models.Song;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DotNet5Pilot.Logic.Managers
{
    public class LyricsManager
    {
        private readonly PilotConfiguration configuration;
        private readonly ILogger logger;
        private const string _nonBreakingSpace = "&nbsp;";

        public LyricsManager(IOptions<PilotConfiguration> configuration, ILogger<LyricsManager> logger)
        {
            this.configuration = configuration.Value;
            this.logger = logger;
        }

        public void LoadLyrics(SongInfo songInfo)
        {
            string lyricsPath = configuration.LyricsFolder;
            if (string.IsNullOrEmpty(lyricsPath) || !Directory.Exists(lyricsPath) || string.IsNullOrEmpty(configuration.LyricsExtensions))
            {
                return;
            }
            string artist = songInfo.Artist.Replace('/', '_');
            string title = songInfo.Title.Replace('/', '_');

            var lyricsPaths = configuration.LyricsExstensionsArray.Select(lyricsExtension => $"{lyricsPath}/{artist} - {title}.{lyricsExtension}");
            foreach (string lyricsFilePath in lyricsPaths)
            {
                if (File.Exists(lyricsFilePath))
                {
                    songInfo.Lyrics = ParseLyrics(lyricsFilePath);
                    return;
                }
            }
            logger.LogInformation($"Lyrics for {title} not found. Searched paths: {Environment.NewLine}{string.Join(Environment.NewLine, lyricsPaths)}");
        }

        private static Lyric[] ParseLyrics(string lyricsFilePath)
        {
            SortedDictionary<int, string> lyrics = new();
            var lines = File.ReadLines(lyricsFilePath);

            foreach (var line in lines)
            {
                ProcessLine(line, lyrics);
            }

            return LyricsArray(lyrics);
        }

        private static void ProcessLine(string line, SortedDictionary<int, string> lyrics)
        {
            List<int> timestamps = new();
            bool inTag = false;
            string lyric = null;

            for (int i = 0; i < line.Length; i++)
            {
                char currentChar = line[i];
                if (currentChar == '[')
                {
                    inTag = true;
                }
                else if (currentChar == ']')
                {
                    inTag = false;
                }
                else
                {
                    if (inTag)
                    {
                        if (char.IsDigit(currentChar))
                        {
                            timestamps.Add(ParseTimestamp(line.Substring(i, 8)));
                            i += 7;
                        }
                        else
                        {
                            //line contains metadata, skip it
                            return;
                        }
                    }
                    else //text found
                    {
                        lyric = line[i..];
                        break;
                    }
                }
            }
            if (string.IsNullOrWhiteSpace(lyric))
            {
                lyric = _nonBreakingSpace;
            }

            foreach (var timestamp in timestamps)
            {
                lyrics[timestamp] = lyric;
            }
        }

        /// <param name="timestampString">Timestamp in 00:34.45 format</param>
        /// <returns>Timestamp in miliseconds</returns>
        private static int ParseTimestamp(string timestampString)
        {
            int minutes = int.Parse(timestampString[..2]);
            int seconds = int.Parse(timestampString.Substring(3, 2));
            int milliseconds = int.Parse(timestampString.Substring(6, 2)) * 10;
            return minutes * 60 * 1000 + seconds * 1000 + milliseconds;
        }

        private static Lyric[] LyricsArray(SortedDictionary<int, string> lyrics)
        {
            return lyrics.Select(kv => new Lyric(kv.Key, kv.Value)).ToArray();
        }
    }
}
