﻿using System.Linq;
using DotNet5Pilot.Models;
using DotNet5Pilot.Models.Song;
using TagLib;

namespace DotNet5Pilot.Logic.Factories
{
    public class SongInfoFactory
    {
        public SongInfo EmptySong { get; } = new()
        {
            Path = string.Empty,
            Track = null,
            Title = string.Empty,
            Artist = string.Empty,
            Album = string.Empty,
            Year = null,
            Genere = string.Empty,
            Image = System.IO.File.ReadAllBytes(@"wwwroot/images/noImage.png"),
            ImageMimeType = "image/png",
            ImageUrl = SongImageUrl(-1),
            Length = 0,
        };

        public SongInfo CreateSongInfo(string fileFullName, int songId)
        {
            SongInfo songInfo = new();
            using File tagFile = GetFileTag(fileFullName);
            FillShortInfo(fileFullName, songInfo, tagFile, songId);
            songInfo.Year = tagFile.Tag.Year != default ? tagFile.Tag.Year : null;
            songInfo.Genere = tagFile.Tag.JoinedGenres;
            var picture = SelectPictureFromArray(tagFile.Tag.Pictures);
            ProcessSongPicture(songInfo, picture);
            songInfo.ImageUrl = SongImageUrl(songId);

            return songInfo;
        }

        private static string SongImageUrl(int songId) => $"/PilotStream/Image/{songId}";

        static IPicture SelectPictureFromArray(IPicture[] pictureArray)
        {
            if (pictureArray == null)
            {
                return null;
            }
            var frontCoverPicture = pictureArray.FirstOrDefault((p) => p.Type == PictureType.FrontCover);
            if (frontCoverPicture != null)
            {
                return frontCoverPicture;
            }
            else
            {
                return pictureArray.FirstOrDefault();
            }
        }

        private void ProcessSongPicture(SongInfo songInfo, IPicture picture)
        {
            if (picture == null || picture.Data == null)
            {
                songInfo.Image = EmptySong.Image;
                songInfo.ImageMimeType = EmptySong.ImageMimeType;
            }
            else
            {
                songInfo.Image = picture.Data.Data;
                songInfo.ImageMimeType = picture.MimeType;
            }
        }

        public SongShortInfo CreateShortSongInfo(string fileFullName, int songId)
        {
            SongShortInfo shortInfo = new();
            using File tagFile = GetFileTag(fileFullName);
            FillShortInfo(fileFullName, shortInfo, tagFile, songId);

            return shortInfo;
        }

        private static File GetFileTag(string fileFullName)
        {
            return File.Create(new LocalFileAbstraction(fileFullName));
        }

        private static void FillShortInfo(string fileFullName, SongShortInfo shortInfo, File tagFile, int songId)
        {
            shortInfo.Path = fileFullName;
            shortInfo.Title = GetTitle(tagFile);
            shortInfo.Id = songId;
            if (tagFile.Tag != null)
            {
                shortInfo.Album = GetAlbum(tagFile);
                shortInfo.Track = tagFile.Tag.Track != default ? tagFile.Tag.Track : null;
                shortInfo.Artist = GetAlbumArtist(tagFile);
                shortInfo.Length = (int)tagFile.Properties.Duration.TotalSeconds;
            }
        }

        private static string GetAlbum(File tagFile)
        {
            return tagFile.Tag.Album ?? string.Empty;
        }

        private static string GetTitle(File tagFile)
        {
            if (tagFile != null && !string.IsNullOrEmpty(tagFile.Tag.Title))
            {
                return tagFile.Tag.Title;
            }
            return tagFile.Name;
        }

        private static string GetAlbumArtist(File tagFile)
        {
            if (!string.IsNullOrEmpty(tagFile.Tag.FirstPerformer))
            {
                return tagFile.Tag.FirstPerformer;
            }
            if (!string.IsNullOrEmpty(tagFile.Tag.FirstAlbumArtist))
            {
                return tagFile.Tag.FirstAlbumArtist;
            }
            else if (tagFile.Tag.AlbumArtists.Any())
            {
                return string.Join("", tagFile.Tag.AlbumArtists);
            }
            else
            {
#pragma warning disable CS0618 // Type or member is obsolete. AlbumArtists sometimes doesn't return Artists
                return string.Join(",", tagFile.Tag.Artists);
#pragma warning restore CS0618 // Type or member is obsolete
            }
        }
    }
}
