﻿using System.IO;

namespace DotNet5Pilot.Models
{
    public class LocalFileAbstraction : TagLib.File.IFileAbstraction
    {
        public LocalFileAbstraction(string path, bool openForWrite = false)
        {
            Name = Path.GetFileName(path);
            var fileStream = openForWrite ? File.Open(path, FileMode.Open, FileAccess.ReadWrite) : File.OpenRead(path);
            ReadStream = WriteStream = fileStream;
        }

        public string Name { get; private set; }

        public Stream ReadStream { get; private set; }

        public Stream WriteStream { get; private set; }

        public void CloseStream(Stream stream)
        {
            if (stream != null)
            {
                stream.Close();
            }
        }
    }
}
