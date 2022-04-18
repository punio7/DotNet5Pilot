using DotNet5Pilot.Logic.Managers;
using DotNet5Pilot.Models.Song;
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

        public IActionResult ListAlbums()
        {
            return Json(playlistManager.Albums);
        }

        [HttpPost]
        public IActionResult LoadAlbum([FromRoute]int id)
        {
            if (playlistManager.LoadAlbum(id))
            {
                return Ok();
            }
            return BadRequest();
        }

        public IActionResult Info(int id)
        {
            SongInfo songInfo = playlistManager.GetSongInfo(id);
            return Json(songInfo);
        }

        public IActionResult Image(int id)
        {
            SongInfo songInfo = playlistManager.GetSongInfo(id);
            return File(songInfo.Image, songInfo.ImageMimeType);
        }
    }
}
