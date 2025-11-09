@echo off
echo 正在测试Supabase连接...
echo.

echo 1. 测试基本连接...
curl -s http://localhost:3000/api/test-connection
echo.
echo.

echo 2. 测试数据库初始化...
curl -s -X POST http://localhost:3000/api/init-database
echo.
echo.

echo 如果看到错误消息，请按照DATABASE_SETUP.md中的说明在Supabase控制台中创建表
echo.
pause