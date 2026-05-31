@echo off
set SBT_OPTS=-Xms512M -Xmx1536M -Xss1M
set JAVA_OPTS=-Xms512M -Xmx1536M -Xss1M

if not exist "%USERPROFILE%\.sbt\bin\sbt-launch.jar" (
    echo Downloading sbt launcher...
    if not exist "%USERPROFILE%\.sbt\bin" mkdir "%USERPROFILE%\.sbt\bin"
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/org/scala-sbt/sbt-launch/1.9.9/sbt-launch-1.9.9.jar' -OutFile '%USERPROFILE%\.sbt\bin\sbt-launch.jar'"
)

if not exist "%USERPROFILE%\.sbt\bin\sbt-launch.jar" (
    echo Failed to download sbt launcher. Please install sbt manually.
    exit /b 1
)

java %JAVA_OPTS% -Dsbt.boot.directory=%USERPROFILE%\.sbt\boot -Dsbt.ivy.home=%USERPROFILE%\.sbt\.ivy2 -jar "%USERPROFILE%\.sbt\bin\sbt-launch.jar" %*
