#!/usr/bin/env python3
"""
将 logo-main.png 扩大到 800x800 像素
使用 LANCZOS 重采样算法保持清晰度
"""

from PIL import Image
from pathlib import Path

def resize_logo():
    logo_path = Path(__file__).parent / "logo-main.png"
    backup_path = Path(__file__).parent / "logo-main-500px-backup.png"

    # 优先从原始备份恢复，保证最佳质量
    source_path = backup_path if backup_path.exists() else logo_path

    if not source_path.exists():
        print(f"错误: 找不到 {source_path}")
        return False

    # 打开源图片
    with Image.open(source_path) as img:
        original_size = img.size
        print(f"源文件: {source_path.name}")
        print(f"源尺寸: {original_size[0]}x{original_size[1]}")

        # 使用 LANCZOS 算法进行高质量缩放
        new_size = (800, 800)
        resized_img = img.resize(new_size, Image.Resampling.LANCZOS)

        # 保存新图片，保持 PNG 格式和透明度
        resized_img.save(logo_path, "PNG", optimize=True)
        print(f"新尺寸: {new_size[0]}x{new_size[1]}")
        print(f"已保存到: {logo_path}")

    # 验证结果
    with Image.open(logo_path) as img:
        print(f"验证: 最终尺寸为 {img.size[0]}x{img.size[1]}")

    print("完成！")
    return True

if __name__ == "__main__":
    resize_logo()
