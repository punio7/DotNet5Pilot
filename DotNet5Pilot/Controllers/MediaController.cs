using DotNet5Pilot.Logic;
using Microsoft.AspNetCore.Mvc;

namespace DotNet5Pilot.Controllers
{
    public class MediaController : Controller
    {
        private readonly PlaylistManager playlistManager;

        public MediaController(PlaylistManager playlistManager)
        {
            this.playlistManager = playlistManager;
        }

        [HttpGet]
        public ActionResult Stream(int id)
        {
            if (!playlistManager.IsSongIdValid(id))
            {
                return NotFound();
            }

            string filePath = playlistManager.Playlist[id].Path;
            
            return PhysicalFile(filePath, "application/octet-stream", enableRangeProcessing: true);
        }
    }
}
