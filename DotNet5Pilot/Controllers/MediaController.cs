using DotNet5Pilot.Logic.Managers;
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
            string filePath = playlistManager.GetSongFilePath(id);
            if (filePath == null)
            {
                return NotFound();
            }
            
            return PhysicalFile(filePath, "application/octet-stream", enableRangeProcessing: true);
        }
    }
}
