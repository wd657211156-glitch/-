# MISSME 女装精品商城

一个基于 FastAPI + 原生 JavaScript 的全栈女装电商平台，采用前后端分离架构，支持用户注册登录、商品浏览搜索、购物车管理以及多角色后台管理。

---

## 项目结构

```
Fashion_market/
├── backend/                     # 后端服务
│   ├── .env                     # 环境变量配置
│   ├── requirements.txt         # Python 依赖
│   └── app/
│       ├── __init.py
│       ├── main.py              # FastAPI 应用入口
│       ├── config.py            # 配置管理（数据库、JWT、CORS）
│       ├── database.py          # SQLAlchemy 数据库连接与会话
│       ├── init_data.py         # 初始化种子数据脚本
│       ├── models/              # 数据模型（ORM）
│       │   ├── __init__.py
│       │   ├── user.py          # 用户模型
│       │   ├── product.py       # 商品模型
│       │   ├── category.py      # 分类模型
│       │   └── cart.py          # 购物车模型
│       ├── schemas/             # Pydantic 请求/响应模式
│       │   ├── __init__.py
│       │   ├── user.py          # 用户相关 Schema
│       │   ├── product.py       # 商品相关 Schema
│       │   ├── cart.py          # 购物车相关 Schema
│       │   └── admin.py         # 后台管理相关 Schema
│       ├── services/            # 业务逻辑层
│       │   ├── __init__.py
│       │   ├── auth.py          # 认证服务（密码哈希、JWT）
│       │   ├── product.py       # 商品服务
│       │   ├── cart.py          # 购物车服务
│       │   └── admin.py         # 后台管理服务
│       └── routers/             # API 路由
│           ├── __init__.py
│           ├── auth.py          # 认证接口（注册、登录）
│           ├── product.py       # 商品接口（列表、详情、分类）
│           ├── cart.py          # 购物车接口（增删改查）
│           └── admin.py         # 后台管理接口（用户管理、商品管理）
│
└── frontend/                    # 前端页面
    ├── index.html               # 首页（商品列表、搜索、分类筛选）
    ├── product.html             # 商品详情页
    ├── login.html               # 登录/注册页
    ├── cart.html                # 购物车页
    ├── css/
    │   ├── base.css             # 基础样式与 CSS 变量
    │   ├── navbar.css           # 导航栏样式
    │   ├── hero.css             # 首页 Hero 区域样式
    │   ├── product.css          # 商品卡片与详情样式
    │   ├── cart.css             # 购物车样式
    │   ├── auth.css             # 登录/注册页样式
    │   ├── admin.css            # 后台管理页样式
    │   └── footer.css           # 页脚样式
    └── js/
        ├── api.js               # API 封装（统一请求、错误处理）
        ├── state.js             # 全局状态管理（认证、购物车）
        ├── navbar.js            # 导航栏交互
        ├── product.js           # 商品列表与筛选逻辑
        ├── cart.js              # 购物车逻辑
        ├── auth.js              # 登录/注册逻辑与表单验证
        ├── admin.js             # 后台管理逻辑
        └── toast.js             # Toast 提示与工具函数
```

## 技术栈

| 层级     | 技术                                      |
| -------- | ----------------------------------------- |
| 后端框架 | FastAPI 0.115                             |
| ORM      | SQLAlchemy 2.0                            |
| 数据库   | MySQL（通过 PyMySQL 驱动）                |
| 认证     | JWT（PyJWT）+ bcrypt 密码哈希（passlib）  |
| 数据校验 | Pydantic 2.10                             |
| 前端     | 原生 HTML / CSS / JavaScript（无框架依赖） |
| 服务器   | Uvicorn 0.34                              |

## 功能特性

### 用户端

- **用户注册与登录**：支持用户名/邮箱注册，JWT Token 认证，表单前后端双重校验
- **商品浏览**：首页展示全部商品，支持按分类筛选和关键词搜索
- **商品详情**：查看商品完整信息（名称、品牌、价格、库存、描述等）
- **购物车管理**：添加商品、修改数量、删除商品，自动计算总价
- **收藏功能**：支持商品收藏（前端交互）
- **响应式 Toast 提示**：操作反馈统一管理

### 管理端

