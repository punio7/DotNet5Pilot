using System.Collections.Generic;
using System.IO;
using System.Linq;
using DotNet5Pilot.Logic.Factories;
using DotNet5Pilot.Logic.Utils;
using DotNet5Pilot.Models;

namespace DotNet5Pilot.Logic
{
    public class PlaylistManager
    {
        private readonly SongInfoFactory songInfoFactory;
        private readonly HashSet<string> acceptableExtensions = new() { ".mp3", ".flac" };
        private readonly Cache<int, SongInfo> songInfoCache = new();


        public List<SongShortInfo> Playlist { get; set; } = new();

        public PlaylistManager(SongInfoFactory songInfoFactory)
        {
            this.songInfoFactory = songInfoFactory;
            LoadDefaultFolder();
        }

        private void LoadDefaultFolder()
        {
            string defaultFolder = @"\\punio-desktop\muzyka\Besty";
            LoadFolder(defaultFolder);
        }

        public void LoadFolder(string folder)
        {
            List<SongShortInfo> newPlaylist = new();
            DirectoryInfo directoryInfo = new(folder);
            foreach (var file in directoryInfo.EnumerateFiles())
            {
                if (acceptableExtensions.Contains(file.Extension.ToLower()))
                {
                    var songInfo = songInfoFactory.CreateShortSongInfo(file.FullName);
                    newPlaylist.Add(songInfo);
                }
            }
            newPlaylist = SortPlaylistByTitle(newPlaylist);
            EnumerateIds(newPlaylist);
            Playlist = newPlaylist;
            songInfoCache.Clear();
        }

        private static List<SongShortInfo> SortPlaylistByTitle(List<SongShortInfo> playlist)
        {
            return playlist.OrderBy(si => si.Album).ThenBy(si => si.Title).ToList();
        }

        private static void EnumerateIds(List<SongShortInfo> newPlaylist)
        {
            int id = 0;
            newPlaylist.ForEach(si => si.Id = id++);
        }
        public bool IsSongIdValid(int id)
        {
            return id > 0 && id < Playlist.Count;
        }

        public SongInfo GetSongInfo(int songId)
        {
            if (songInfoCache.TryGet(songId, out SongInfo songInfo))
            {
                return songInfo;
            }
            SongInfo newSongInfo = songInfoFactory.CreateSongInfo(Playlist[songId].Path);
            return songInfoCache.AddOrGetExisting(songId, newSongInfo);
        }
    }
}
