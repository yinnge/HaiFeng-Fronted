#!/usr/bin/env python3
"""
将 logo-main.png 从 500x500 扩大到 650x650 像素
使用 LANCZOS 重采样算法保持清晰度
"""

from PIL import Image
import shutil
from pathlib import Path

def resize_logo():
    logo_path = Path(__file__).parent / "logo-main.png"
    backup_path = Path(__file__).parent / "logo-main-500px-backup.png"

    # 检查文件是否存在
    if not logo_path.exists():
        print(f"错误: 找不到 {logo_path}")
        return False

    # 打开原始图片
    with Image.open(logo_path) as img:
        original_size = img.size
        print(f"原始尺寸: {original_size[0]}x{original_size[1]}")

        if original_size != (500, 500):
            print(f"警告: 原始尺寸不是 500x500，当前是 {original_size}")

        # 备份原始文件
        shutil.copy(logo_path, backup_path)
        print(f"已备份原始文件到: {backup_path}")

        # 使用 LANCZOS 算法进行高质量缩放
        # LANCZOS 是最高质量的重采样算法，保持清晰度最好
        new_size = (650, 650)
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