- **三级角色体系**：普通用户（user）、管理员（admin）、超级管理员（super_admin）
- **商品管理**（admin 及以上）：商品增删改查、上架/下架切换
- **管理员管理**（仅 super_admin）：创建/删除管理员、配置管理员数量上限
- **权限守卫**：前端路由拦截 + 后端接口鉴权双重保护

## 数据库模型

### users（用户表）

| 字段          | 类型         | 说明                            |
| ------------- | ------------ | ------------------------------- |
| id            | INT (PK)     | 主键，自增                      |
| username      | VARCHAR(50)  | 用户名，唯一                    |
| email         | VARCHAR(100) | 邮箱，唯一                      |
| password_hash | VARCHAR(255) | bcrypt 哈希密码                 |
| phone         | VARCHAR(20)  | 手机号（可选）                  |
| role          | VARCHAR(20)  | 角色：user / admin / super_admin |
| created_at    | DATETIME     | 创建时间                        |

### categories（分类表）

| 字段       | 类型        | 说明       |
| ---------- | ----------- | ---------- |
| id         | INT (PK)    | 主键，自增 |
| name       | VARCHAR(50) | 分类名称   |
| icon       | VARCHAR(20) | 分类图标   |
| sort_order | SMALLINT    | 排序权重   |

### products（商品表）

| 字段           | 类型          | 说明                        |
| -------------- | ------------- | --------------------------- |
| id             | INT (PK)      | 主键，自增                  |
| name           | VARCHAR(200)  | 商品名称                    |
| brand          | VARCHAR(50)   | 品牌                        |
| price          | FLOAT         | 售价                        |
| original_price | FLOAT         | 原价                        |
| category_id    | INT (FK)      | 关联分类                    |
| tag            | VARCHAR(20)   | 标签：new / hot / sale      |
| description    | VARCHAR(500)  | 商品描述                    |
| stock          | INT           | 库存数量，默认 100          |
| is_active      | BOOLEAN       | 上架状态，默认 True         |
| created_at     | DATETIME      | 创建时间                    |

### cart_items（购物车表）

| 字段       | 类型     | 说明                     |
| ---------- | -------- | ------------------------ |
| id         | INT (PK) | 主键，自增               |
| user_id    | INT (FK) | 关联用户                 |
| product_id | INT (FK) | 关联商品                 |
| quantity   | INT      | 数量，默认 1             |

## API 接口一览

### 认证 `/api/auth`

| 方法 | 路径              | 说明     | 认证 |
| ---- | ----------------- | -------- | ---- |
| POST | `/api/auth/register` | 用户注册 | 否   |
| POST | `/api/auth/login`    | 用户登录 | 否   |

### 商品 `/api/products`

| 方法 | 路径                      | 说明             | 认证 |
| ---- | ------------------------- | ---------------- | ---- |
| GET  | `/api/products/`          | 商品列表（支持筛选） | 否   |
| GET  | `/api/products/{id}`      | 商品详情           | 否   |
| GET  | `/api/products/categories/` | 分类列表         | 否   |

### 购物车 `/api/cart`

| 方法   | 路径                     | 说明         | 认证 |
| ------ | ------------------------ | ------------ | ---- |
| GET    | `/api/cart/`             | 查看购物车   | 是   |
| POST   | `/api/cart/add`          | 添加商品     | 是   |
| PUT    | `/api/cart/update`       | 更新数量     | 是   |
| DELETE | `/api/cart/remove/{id}`  | 删除商品     | 是   |

### 后台管理 `/api/admin`

**管理员管理（仅 super_admin）：**

| 方法   | 路径                     | 说明             |
| ------ | ------------------------ | ---------------- |
| GET    | `/api/admin/users`       | 管理员列表       |
| POST   | `/api/admin/users`       | 新增管理员       |
| PUT    | `/api/admin/users/{id}`  | 编辑管理员信息   |
| DELETE | `/api/admin/users/{id}`  | 删除管理员       |
| GET    | `/api/admin/config`      | 获取配置         |
| PUT    | `/api/admin/config`      | 更新管理员上限   |

**商品管理（admin + super_admin）：**

