using System;
using System.Runtime.Serialization;

namespace DotNet5Pilot.Models
{
    public record ErrorInfo(string Event, string Source, int LineNo, int Colno, string Error);

}
