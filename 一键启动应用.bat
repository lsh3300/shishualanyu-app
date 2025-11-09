@echo off
echo 正在启动世说蓝语应用...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 启动应用服务器
echo 启动应用服务器...
start "世说蓝语服务器" cmd /k "npm run dev"

REM 等待服务器启动
echo 等待服务器启动...
timeout /t 5 /nobreak >nul

REM 尝试打开应用
echo 正在打开应用...
start http://localhost:3000

echo.
echo 应用已启动！
echo 如果浏览器未自动打开，请手动访问: http://localhost:3000
echo.
echo 按任意键关闭此窗口...
pause >nul