@echo off
chcp 65001 >nul
echo ========================================
echo       世说蓝语版本查看与恢复工具
echo ========================================
echo.

cd /d "C:\Users\lsh\Desktop\世说蓝语app"

:MENU
echo 请选择操作：
echo 1. 查看提交历史
echo 2. 查看版本标签
echo 3. 查看特定提交详情
echo 4. 恢复到特定版本
echo 5. 创建版本标签
echo 6. 退出
echo.
set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" goto SHOW_HISTORY
if "%choice%"=="2" goto SHOW_TAGS
if "%choice%"=="3" goto SHOW_COMMIT
if "%choice%"=="4" goto REVERT_VERSION
if "%choice%"=="5" goto CREATE_TAG
if "%choice%"=="6" goto END
echo 无效选项，请重新选择！
echo.
goto MENU

:SHOW_HISTORY
echo.
echo ========================================
echo            提交历史记录
echo ========================================
echo.
git log --oneline -10
echo.
pause
goto MENU

:SHOW_TAGS
echo.
echo ========================================
echo            版本标签列表
echo ========================================
echo.
git tag
echo.
pause
goto MENU

:SHOW_COMMIT
echo.
set /p commit_id=请输入要查看的提交ID: 
echo.
echo ========================================
echo          提交详情: %commit_id%
echo ========================================
echo.
git show --stat %commit_id%
echo.
pause
goto MENU

:REVERT_VERSION
echo.
echo 警告：恢复版本将创建一个新的提交来撤销指定提交之后的更改
echo.
set /p commit_id=请输入要恢复到的提交ID: 
echo.
set /p confirm=确认恢复到提交 %commit_id%? (y/n): 
if /i not "%confirm%"=="y" goto MENU

echo 正在恢复到提交 %commit_id%...
git revert %commit_id% --no-edit
if %errorlevel% neq 0 (
    echo 恢复失败！
    pause
    goto MENU
)

echo 恢复成功！正在推送到远程仓库...
git push
if %errorlevel% neq 0 (
    echo 推送失败！
    pause
    goto MENU
)

echo 版本恢复完成！
echo.
pause
goto MENU

:CREATE_TAG
echo.
set /p tag_name=请输入标签名称 (例如: v1.1.0): 
set /p tag_message=请输入标签描述: 
set /p commit_id=请输入要标记的提交ID (留空使用最新提交): 

if "%commit_id%"=="" (
    git tag -a %tag_name% -m "%tag_message%"
) else (
    git tag -a %tag_name% -m "%tag_message%" %commit_id%
)

if %errorlevel% neq 0 (
    echo 标签创建失败！
    pause
    goto MENU
)

echo 正在推送标签到远程仓库...
git push origin %tag_name%
if %errorlevel% neq 0 (
    echo 推送失败！
    pause
    goto MENU
)

echo 标签创建并推送成功！
echo.
pause
goto MENU

:END
echo.
echo 感谢使用世说蓝语版本管理工具！
echo.