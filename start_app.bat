@echo off
echo ====================================
echo       世说蓝语 - 应用启动器
echo ====================================
echo.
echo 应用服务器地址: http://localhost:3000
echo.
echo 正在尝试打开浏览器...
echo.

rem 尝试多种方式打开URL
echo 方式1: 使用默认浏览器
start http://localhost:3000

echo 方式2: 使用PowerShell
powershell -Command "Start-Process http://localhost:3000"

echo 方式3: 使用rundll32
rundll32 url.dll,FileProtocolHandler http://localhost:3000

echo.
echo 如果浏览器没有自动打开，请手动复制以下地址到浏览器地址栏:
echo http://localhost:3000
echo.
echo 按任意键退出...
pause > nul