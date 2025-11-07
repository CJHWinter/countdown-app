#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PWA 图标生成工具
自动将 assets/2.jpg 转换为 PWA 所需的图标尺寸
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    print("❌ 错误：需要安装 Pillow 库")
    print("   请运行：pip install pillow")
    sys.exit(1)

def generate_pwa_icons(source_image='assets/2.jpg', output_dir='assets'):
    """
    生成 PWA 所需的图标
    
    Args:
        source_image: 源图片路径
        output_dir: 输出目录
    """
    print("🎨 PWA 图标生成工具")
    print("=" * 50)
    
    # 检查源文件是否存在
    if not os.path.exists(source_image):
        print(f"❌ 错误：找不到源图片 {source_image}")
        print("   请确保 assets/2.jpg 文件存在")
        return False
    
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # 打开原图
        print(f"📂 正在加载图片：{source_image}")
        img = Image.open(source_image)
        print(f"   原图尺寸：{img.size[0]}x{img.size[1]}")
        
        # 转换为 RGB（PNG 不需要 alpha 通道，除非需要透明背景）
        if img.mode != 'RGB':
            print("   转换图片格式为 RGB...")
            img = img.convert('RGB')
        
        # 需要生成的尺寸
        sizes = [
            (192, 192, 'icon-192.png', 'Android 标准图标'),
            (512, 512, 'icon-512.png', 'Android 高清图标'),
        ]
        
        print("\n🔧 开始生成图标...")
        
        for width, height, filename, description in sizes:
            # 计算裁切区域（保持中心）
            # 先将图片调整为正方形（从中心裁切）
            source_width, source_height = img.size
            
            if source_width != source_height:
                # 裁切为正方形
                size = min(source_width, source_height)
                left = (source_width - size) // 2
                top = (source_height - size) // 2
                right = left + size
                bottom = top + size
                img_square = img.crop((left, top, right, bottom))
            else:
                img_square = img
            
            # 调整大小（使用高质量的 LANCZOS 算法）
            icon = img_square.resize((width, height), Image.Resampling.LANCZOS)
            
            # 保存
            output_path = os.path.join(output_dir, filename)
            icon.save(output_path, 'PNG', optimize=True, quality=95)
            
            # 获取文件大小
            file_size = os.path.getsize(output_path) / 1024  # KB
            print(f"   ✅ {filename:20s} ({width}x{height}) - {description}")
            print(f"      文件大小：{file_size:.1f} KB")
        
        print("\n" + "=" * 50)
        print("🎉 图标生成完成！")
        print("\n生成的文件：")
        print(f"   📁 {output_dir}/icon-192.png")
        print(f"   📁 {output_dir}/icon-512.png")
        print("\n💡 提示：")
        print("   - 这些图标将用于 PWA 应用")
        print("   - 可以在手机桌面看到这个图标")
        print("   - 建议使用色彩鲜艳、主体清晰的图片")
        print("\n🚀 下一步：")
        print("   1. 检查生成的图标是否满意")
        print("   2. 如果满意，可以部署到 GitHub Pages")
        print("   3. 部署后在手机上测试安装效果")
        
        return True
        
    except Exception as e:
        print(f"❌ 错误：生成图标时出现问题")
        print(f"   {str(e)}")
        return False

def main():
    """主函数"""
    print("\n")
    
    # 检查是否在正确的目录
    if not os.path.exists('assets'):
        print("⚠️  警告：找不到 assets 目录")
        print("   请确保在项目根目录运行此脚本")
        print()
    
    # 询问用户使用哪个图片
    print("📷 请选择源图片：")
    print("   1. assets/1.jpg（考研倒计时图标）")
    print("   2. assets/2.jpg（疯狂动物城 - 推荐）✨")
    print()
    
    choice = input("请输入选择 (1/2，直接回车默认选择 2): ").strip()
    
    if choice == '1':
        source = 'assets/1.jpg'
    else:
        source = 'assets/2.jpg'
    
    print(f"\n已选择：{source}")
    
    # 生成图标
    success = generate_pwa_icons(source_image=source)
    
    if success:
        print("\n✅ 完成！")
    else:
        print("\n❌ 生成失败")
        sys.exit(1)

if __name__ == '__main__':
    main()

