// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "6B4LGoNHcW553UjKgKkJ/rvdoNOPv8OSazQg3OCOlRU=",
);

// 关键修改：函数名改为 proxy
// proxy.ts

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_token")?.value;

  // 1. 定义排除列表：这些路径不需要检查 Token
  const isLoginPage = pathname === "/admin/login";
  const isAuthApi = pathname.startsWith("/api/admin"); // 假设你的登录接口在这里

  // 2. 如果是登录页，直接放行，不要检查 Token
  if (isLoginPage || isAuthApi) {
    // 额外优化：如果已经有有效 Token 还想访问登录页，可以反向重定向到后台主页
    if (token && isLoginPage) {
      try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch (e) {
        console.error("JWT 验证失败:", e);
        // Token 失效则正常显示登录页
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 3. 针对所有 /admin 开头的其他路径进行保护
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      // Token 伪造或过期
      console.error("JWT 验证失败:", error);
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

// config 保持不变
export const config = {
  matcher: ["/admin/:path*"],
};
