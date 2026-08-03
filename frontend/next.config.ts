import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * `@kaopiz/timesheet` là package cùng repo, liên kết bằng symlink sang
   * `../shared`. Không nâng gốc trace lên thư mục cha thì bản standalone sẽ
   * thiếu file của package đó và server chết lúc khởi động.
   */
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
