dotnet publish -c Release
scp -r bin/Release/net5.0/publish/* pi@raspberrypi:/home/pi/pilot