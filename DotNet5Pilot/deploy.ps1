dotnet publish -c Release
ssh pi@raspberrypi sudo systemctl stop pilot
scp -r bin/Release/net6.0/publish/* pi@raspberrypi:/home/pi/pilot
ssh pi@raspberrypi sudo systemctl start pilot