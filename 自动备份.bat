@echo off
chcp 65001 >nul
echo ========================================
echo       世说蓝语项目自动备份脚本
echo ========================================
echo.

cd /d "C:\Users\lsh\Desktop\世说蓝语app"

echo 正在检查Git状态...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：无法访问Git仓库！
    pause
    exit /b 1
)

echo 正在检查是否有未提交的更改...
git status --porcelain
if %errorlevel% equ 0 (
    echo 发现未提交的更改，正在提交...
    git add .
    git commit -m "自动备份 - %date% %time%"
    if %errorlevel% neq 0 (
        echo 错误：提交失败！
        pause
        exit /b 1
    )
    echo 提交成功！
) else (
    echo 没有未提交的更改
)

echo.
echo 正在推送到远程仓库...
git push
if %errorlevel% neq 0 (
    echo 错误：推送失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo           备份完成！
echo ========================================
echo.
echo 备份时间：%date% %time%
echo.
pause