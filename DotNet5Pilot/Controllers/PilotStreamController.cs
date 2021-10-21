using DotNet5Pilot.Logic;
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
            if (!playlistManager.IsSongIdValid(id))
            {
                return NotFound();
            }
            return Json(playlistManager.GetSongInfo(id));
        }
    }
}