| 方法   | 路径                              | 说明           |
| ------ | --------------------------------- | -------------- |
| GET    | `/api/admin/products`             | 全部商品列表   |
| POST   | `/api/admin/products`             | 新增商品       |
| PUT    | `/api/admin/products/{id}`        | 编辑商品       |
| DELETE | `/api/admin/products/{id}`        | 删除商品       |
| PUT    | `/api/admin/products/{id}/status` | 切换上架/下架  |

### 健康检查

| 方法 | 路径           | 说明     |
| ---- | -------------- | -------- |
| GET  | `/api/health`  | 服务状态 |

## 快速开始

### 环境要求

- Python 3.12+
- MySQL 5.7+
- 现代浏览器（Chrome / Edge / Firefox）

### 1. 克隆项目并进入目录

```bash
cd Fashion_market
```

### 2. 配置数据库

确保 MySQL 服务已启动，创建数据库：

```sql
CREATE DATABASE missme_shop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

编辑 `backend/.env` 文件，修改数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=missme_shop
JWT_SECRET=你的JWT密钥
JWT_EXPIRE_MINUTES=1440
ADMIN_MAX_COUNT=10
```

### 3. 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

### 4. 初始化种子数据

```bash
python -m app.init_data
```

执行后将自动创建表结构并插入种子数据，包括：
- 1 个超级管理员账号
- 5 个商品分类（连衣裙、上装、下装、外套、配饰）
- 12 个示例商品

### 5. 启动后端服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端服务启动后访问：
- API 文档（Swagger）：http://localhost:8000/docs
- 健康检查：http://localhost:8000/api/health

### 6. 启动前端

使用任意静态文件服务器启动前端，例如：

```bash
# 使用 Python 内置服务器
cd frontend
python -m http.server 5500
```

或者使用 VS Code 的 Live Server 插件打开 `frontend/index.html`。

浏览器访问 http://localhost:5500 即可。

## 默认账号

| 角色         | 用户名      | 密码      | 说明                       |
| ------------ | ----------- | --------- | -------------------------- |
| 超级管理员   | superadmin  | admin123  | 拥有全部权限，可管理管理员 |
| 普通用户     | 自行注册    | —         | 浏览商品、使用购物车       |

## 架构设计说明

### 后端分层架构

项目采用经典的三层架构模式：

**Router 层** — 负责 HTTP 请求路由、参数解析、依赖注入，调用 Service 层处理业务逻辑，将结果序列化为 Pydantic Schema 返回。

**Service 层** — 封装核心业务逻辑，不直接处理 HTTP 请求/响应，使得业务逻辑可独立测试和复用。

**Model 层** — SQLAlchemy ORM 模型定义，与数据库表一一映射，通过 Session 进行数据库操作。

此外，Schema 层使用 Pydantic 进行请求校验和响应序列化，确保数据类型安全。

### 前端模块化设计

前端采用原生 JavaScript 实现，无框架依赖，按职责拆分为独立模块：

- `api.js` — 统一封装 fetch 请求，自动附加 JWT Token，统一错误处理
- `state.js` — 全局状态管理，维护用户认证状态、购物车数量，驱动导航栏 UI 更新
- 各功能模块（`product.js`、`cart.js`、`auth.js`、`admin.js`）独立管理各自的页面交互逻辑
- `toast.js` — 通用工具函数（消息提示、图标映射、标签转换等）

### 认证流程

1. 用户通过 `/api/auth/register` 或 `/api/auth/login` 获取 JWT Token
2. 前端将 Token 存储在 `localStorage` 中
3. 后续请求通过 `Authorization: Bearer <token>` 请求头携带 Token
4. 后端通过 `decode_token` 解析 Token，提取 `user_id` 和 `role`
5. 管理接口通过 `require_role` 依赖注入进行角色权限校验

## 注意事项

- 本项目为学习和演示用途，生产环境部署前请务必修改默认的 JWT 密钥和管理员密码
- `.env` 文件不应提交到版本控制，建议添加到 `.gitignore` 中
- CORS 配置当前允许所有来源（`*`），生产环境应限制为实际前端域名
- 前端 API 地址硬编码为 `http://localhost:8000`，部署时需根据实际地址修改 `frontend/js/api.js` 中的 `API_BASE`
- 数据库密码等敏感信息存储在 `.env` 文件中，请勿泄露
