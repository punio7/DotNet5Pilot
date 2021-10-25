﻿using DotNet5Pilot.Logic;
using Microsoft.AspNetCore.Mvc;

namespace DotNet5Pilot.Controllers
{
    public class PilotStreamController : Controller
    {
        private readonly PlaylistManager playlistManager;

        public PilotStreamController(PlaylistManager playlistManager)
        {
            this.playlistManager = playlistManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult List()
        {
            return Json(playlistManager.Playlist);
        }

        public IActionResult Info(int id)
        {
            var songInfo = playlistManager.GetSongInfo(id);
            if (songInfo == null)
            {
                return NotFound();
            }
            return Json(songInfo);
        }
    }
}